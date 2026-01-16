import { supabase } from '@/lib/supabase'

export interface UserProfile {
    id: string       // UUID (lo stesso di auth.users)
    name: string
    surname: string
    email?: string   // Opzionale: spesso l'email sta solo in auth, ma puoi copiarla qui
    created_at?: string
}

export class UserModel {
    // ==========================================
    // SEZIONE 1: AUTENTICAZIONE (Auth)
    // ==========================================

    // Login (uguale a prima)
    static async signIn(email: string, password: string) {
        return await supabase.auth.signInWithPassword({ email, password })
    }

    // Logout
    static async signOut() {
        return await supabase.auth.signOut()
    }

    // ==========================================
    // SEZIONE 2: GESTIONE DATI (Tabella Profiles)
    // ==========================================

    // Ottieni il profilo dell'utente loggato
    static async getCurrentProfile() {
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return { data: null, error: 'No user logged in' }

        return supabase
            .from('Profiles')
            .select('*')
            .eq('id', user.id)
            .single();
    }

    // Aggiorna il profilo (Nome, Cognome)
    static async updateProfile(id: string, updates: Partial<UserProfile>) {
        return supabase
            .from('Profiles')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
    }

    // ==========================================
    // SEZIONE 3: FUNZIONI "SOCIAL" (Ora possibili)
    // ==========================================

    // Cerca utenti per assegnare task (es. scrivi "Lor" e trovi "Loris")
    static async searchUsers(query: string) {
        return supabase
            .from('Profiles')
            .select('id, name, surname') // Seleziona solo dati pubblici
            .or(`name.ilike.%${query}%,surname.ilike.%${query}%`)
            .limit(10);
    }

    // Ottieni tutti gli utenti (es. per un dropdown)
    static async findAll() {
        return supabase
            .from('Profiles')
            .select('*')
            .order('name', {ascending: true});
    }
}