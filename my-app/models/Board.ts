import { supabase } from '@/lib/supabase'

export type BoardTheme = 'blue' | 'green' | 'purple' | 'orange'
export type BoardIcon = 'university' | 'personal' | 'work' | 'other'

export interface Board {
    id?: number
    created_at?: string
    updated_at?: string
    title: string
    description?: string
    icon: BoardIcon
    theme: BoardTheme
    owner_id: number // FK to Users
}

export interface BoardWithStats extends Board {
    stats?: {
        deadlines: number
        inProgress: number
        completed: number
    }
    categories?: Category[]
    guests?: string[]
}

// Import per evitare dipendenze circolari
import { Category } from './Category'

export class BoardModel {
    // Ottieni tutte le bacheche
    static async findAll(): Promise<{ data: Board[] | null; error: any }> {
        const { data, error } = await supabase
            .from('Boards')
            .select('*')
            .order('created_at', { ascending: false })
        return { data, error }
    }

    // Ottieni tutte le bacheche di un utente
    static async findByUserId(userId: number): Promise<{ data: Board[] | null; error: any }> {
        const { data, error } = await supabase
            .from('Boards')
            .select('*')
            .eq('owner_id', userId)
            .order('created_at', { ascending: false })

        return { data, error }
    }

    // Ottieni una bacheca per ID
    static async findById(id: number): Promise<{ data: Board | null; error: any }> {
        const { data, error } = await supabase
            .from('Boards')
            .select('*')
            .eq('id', id)
            .single()

        return { data, error }
    }

    // Ottieni una bacheca con tutte le relazioni (categorie, guest, stats)
    static async findByIdWithRelations(id: number): Promise<{ data: BoardWithStats | null; error: any }> {
        const { data: board, error: boardError } = await supabase
            .from('Boards')
            .select(`
                *,
                Categories (*),
                BoardGuests (
                    Users (email)
                )
            `)
            .eq('id', id)
            .single()

        if (boardError) return { data: null, error: boardError }

        // Calcola le statistiche dei task
        const { data: tasks, error: tasksError } = await supabase
            .from('Tasks')
            .select('column_id, due_date')
            .eq('board_id', id)

        if (tasksError) return { data: null, error: tasksError }

        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const stats = {
            deadlines: tasks?.filter(t => {
                const dueDate = new Date(t.due_date)
                dueDate.setHours(0, 0, 0, 0)
                return dueDate.getTime() === today.getTime() && t.column_id !== 'done'
            }).length || 0,
            inProgress: tasks?.filter(t => t.column_id === 'inprogress').length || 0,
            completed: tasks?.filter(t => t.column_id === 'done').length || 0
        }

        const boardWithStats: BoardWithStats = {
            ...board,
            stats,
            categories: board.Categories || [],
            guests: board.BoardGuests?.map((g: any) => g.Users?.email).filter(Boolean) || []
        }

        return { data: boardWithStats, error: null }
    }

    // Crea una nuova bacheca
    static async create(boardData: Omit<Board, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: Board | null; error: any }> {
        const { data, error } = await supabase
            .from('Boards')
            .insert(boardData)
            .select()
            .single()

        return { data, error }
    }

    // Aggiorna una bacheca
    static async update(id: number, boardData: Partial<Omit<Board, 'id' | 'created_at' | 'updated_at'>>): Promise<{ data: Board | null; error: any }> {
        const { data, error } = await supabase
            .from('Boards')
            .update({ ...boardData, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single()

        return { data, error }
    }

    // Elimina una bacheca
    static async delete(id: number): Promise<{ data: any; error: any }> {
        const { data, error } = await supabase
            .from('Boards')
            .delete()
            .eq('id', id)

        return { data, error }
    }

    // Cerca bacheche per titolo
    static async search(userId: number, query: string): Promise<{ data: Board[] | null; error: any }> {
        const { data, error } = await supabase
            .from('Boards')
            .select('*')
            .eq('owner_id', userId)
            .ilike('title', `%${query}%`)

        return { data, error }
    }

    // Conta le bacheche di un utente
    static async countByUserId(userId: number): Promise<{ count: number | null; error: any }> {
        const { count, error } = await supabase
            .from('Boards')
            .select('*', { count: 'exact', head: true })
            .eq('owner_id', userId)

        return { count, error }
    }
}
