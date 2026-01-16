import { supabase } from '@/lib/supabase'

export type CategoryColor = 'blue' | 'cyan' | 'green' | 'purple' | 'orange' | 'yellow' | 'red' | 'pink' | 'slate'

export interface Category {
    id?: number
    created_at?: string
    name: string
    color: CategoryColor
    board_id: number // FK to Boards
}

export class CategoryModel {
    // Ottieni tutte le categorie
    static async findAll(): Promise<{ data: Category[] | null; error: any }> {
        const { data, error } = await supabase
            .from('Categories')
            .select('*')
            .order('name', { ascending: true })

        return { data, error }
    }

    // Ottieni tutte le categorie di una bacheca
    static async findByBoardId(boardId: number): Promise<{ data: Category[] | null; error: any }> {
        const { data, error } = await supabase
            .from('Categories')
            .select('*')
            .eq('board_id', boardId)
            .order('name', { ascending: true })

        return { data, error }
    }

    // Ottieni una categoria per ID
    static async findById(id: number): Promise<{ data: Category | null; error: any }> {
        const { data, error } = await supabase
            .from('Categories')
            .select('*')
            .eq('id', id)
            .single()

        return { data, error }
    }

    // Crea una nuova categoria
    static async create(categoryData: Omit<Category, 'id' | 'created_at'>): Promise<{ data: Category | null; error: any }> {
        const { data, error } = await supabase
            .from('Categories')
            .insert(categoryData)
            .select()
            .single()

        return { data, error }
    }

    // Crea multiple categorie (utile per la creazione di una board con categorie predefinite)
    static async createMany(categories: Omit<Category, 'id' | 'created_at'>[]): Promise<{ data: Category[] | null; error: any }> {
        const { data, error } = await supabase
            .from('Categories')
            .insert(categories)
            .select()

        return { data, error }
    }

    // Aggiorna una categoria
    static async update(id: number, categoryData: Partial<Omit<Category, 'id' | 'created_at' | 'board_id'>>): Promise<{ data: Category | null; error: any }> {
        const { data, error } = await supabase
            .from('Categories')
            .update(categoryData)
            .eq('id', id)
            .select()
            .single()

        return { data, error }
    }

    // Elimina una categoria
    static async delete(id: number): Promise<{ data: any; error: any }> {
        const { data, error } = await supabase
            .from('Categories')
            .delete()
            .eq('id', id)

        return { data, error }
    }

    // Elimina tutte le categorie di una bacheca
    static async deleteByBoardId(boardId: number): Promise<{ data: any; error: any }> {
        const { data, error } = await supabase
            .from('Categories')
            .delete()
            .eq('board_id', boardId)

        return { data, error }
    }

    // Conta le categorie di una bacheca
    static async countByBoardId(boardId: number): Promise<{ count: number | null; error: any }> {
        const { count, error } = await supabase
            .from('Categories')
            .select('*', { count: 'exact', head: true })
            .eq('board_id', boardId)

        return { count, error }
    }

    // Cerca categorie per nome in una bacheca
    static async search(boardId: number, query: string): Promise<{ data: Category[] | null; error: any }> {
        const { data, error } = await supabase
            .from('Categories')
            .select('*')
            .eq('board_id', boardId)
            .ilike('name', `%${query}%`)

        return { data, error }
    }
}
