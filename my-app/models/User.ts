import { supabase } from '@/lib/supabase'

export interface User {
    id?: number
    created_at?: string
    name: string
    surname: string
    email: string
    password: string
}

export class UserModel {
    // Ottieni tutti gli utenti
    static async findAll(): Promise<{ data: User[] | null; error: any }> {
        const { data, error } = await supabase
            .from('Users')
            .select('*')
            .order('created_at', { ascending: false })

        return { data, error }
    }

    // Ottieni un utente per ID
    static async findById(id: number): Promise<{ data: User | null; error: any }> {
        const { data, error } = await supabase
            .from('Users')
            .select('*')
            .eq('id', id)
            .single()

        return { data, error }
    }

    // Ottieni un utente per email
    static async findByEmail(email: string): Promise<{ data: User | null; error: any }> {
        const { data, error } = await supabase
            .from('Users')
            .select('*')
            .eq('email', email)
            .single()

        return { data, error }
    }

    // Crea un nuovo utente
    static async create(userData: Omit<User, 'id' | 'created_at'>): Promise<{ data: User | null; error: any }> {
        const { data, error } = await supabase
            .from('Users')
            .insert(userData)
            .select()
            .single()

        return { data, error }
    }

    // Aggiorna un utente
    static async update(id: number, userData: Partial<Omit<User, 'id' | 'created_at'>>): Promise<{ data: User | null; error: any }> {
        const { data, error } = await supabase
            .from('Users')
            .update(userData)
            .eq('id', id)
            .select()
            .single()

        return { data, error }
    }

    // Elimina un utente
    static async delete(id: number): Promise<{ data: any; error: any }> {
        const { data, error } = await supabase
            .from('Users')
            .delete()
            .eq('id', id)

        return { data, error }
    }

    // Conta tutti gli utenti
    static async count(): Promise<{ count: number | null; error: any }> {
        const { count, error } = await supabase
            .from('Users')
            .select('*', { count: 'exact', head: true })

        return { count, error }
    }

    // Cerca utenti per nome o cognome
    static async search(query: string): Promise<{ data: User[] | null; error: any }> {
        const { data, error } = await supabase
            .from('Users')
            .select('*')
            .or(`name.ilike.%${query}%,surname.ilike.%${query}%,email.ilike.%${query}%`)

        return { data, error }
    }
}