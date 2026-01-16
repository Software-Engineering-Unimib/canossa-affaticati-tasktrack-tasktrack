import { supabase } from '@/lib/supabase'

export interface BoardGuest {
    id?: number
    created_at?: string
    board_id: number // FK to Boards
    user_id: number // FK to Users
    role?: 'viewer' | 'editor' // Ruolo del guest nella bacheca
}

export interface BoardGuestWithUser extends BoardGuest {
    user?: {
        id: number
        name: string
        surname: string
        email: string
    }
}

export interface BoardGuestWithBoard extends BoardGuest {
    board?: {
        id: number
        title: string
        theme: string
        icon: string
    }
}

export class BoardGuestModel {
    // Ottieni tutti i guest di una bacheca
    static async findByBoardId(boardId: number): Promise<{ data: BoardGuestWithUser[] | null; error: any }> {
        const { data, error } = await supabase
            .from('BoardGuests')
            .select(`
                *,
                Users (id, name, surname, email)
            `)
            .eq('board_id', boardId)

        const formattedData = data?.map(item => ({
            ...item,
            user: item.Users
        })) || null

        return { data: formattedData, error }
    }

    // Ottieni tutte le bacheche a cui un utente è invitato
    static async findByUserId(userId: number): Promise<{ data: BoardGuestWithBoard[] | null; error: any }> {
        const { data, error } = await supabase
            .from('BoardGuests')
            .select(`
                *,
                Boards (id, title, theme, icon)
            `)
            .eq('user_id', userId)

        const formattedData = data?.map(item => ({
            ...item,
            board: item.Boards
        })) || null

        return { data: formattedData, error }
    }

    // Invita un utente a una bacheca tramite email
    static async inviteByEmail(boardId: number, email: string, role: 'viewer' | 'editor' = 'viewer'): Promise<{ data: BoardGuest | null; error: any }> {
        // Prima trova l'utente per email
        const { data: user, error: userError } = await supabase
            .from('Users')
            .select('id')
            .eq('email', email)
            .single()

        if (userError || !user) {
            return { data: null, error: { message: 'User not found with this email' } }
        }

        // Verifica che l'utente non sia già un guest
        const { exists } = await this.exists(boardId, user.id)
        if (exists) {
            return { data: null, error: { message: 'User is already a guest of this board' } }
        }

        // Aggiungi il guest
        const { data, error } = await supabase
            .from('BoardGuests')
            .insert({ board_id: boardId, user_id: user.id, role })
            .select()
            .single()

        return { data, error }
    }

    // Invita un utente a una bacheca tramite ID
    static async create(boardId: number, userId: number, role: 'viewer' | 'editor' = 'viewer'): Promise<{ data: BoardGuest | null; error: any }> {
        const { data, error } = await supabase
            .from('BoardGuests')
            .insert({ board_id: boardId, user_id: userId, role })
            .select()
            .single()

        return { data, error }
    }

    // Invita multiple utenti a una bacheca
    static async createMany(boardId: number, userIds: number[], role: 'viewer' | 'editor' = 'viewer'): Promise<{ data: BoardGuest[] | null; error: any }> {
        const boardGuests = userIds.map(userId => ({
            board_id: boardId,
            user_id: userId,
            role
        }))

        const { data, error } = await supabase
            .from('BoardGuests')
            .insert(boardGuests)
            .select()

        return { data, error }
    }

    // Aggiorna il ruolo di un guest
    static async updateRole(boardId: number, userId: number, role: 'viewer' | 'editor'): Promise<{ data: BoardGuest | null; error: any }> {
        const { data, error } = await supabase
            .from('BoardGuests')
            .update({ role })
            .eq('board_id', boardId)
            .eq('user_id', userId)
            .select()
            .single()

        return { data, error }
    }

    // Rimuovi un guest da una bacheca
    static async delete(boardId: number, userId: number): Promise<{ data: any; error: any }> {
        const { data, error } = await supabase
            .from('BoardGuests')
            .delete()
            .eq('board_id', boardId)
            .eq('user_id', userId)

        return { data, error }
    }

    // Rimuovi un guest per email
    static async deleteByEmail(boardId: number, email: string): Promise<{ data: any; error: any }> {
        // Prima trova l'utente per email
        const { data: user, error: userError } = await supabase
            .from('Users')
            .select('id')
            .eq('email', email)
            .single()

        if (userError || !user) {
            return { data: null, error: { message: 'User not found with this email' } }
        }

        return this.delete(boardId, user.id)
    }

    // Rimuovi tutti i guest da una bacheca
    static async deleteByBoardId(boardId: number): Promise<{ data: any; error: any }> {
        const { data, error } = await supabase
            .from('BoardGuests')
            .delete()
            .eq('board_id', boardId)

        return { data, error }
    }

    // Verifica se un utente è guest di una bacheca
    static async exists(boardId: number, userId: number): Promise<{ exists: boolean; error: any }> {
        const { data, error } = await supabase
            .from('BoardGuests')
            .select('id')
            .eq('board_id', boardId)
            .eq('user_id', userId)
            .single()

        return { exists: !!data, error: error?.code === 'PGRST116' ? null : error }
    }

    // Verifica se un utente ha accesso a una bacheca (owner o guest)
    static async hasAccess(boardId: number, userId: number): Promise<{ hasAccess: boolean; role: 'owner' | 'editor' | 'viewer' | null; error: any }> {
        // Verifica se è owner
        const { data: board, error: boardError } = await supabase
            .from('Boards')
            .select('owner_id')
            .eq('id', boardId)
            .single()

        if (boardError) return { hasAccess: false, role: null, error: boardError }

        if (board.owner_id === userId) {
            return { hasAccess: true, role: 'owner', error: null }
        }

        // Verifica se è guest
        const { data: guest, error: guestError } = await supabase
            .from('BoardGuests')
            .select('role')
            .eq('board_id', boardId)
            .eq('user_id', userId)
            .single()

        if (guestError?.code === 'PGRST116') {
            // Non trovato = nessun accesso
            return { hasAccess: false, role: null, error: null }
        }

        if (guestError) return { hasAccess: false, role: null, error: guestError }

        return { hasAccess: true, role: guest.role, error: null }
    }

    // Conta i guest di una bacheca
    static async countByBoardId(boardId: number): Promise<{ count: number | null; error: any }> {
        const { count, error } = await supabase
            .from('BoardGuests')
            .select('*', { count: 'exact', head: true })
            .eq('board_id', boardId)

        return { count, error }
    }

    // Ottieni le email di tutti i guest di una bacheca
    static async getGuestEmails(boardId: number): Promise<{ data: string[] | null; error: any }> {
        const { data, error } = await supabase
            .from('BoardGuests')
            .select(`
                Users (email)
            `)
            .eq('board_id', boardId)

        const emails = data?.map(item => item.Users?.email).filter(Boolean) as string[] || null

        return { data: emails, error }
    }
}
