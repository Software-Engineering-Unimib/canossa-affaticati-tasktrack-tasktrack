import { supabase } from '@/lib/supabase'

export interface TaskCategory {
    id?: number
    created_at?: string
    task_id: number // FK to Tasks
    category_id: number // FK to Categories
}

export class TaskCategoryModel {
    // Ottieni tutte le relazioni task-categoria per un task
    static async findByTaskId(taskId: number): Promise<{ data: TaskCategory[] | null; error: any }> {
        const { data, error } = await supabase
            .from('TaskCategories')
            .select('*')
            .eq('task_id', taskId)

        return { data, error }
    }

    // Ottieni tutte le relazioni task-categoria per una categoria
    static async findByCategoryId(categoryId: number): Promise<{ data: TaskCategory[] | null; error: any }> {
        const { data, error } = await supabase
            .from('TaskCategories')
            .select('*')
            .eq('category_id', categoryId)

        return { data, error }
    }

    // Aggiungi una categoria a un task
    static async create(taskId: number, categoryId: number): Promise<{ data: TaskCategory | null; error: any }> {
        const { data, error } = await supabase
            .from('TaskCategories')
            .insert({ task_id: taskId, category_id: categoryId })
            .select()
            .single()

        return { data, error }
    }

    // Aggiungi multiple categorie a un task
    static async createMany(taskId: number, categoryIds: number[]): Promise<{ data: TaskCategory[] | null; error: any }> {
        const taskCategories = categoryIds.map(categoryId => ({
            task_id: taskId,
            category_id: categoryId
        }))

        const { data, error } = await supabase
            .from('TaskCategories')
            .insert(taskCategories)
            .select()

        return { data, error }
    }

    // Rimuovi una categoria da un task
    static async delete(taskId: number, categoryId: number): Promise<{ data: any; error: any }> {
        const { data, error } = await supabase
            .from('TaskCategories')
            .delete()
            .eq('task_id', taskId)
            .eq('category_id', categoryId)

        return { data, error }
    }

    // Rimuovi tutte le categorie da un task
    static async deleteByTaskId(taskId: number): Promise<{ data: any; error: any }> {
        const { data, error } = await supabase
            .from('TaskCategories')
            .delete()
            .eq('task_id', taskId)

        return { data, error }
    }

    // Aggiorna le categorie di un task (rimuove tutte e aggiunge le nuove)
    static async updateTaskCategories(taskId: number, categoryIds: number[]): Promise<{ data: TaskCategory[] | null; error: any }> {
        // Prima rimuovi tutte le categorie esistenti
        const { error: deleteError } = await supabase
            .from('TaskCategories')
            .delete()
            .eq('task_id', taskId)

        if (deleteError) return { data: null, error: deleteError }

        // Se non ci sono categorie da aggiungere, ritorna array vuoto
        if (categoryIds.length === 0) {
            return { data: [], error: null }
        }

        // Aggiungi le nuove categorie
        const taskCategories = categoryIds.map(categoryId => ({
            task_id: taskId,
            category_id: categoryId
        }))

        const { data, error } = await supabase
            .from('TaskCategories')
            .insert(taskCategories)
            .select()

        return { data, error }
    }

    // Verifica se un task ha una specifica categoria
    static async exists(taskId: number, categoryId: number): Promise<{ exists: boolean; error: any }> {
        const { data, error } = await supabase
            .from('TaskCategories')
            .select('id')
            .eq('task_id', taskId)
            .eq('category_id', categoryId)
            .single()

        return { exists: !!data, error: error?.code === 'PGRST116' ? null : error }
    }
}
