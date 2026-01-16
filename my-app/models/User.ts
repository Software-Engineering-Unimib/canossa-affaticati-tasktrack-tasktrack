import { supabase } from '@/lib/supabase'

// Interfaccia allineata con la tabella "Profiles" e auth.users
export interface UserProfile {
    id: string       // UUID
    name: string
    surname: string
    email?: string   // Preso da auth.users
    avatar_url?: string
    created_at?: string
}

export class UserModel {
    // ==========================================
    // SEZIONE 1: AUTENTICAZIONE (Auth)
    // ==========================================

    // Login
    static async signIn(email: string, password: string) {
        return await supabase.auth.signInWithPassword({ email, password })
    }

    // Logout
    static async signOut() {
        return await supabase.auth.signOut()
    }

    // Recupera la sessione attuale (utile per middleware o check veloci)
    static async getSession() {
        return await supabase.auth.getSession()
    }

    // ==========================================
    // SEZIONE 2: GESTIONE DATI (Tabella Profiles)
    // ==========================================

    /**
     * Ottiene il profilo completo dell'utente loggato.
     * Unisce i dati anagrafici (Profiles) con l'email (Auth).
     */
    static async getCurrentProfile(): Promise<UserProfile | null> {
        // 1. Ottieni l'utente autenticato da Supabase Auth
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return null

        // 2. Ottieni i dettagli extra dalla tabella Profiles
        const { data: profile, error } = await supabase
            .from('Profiles')
            .select('*')
            .eq('id', user.id)
            .single()

        if (error) {
            console.error('Errore recupero profilo:', error)
            // Se il profilo non esiste ancora (es. errore trigger), restituisci dati parziali dall'auth
            return {
                id: user.id,
                email: user.email,
                name: user.user_metadata?.name || '',
                surname: user.user_metadata?.surname || '',
            } as UserProfile
        }

        // 3. Unisci i dati
        return {
            ...profile,
            email: user.email // L'email è gestita da Auth, non da Profiles
        } as UserProfile
    }

    // Aggiorna il profilo (Nome, Cognome, Avatar)
    static async updateProfile(id: string, updates: Partial<UserProfile>) {
        // Rimuoviamo l'email dagli update perché sta su Auth, non su Profiles
        const { email, ...profileUpdates } = updates

        return supabase
            .from('Profiles')
            .update(profileUpdates)
            .eq('id', id)
            .select()
            .single()
    }

    // ==========================================
    // SEZIONE 3: FUNZIONI "SOCIAL" & UTILITY
    // ==========================================

    // Cerca utenti per assegnare task (es. scrivi "Lor" e trovi "Loris")
    static async searchUsers(query: string) {
        if (!query) return []

        const { data } = await supabase
            .from('Profiles')
            .select('id, name, surname, avatar_url')
            .or(`name.ilike.%${query}%,surname.ilike.%${query}%`)
            .limit(10)

        return data || []
    }

    // Ottieni un profilo specifico tramite ID (utile per mostrare assegnatari)
    static async getProfileById(userId: string): Promise<UserProfile | null> {
        const { data } = await supabase
            .from('Profiles')
            .select('*')
            .eq('id', userId)
            .single()

        return data
    }

    // Ottieni tutti gli utenti (es. per dropdown o admin)
    static async findAll() {
        return supabase
            .from('Profiles')
            .select('id, name, surname, avatar_url')
            .order('name', { ascending: true })
    }
}