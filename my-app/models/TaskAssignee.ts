import { supabase } from '@/lib/supabase'

export interface TaskAssignee {
    id?: number
    created_at?: string
    task_id: number // FK to Tasks
    user_id: number // FK to Users
}

export interface TaskAssigneeWithUser extends TaskAssignee {
    user?: {
        id: number
        name: string
        surname: string
        email: string
    }
}

export class TaskAssigneeModel {
    // Ottieni tutti gli assegnatari di un task
    static async findByTaskId(taskId: number): Promise<{ data: TaskAssigneeWithUser[] | null; error: any }> {
        const { data, error } = await supabase
            .from('TaskAssignees')
            .select(`
                *,
                Users (id, name, surname, email)
            `)
            .eq('task_id', taskId)

        const formattedData = data?.map(item => ({
            ...item,
            user: item.Users
        })) || null

        return { data: formattedData, error }
    }

    // Ottieni tutti i task assegnati a un utente
    static async findByUserId(userId: number): Promise<{ data: TaskAssignee[] | null; error: any }> {
        const { data, error } = await supabase
            .from('TaskAssignees')
            .select('*')
            .eq('user_id', userId)

        return { data, error }
    }

    // Assegna un utente a un task
    static async create(taskId: number, userId: number): Promise<{ data: TaskAssignee | null; error: any }> {
        const { data, error } = await supabase
            .from('TaskAssignees')
            .insert({ task_id: taskId, user_id: userId })
            .select()
            .single()

        return { data, error }
    }

    // Assegna multiple utenti a un task
    static async createMany(taskId: number, userIds: number[]): Promise<{ data: TaskAssignee[] | null; error: any }> {
        const taskAssignees = userIds.map(userId => ({
            task_id: taskId,
            user_id: userId
        }))

        const { data, error } = await supabase
            .from('TaskAssignees')
            .insert(taskAssignees)
            .select()

        return { data, error }
    }

    // Rimuovi un utente da un task
    static async delete(taskId: number, userId: number): Promise<{ data: any; error: any }> {
        const { data, error } = await supabase
            .from('TaskAssignees')
            .delete()
            .eq('task_id', taskId)
            .eq('user_id', userId)

        return { data, error }
    }

    // Rimuovi tutti gli assegnatari da un task
    static async deleteByTaskId(taskId: number): Promise<{ data: any; error: any }> {
        const { data, error } = await supabase
            .from('TaskAssignees')
            .delete()
            .eq('task_id', taskId)

        return { data, error }
    }

    // Aggiorna gli assegnatari di un task (rimuove tutti e aggiunge i nuovi)
    static async updateTaskAssignees(taskId: number, userIds: number[]): Promise<{ data: TaskAssignee[] | null; error: any }> {
        // Prima rimuovi tutti gli assegnatari esistenti
        const { error: deleteError } = await supabase
            .from('TaskAssignees')
            .delete()
            .eq('task_id', taskId)

        if (deleteError) return { data: null, error: deleteError }

        // Se non ci sono utenti da aggiungere, ritorna array vuoto
        if (userIds.length === 0) {
            return { data: [], error: null }
        }

        // Aggiungi i nuovi assegnatari
        const taskAssignees = userIds.map(userId => ({
            task_id: taskId,
            user_id: userId
        }))

        const { data, error } = await supabase
            .from('TaskAssignees')
            .insert(taskAssignees)
            .select()

        return { data, error }
    }

    // Verifica se un utente è assegnato a un task
    static async exists(taskId: number, userId: number): Promise<{ exists: boolean; error: any }> {
        const { data, error } = await supabase
            .from('TaskAssignees')
            .select('id')
            .eq('task_id', taskId)
            .eq('user_id', userId)
            .single()

        return { exists: !!data, error: error?.code === 'PGRST116' ? null : error }
    }

    // Conta gli assegnatari di un task
    static async countByTaskId(taskId: number): Promise<{ count: number | null; error: any }> {
        const { count, error } = await supabase
            .from('TaskAssignees')
            .select('*', { count: 'exact', head: true })
            .eq('task_id', taskId)

        return { count, error }
    }
}
