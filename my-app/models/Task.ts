/**
 * @fileoverview Repository per la gestione dei task.
 *
 * Gestisce operazioni CRUD sui task, inclusi allegati e commenti.
 *
 * @module models/Task
 */

import { supabase } from '@/lib/supabase';
import { Task, TaskAssignee } from '@/items/Task';
import { Category } from '@/items/Category';
import { PriorityLevel } from '@/items/Priority';
import { ColumnId } from '@/items/Task';

/**
 * Allegato di un task.
 */
export interface TaskAttachment {
    id: number;
    name: string;
    file_path: string;
    file_size: number;
    file_type: string;
    created_at: string;
    /** URL pubblico per il download (calcolato runtime) */
    publicUrl?: string;
}

/**
 * Commento di un task.
 */
export interface TaskComment {
    id: number;
    text: string;
    created_at: string;
    author: {
        id: string;
        name: string;
        surname: string;
        avatar_url: string;
    };
}

/**
 * Dati per la creazione di un task.
 */
interface CreateTaskData {
    title: string;
    description: string;
    priority: PriorityLevel;
    columnId: ColumnId;
    dueDate: Date;
    assigneeIds: string[];
    categoryIds: (string | number)[];
}

/**
 * Dati per l'aggiornamento di un task.
 * Tutti i campi sono opzionali.
 */
interface UpdateTaskData {
    title?: string;
    description?: string;
    priority?: PriorityLevel;
    columnId?: ColumnId;
    dueDate?: Date;
    assigneeIds?: string[];
    categoryIds?: (string | number)[];
}

/** Nome del bucket Storage per gli allegati */
const ATTACHMENTS_BUCKET = 'task-attachments';

/**
 * Repository per le operazioni sui task.
 *
 * Pattern: Repository
 */
export class TaskModel {
    // ═══════════════════════════════════════════════════════════
    // LETTURA
    // ═══════════════════════════════════════════════════════════

    /**
     * Ottiene tutti i task di una bacheca.
     * Include categorie, assegnatari e conteggi.
     *
     * @param boardId - ID della bacheca
     * @returns Array di task ordinati per data di scadenza
     */
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

    /**
     * Ottiene gli allegati di un task con URL pubblici.
     */
    static async getAttachments(taskId: string | number): Promise<TaskAttachment[]> {
        const { data, error } = await supabase
            .from('Attachments')
            .select('*')
            .eq('task_id', taskId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Errore fetch attachments:', error);
            return [];
        }

        return data.map(att => this.attachPublicUrl(att));
    }

    /**
     * Ottiene i commenti di un task.
     */
    static async getComments(taskId: string | number): Promise<TaskComment[]> {
        const { data, error } = await supabase
            .from('Comments')
            .select(`
                id, text, created_at,
                author:Profiles(id, name, surname, avatar_url)
            `)
            .eq('task_id', taskId)
            .order('created_at', { ascending: true });

        if (error) {
            return [];
        }

        return data as unknown as TaskComment[];
    }

    // ═══════════════════════════════════════════════════════════
    // SCRITTURA
    // ═══════════════════════════════════════════════════════════

    /**
     * Crea un nuovo task con categorie e assegnatari.
     *
     * @param boardId - ID della bacheca
     * @param data - Dati del task
     * @returns Task creato
     * @throws Error se l'utente non è autenticato
     */
    static async createTask(boardId: string, data: CreateTaskData) {
        const userId = await this.getCurrentUserId();

        // 1. Crea il task
        const { data: task, error } = await supabase
            .from('Tasks')
            .insert({
                title: data.title,
                description: data.description,
                priority: data.priority,
                due_date: data.dueDate.toISOString(),
                column_id: data.columnId,
                board_id: boardId,
                created_by: userId,
            })
            .select()
            .single();

        if (error) throw error;

        // 2. Crea relazioni (in parallelo)
        await Promise.all([
            this.insertTaskCategories(task.id, data.categoryIds),
            this.insertTaskAssignees(task.id, data.assigneeIds),
        ]);

        return task;
    }

    /**
     * Aggiorna un task esistente.
     *
     * Strategia per relazioni: Delete-All-Insert-New
     */
    static async updateTask(taskId: string | number, data: UpdateTaskData): Promise<void> {
        // 1. Prepara gli aggiornamenti base
        const updates = this.buildUpdatePayload(data);

        if (Object.keys(updates).length > 0) {
            const { error } = await supabase
                .from('Tasks')
                .update(updates)
                .eq('id', taskId);

            if (error) throw error;
        }

        // 2. Aggiorna relazioni se specificate
        const relationUpdates: Promise<void>[] = [];

        if (data.categoryIds !== undefined) {
            relationUpdates.push(this.syncTaskCategories(taskId, data.categoryIds));
        }

        if (data.assigneeIds !== undefined) {
            relationUpdates.push(this.syncTaskAssignees(taskId, data.assigneeIds));
        }

        await Promise.all(relationUpdates);
    }

    /**
     * Sposta un task in una nuova colonna.
     */
    static async updateTaskColumn(taskId: string | number, newColumnId: ColumnId): Promise<void> {
        await supabase
            .from('Tasks')
            .update({ column_id: newColumnId })
            .eq('id', taskId);
    }

    /**
     * Elimina un task e i suoi allegati dallo storage.
     *
     * @remarks
     * Le relazioni DB (commenti, categorie, assegnatari) vengono
     * eliminate automaticamente tramite ON DELETE CASCADE.
     */
    static async deleteTask(taskId: string | number): Promise<void> {
        // 1. Elimina file dallo storage
        await this.deleteTaskAttachmentFiles(taskId);

        // 2. Elimina il task (cascade elimina relazioni)
        const { error } = await supabase
            .from('Tasks')
            .delete()
            .eq('id', taskId);

        if (error) throw error;
    }

    // ═══════════════════════════════════════════════════════════
    // ALLEGATI
    // ═══════════════════════════════════════════════════════════

    /**
     * Carica un allegato per un task.
     *
     * @returns Dati dell'allegato creato
     */
    static async uploadAttachment(taskId: string | number, file: File) {
        const userId = await this.getCurrentUserId();

        // 1. Upload su Storage
        const filePath = this.generateAttachmentPath(taskId, file.name);

        const { error: uploadError } = await supabase.storage
            .from(ATTACHMENTS_BUCKET)
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        // 2. Crea record nel DB
        const { data, error: dbError } = await supabase
            .from('Attachments')
            .insert({
                name: file.name,
                file_path: filePath,
                file_size: file.size,
                file_type: file.type,
                task_id: taskId,
                uploaded_by: userId,
            })
            .select()
            .single();

        if (dbError) throw dbError;

        return data;
    }

    /**
     * Elimina un allegato da storage e database.
     */
    static async deleteAttachment(attachmentId: number, filePath: string): Promise<void> {
        await supabase.storage.from(ATTACHMENTS_BUCKET).remove([filePath]);
        await supabase.from('Attachments').delete().eq('id', attachmentId);
    }

    // ═══════════════════════════════════════════════════════════
    // COMMENTI
    // ═══════════════════════════════════════════════════════════

    /**
     * Aggiunge un commento a un task.
     *
     * @returns Commento creato con dati autore
     */
    static async addComment(taskId: string | number, text: string) {
        const userId = await this.getCurrentUserId();

        const { data, error } = await supabase
            .from('Comments')
            .insert({
                text,
                task_id: taskId,
                author_id: userId,
            })
            .select('*, author:Profiles(*)')
            .single();

        if (error) throw error;

        return data;
    }

    // ═══════════════════════════════════════════════════════════
    // METODI PRIVATI - UTILITY
    // ═══════════════════════════════════════════════════════════

    /**
     * Ottiene l'ID dell'utente corrente o lancia errore.
     */
    private static async getCurrentUserId(): Promise<string> {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            throw new Error('Utente non autenticato');
        }

        return user.id;
    }

    /**
     * Genera un path univoco per un allegato.
     */
    private static generateAttachmentPath(taskId: string | number, fileName: string): string {
        const extension = fileName.split('.').pop() ?? 'bin';
        return `${taskId}/${Date.now()}.${extension}`;
    }

    /**
     * Aggiunge l'URL pubblico a un record allegato.
     */
    private static attachPublicUrl(attachment: any): TaskAttachment {
        const { data } = supabase.storage
            .from(ATTACHMENTS_BUCKET)
            .getPublicUrl(attachment.file_path);

        return {
            ...attachment,
            publicUrl: data.publicUrl,
        };
    }

    // ═══════════════════════════════════════════════════════════
    // METODI PRIVATI - RELAZIONI
    // ═══════════════════════════════════════════════════════════

    /**
     * Inserisce le categorie per un nuovo task.
     */
    private static async insertTaskCategories(
        taskId: number,
        categoryIds: (string | number)[]
    ): Promise<void> {
        if (categoryIds.length === 0) return;

        const inserts = categoryIds.map(catId => ({
            task_id: taskId,
            category_id: catId,
        }));

        await supabase.from('TaskCategories').insert(inserts);
    }

    /**
     * Inserisce gli assegnatari per un nuovo task.
     */
    private static async insertTaskAssignees(
        taskId: number,
        assigneeIds: string[]
    ): Promise<void> {
        if (assigneeIds.length === 0) return;

        const inserts = assigneeIds.map(userId => ({
            task_id: taskId,
            user_id: userId,
        }));

        await supabase.from('TaskAssignees').insert(inserts);
    }

    /**
     * Sincronizza le categorie di un task (delete + insert).
     */
    private static async syncTaskCategories(
        taskId: string | number,
        categoryIds: (string | number)[]
    ): Promise<void> {
        await supabase.from('TaskCategories').delete().eq('task_id', taskId);

        if (categoryIds.length > 0) {
            const inserts = categoryIds.map(catId => ({
                task_id: taskId,
                category_id: catId
            }));
            await supabase.from('TaskCategories').insert(inserts);
        }
    }

    /**
     * Sincronizza gli assegnatari di un task (delete + insert).
     */
    private static async syncTaskAssignees(
        taskId: string | number,
        assigneeIds: string[]
    ): Promise<void> {
        await supabase.from('TaskAssignees').delete().eq('task_id', taskId);

        if (assigneeIds.length > 0) {
            const inserts = assigneeIds.map(uid => ({
                task_id: taskId,
                user_id: uid
            }));
            await supabase.from('TaskAssignees').insert(inserts);
        }
    }

    /**
     * Elimina i file allegati dallo storage.
     */
    private static async deleteTaskAttachmentFiles(taskId: string | number): Promise<void> {
        const { data: attachments } = await supabase
            .from('Attachments')
            .select('file_path')
            .eq('task_id', taskId);

        if (attachments && attachments.length > 0) {
            const paths = attachments.map(a => a.file_path);
            await supabase.storage.from(ATTACHMENTS_BUCKET).remove(paths);
        }
    }

    /**
     * Costruisce il payload per l'update di un task.
     */
    private static buildUpdatePayload(data: UpdateTaskData): Record<string, any> {
        const updates: Record<string, any> = {};

        if (data.title !== undefined) updates.title = data.title;
        if (data.description !== undefined) updates.description = data.description;
        if (data.priority !== undefined) updates.priority = data.priority;
        if (data.columnId !== undefined) updates.column_id = data.columnId;
        if (data.dueDate !== undefined) updates.due_date = data.dueDate.toISOString();

        // Aggiorna timestamp solo se ci sono modifiche
        if (Object.keys(updates).length > 0) {
            updates.updated_at = new Date().toISOString();
        }

        return updates;
    }

    // ═══════════════════════════════════════════════════════════
    // MAPPING
    // ═══════════════════════════════════════════════════════════

    /**
     * Mappa i dati grezzi del database nel modello Task.
     */
    private static mapDbToTask(dbTask: any): Task {
        const assignees: TaskAssignee[] = (dbTask.assignees ?? []).map((a: any) => ({
            id: a.user.id,
            name: a.user.name,
            surname: a.user.surname,
            avatar_url: a.user.avatar_url,
            email: '',
        }));

        const categories: Category[] = (dbTask.categories ?? [])
            .map((c: any) => c.category)
            .filter(Boolean);

        return {
            id: String(dbTask.id),
            title: dbTask.title,
            description: dbTask.description ?? '',
            priority: dbTask.priority as PriorityLevel,
            columnId: dbTask.column_id as ColumnId,
            dueDate: dbTask.due_date,
            assignees,
            categories,
            attachments: dbTask.attachments?.length ?? 0,
            comments: dbTask.comments?.length ?? 0,
        };
    }
}