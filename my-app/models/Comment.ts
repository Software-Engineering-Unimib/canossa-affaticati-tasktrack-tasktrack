import { supabase } from '@/lib/supabase'

export interface Comment {
    id?: number
    created_at?: string
    updated_at?: string
    text: string
    task_id: number // FK to Tasks
    author_id: number // FK to Users
}

export interface CommentWithAuthor extends Comment {
    author?: {
        id: number
        name: string
        surname: string
        email: string
    }
}

export class CommentModel {
    // Ottieni tutti i commenti di un task
    static async findByTaskId(taskId: number): Promise<{ data: CommentWithAuthor[] | null; error: any }> {
        const { data, error } = await supabase
            .from('Comments')
            .select(`
                *,
                Users (id, name, surname, email)
            `)
            .eq('task_id', taskId)
            .order('created_at', { ascending: true })

        const formattedData = data?.map(item => ({
            ...item,
            author: item.Users
        })) || null

        return { data: formattedData, error }
    }

    // Ottieni un commento per ID
    static async findById(id: number): Promise<{ data: CommentWithAuthor | null; error: any }> {
        const { data, error } = await supabase
            .from('Comments')
            .select(`
                *,
                Users (id, name, surname, email)
            `)
            .eq('id', id)
            .single()

        const formattedData = data ? {
            ...data,
            author: data.Users
        } : null

        return { data: formattedData, error }
    }

    // Crea un nuovo commento
    static async create(commentData: Omit<Comment, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: Comment | null; error: any }> {
        const { data, error } = await supabase
            .from('Comments')
            .insert(commentData)
            .select()
            .single()

        return { data, error }
    }

    // Aggiorna un commento
    static async update(id: number, text: string): Promise<{ data: Comment | null; error: any }> {
        const { data, error } = await supabase
            .from('Comments')
            .update({ text, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single()

        return { data, error }
    }

    // Elimina un commento
    static async delete(id: number): Promise<{ data: any; error: any }> {
        const { data, error } = await supabase
            .from('Comments')
            .delete()
            .eq('id', id)

        return { data, error }
    }

    // Elimina tutti i commenti di un task
    static async deleteByTaskId(taskId: number): Promise<{ data: any; error: any }> {
        const { data, error } = await supabase
            .from('Comments')
            .delete()
            .eq('task_id', taskId)

        return { data, error }
    }

    // Conta i commenti di un task
    static async countByTaskId(taskId: number): Promise<{ count: number | null; error: any }> {
        const { count, error } = await supabase
            .from('Comments')
            .select('*', { count: 'exact', head: true })
            .eq('task_id', taskId)

        return { count, error }
    }

    // Ottieni gli ultimi N commenti di un task
    static async findLatestByTaskId(taskId: number, limit: number = 5): Promise<{ data: CommentWithAuthor[] | null; error: any }> {
        const { data, error } = await supabase
            .from('Comments')
            .select(`
                *,
                Users (id, name, surname, email)
            `)
            .eq('task_id', taskId)
            .order('created_at', { ascending: false })
            .limit(limit)

        const formattedData = data?.map(item => ({
            ...item,
            author: item.Users
        })).reverse() || null // Reverse per avere ordine cronologico

        return { data: formattedData, error }
    }

    // Ottieni tutti i commenti di un utente
    static async findByAuthorId(authorId: number): Promise<{ data: Comment[] | null; error: any }> {
        const { data, error } = await supabase
            .from('Comments')
            .select('*')
            .eq('author_id', authorId)
            .order('created_at', { ascending: false })

        return { data, error }
    }

    // Verifica se un utente è l'autore di un commento
    static async isAuthor(commentId: number, userId: number): Promise<{ isAuthor: boolean; error: any }> {
        const { data, error } = await supabase
            .from('Comments')
            .select('author_id')
            .eq('id', commentId)
            .single()

        return { isAuthor: data?.author_id === userId, error }
    }
}
