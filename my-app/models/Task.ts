import { supabase } from '@/lib/supabase'
import {Task, TaskAssignees} from '@/items/Task'
import { UserProfile } from '@/models/User'
import { Category } from '@/items/Category'
import { PriorityLevel } from "@/items/Priority";
import { ColumnId } from "@/items/Task";

// Estendiamo l'interfaccia Task per includere i file nel formato DB se necessario
export interface TaskAttachment {
    id: number;
    name: string;
    file_path: string;
    file_size: number;
    file_type: string;
    created_at: string;
    publicUrl?: string; // Calcolato al volo
}

export interface TaskComment {
    id: number;
    text: string;
    created_at: string;
    author: {
        id: string;
        name: string;
        surname: string;
        avatar_url: string;
    }
}

export class TaskModel {

    // --- LETTURA ---

    static async getTasksByBoardId(boardId: string): Promise<Task[]> {
        const { data, error } = await supabase
            .from('Tasks')
            .select(`
                *,
                categories:TaskCategories(
                    category:Categories(*)
                ),
                assignees:TaskAssignees(
                    user:Profiles(*)
                ),
                comments:Comments(id),
                attachments:Attachments(*)
            `)
            .eq('board_id', boardId)
            .order('due_date', { ascending: true });

        if (error) {
            console.error('Errore fetch tasks:', error);
            return [];
        }

        return data.map(dbTask => this.mapDbToTask(dbTask));
    }

    // --- CREAZIONE ---

    static async createTask(
        boardId: string,
        data: {
            title: string;
            description: string;
            priority: PriorityLevel;
            columnId: ColumnId;
            dueDate: Date;
            assigneeIds: string[];
            categoryIds: (string | number)[];
        }
    ) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");

        // 1. Crea il Task
        const { data: task, error } = await supabase
            .from('Tasks')
            .insert({
                title: data.title,
                description: data.description,
                priority: data.priority,
                due_date: data.dueDate.toISOString(),
                column_id: data.columnId,
                board_id: boardId,
                created_by: user.id
            })
            .select()
            .single();

        if (error) throw error;

        // 2. Inserisci Categorie collegate
        if (data.categoryIds.length > 0) {
            const catInserts = data.categoryIds.map(catId => ({
                task_id: task.id,
                category_id: catId
            }));
            await supabase.from('TaskCategories').insert(catInserts);
        }

        // 3. Inserisci Assegnatari
        if (data.assigneeIds.length > 0) {
            const assignInserts = data.assigneeIds.map(userId => ({
                task_id: task.id,
                user_id: userId
            }));
            await supabase.from('TaskAssignees').insert(assignInserts);
        }

        return task;
    }

    // --- AGGIORNAMENTO ---

    static async updateTask(
        taskId: string | number,
        data: {
            title?: string;
            description?: string;
            priority?: PriorityLevel;
            columnId?: ColumnId;
            dueDate?: Date;
            assigneeIds?: string[];
            categoryIds?: (string | number)[];
        }
    ) {
        // 1. Aggiorna campi base
        const updates: any = {};
        if (data.title) updates.title = data.title;
        if (data.description !== undefined) updates.description = data.description;
        if (data.priority) updates.priority = data.priority;
        if (data.columnId) updates.column_id = data.columnId;
        if (data.dueDate) updates.due_date = data.dueDate.toISOString();
        // Aggiorna timestamp
        updates.updated_at = new Date().toISOString();

        if (Object.keys(updates).length > 0) {
            const { error } = await supabase.from('Tasks').update(updates).eq('id', taskId);
            if (error) throw error;
        }

        // 2. Aggiorna Relazioni (Strategia: Cancella tutto e reinserisci)

        // Categorie
        if (data.categoryIds) {
            await supabase.from('TaskCategories').delete().eq('task_id', taskId);
            if (data.categoryIds.length > 0) {
                const inserts = data.categoryIds.map(cid => ({ task_id: taskId, category_id: cid }));
                await supabase.from('TaskCategories').insert(inserts);
            }
        }

        // Assegnatari
        if (data.assigneeIds) {
            await supabase.from('TaskAssignees').delete().eq('task_id', taskId);
            if (data.assigneeIds.length > 0) {
                const inserts = data.assigneeIds.map(uid => ({ task_id: taskId, user_id: uid }));
                await supabase.from('TaskAssignees').insert(inserts);
            }
        }
    }

    static async updateTaskColumn(taskId: string | number, newColumnId: ColumnId) {
        await supabase.from('Tasks').update({ column_id: newColumnId }).eq('id', taskId);
    }

    static async deleteTask(taskId: string | number) {
        // Nota: Grazie al "ON DELETE CASCADE" nel DB, le relazioni (commenti, allegati, assignees)
        // vengono eliminate automaticamente dal DB. Dobbiamo però pulire lo Storage dei file.

        // 1. Recupera gli allegati per eliminare i file da S3
        const { data: attachments } = await supabase.from('Attachments').select('file_path').eq('task_id', taskId);

        if (attachments && attachments.length > 0) {
            const paths = attachments.map(a => a.file_path);
            await supabase.storage.from('task-attachments').remove(paths);
        }

        // 2. Elimina il task
        const { error } = await supabase.from('Tasks').delete().eq('id', taskId);
        if (error) throw error;
    }

    // --- GESTIONE FILE (ALLEGATI) ---

    static async uploadAttachment(taskId: string | number, file: File) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("No user");

        // 1. Upload su Supabase Storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${taskId}/${Date.now()}.${fileExt}`;
        const filePath = fileName;

        const { error: uploadError } = await supabase.storage
            .from('task-attachments')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        // 2. Inserisci record nel DB
        const { data, error: dbError } = await supabase
            .from('Attachments')
            .insert({
                name: file.name,
                file_path: filePath,
                file_size: file.size,
                file_type: file.type,
                task_id: taskId,
                uploaded_by: user.id
            })
            .select()
            .single();

        if (dbError) throw dbError;
        return data;
    }

    static async deleteAttachment(attachmentId: number, filePath: string) {
        // 1. Rimuovi da Storage
        await supabase.storage.from('task-attachments').remove([filePath]);
        // 2. Rimuovi da DB
        await supabase.from('Attachments').delete().eq('id', attachmentId);
    }

    // --- GESTIONE COMMENTI ---

    static async addComment(taskId: string | number, text: string) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("No user");

        const { data, error } = await supabase
            .from('Comments')
            .insert({
                text,
                task_id: taskId,
                author_id: user.id
            })
            .select(`*, author:Profiles(*)`) // Ritorna subito l'autore popolato
            .single();

        if (error) throw error;
        return data;
    }

    static async getComments(taskId: string | number): Promise<TaskComment[]> {
        const { data, error } = await supabase
            .from('Comments')
            .select(`
                id, text, created_at,
                author:Profiles(id, name, surname, avatar_url)
            `)
            .eq('task_id', taskId)
            .order('created_at', { ascending: true }); // Dal più vecchio al più recente

        if (error) return [];
        return data as unknown as TaskComment[];
    }

    // --- HELPER MAPPING ---

    private static mapDbToTask(dbTask: any): Task {
        const assignees: TaskAssignees[] = dbTask.assignees?.map((a: any) => ({
            id: a.user.id,
            name: a.user.name,
            surname: a.user.surname,
            avatar_url: a.user.avatar_url,
            email: ''
        })) || [];

        const categories = dbTask.categories?.map((c: any) => c.category) || [];

        // Mappiamo gli allegati
        const attachments = (dbTask.attachments || []).map((att: any) => {
            const { data } = supabase.storage.from('task-attachments').getPublicUrl(att.file_path);
            return {
                ...att,
                publicUrl: data.publicUrl
            };
        });

        // Contiamo i commenti se non li abbiamo scaricati tutti, o usiamo la length
        const commentsCount = dbTask.comments ? dbTask.comments.length : 0;

        return {
            id: String(dbTask.id),
            title: dbTask.title,
            description: dbTask.description || '',
            priority: dbTask.priority as PriorityLevel,
            columnId: dbTask.column_id as ColumnId,
            dueDate: dbTask.due_date,
            assignees: assignees,
            categories: categories,
            attachments: attachments.length,
            comments: commentsCount // I commenti full li carichiamo on demand o qui se servono subito
        };
    }
}