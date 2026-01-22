/**
 * @fileoverview Model per la gestione degli utenti e dell'autenticazione.
 *
 * Implementa il pattern Repository per incapsulare l'accesso ai dati utente,
 * separando la logica di business dalla persistenza (Supabase).
 *
 * @module models/User
 */

import { supabase } from '@/lib/supabase';

/**
 * Profilo utente dell'applicazione.
 * Combina dati dalla tabella Profiles e da Supabase Auth.
 */
export interface UserProfile {
    /** UUID univoco dell'utente */
    id: string;
    name: string;
    surname: string;
    /** Email dall'auth provider (Supabase Auth) */
    email?: string;
    avatar_url?: string;
    created_at?: string;
}

/**
 * Dati parziali per l'aggiornamento del profilo.
 * Esclude campi gestiti dal sistema (id, email, created_at).
 */
type ProfileUpdateData = Pick<UserProfile, 'name' | 'surname' | 'avatar_url'>;

/**
 * Risultato di una ricerca utenti.
 */
interface UserSearchResult {
    id: string;
    name: string;
    surname: string;
    avatar_url: string | null;
}

/**
 * Repository per la gestione degli utenti.
 *
 * Raggruppa le operazioni in tre sezioni logiche:
 * 1. Autenticazione (Auth)
 * 2. Gestione Profili (CRUD)
 * 3. Utility e Ricerca
 *
 * Pattern: Repository
 * Incapsula l'accesso a Supabase, permettendo di cambiare
 * l'implementazione senza impattare i consumer.
 */
export class UserModel {
    // ═══════════════════════════════════════════════════════════
    // SEZIONE 1: AUTENTICAZIONE
    // ═══════════════════════════════════════════════════════════

    /**
     * Effettua il login con email e password.
     *
     * @param email - Email dell'utente
     * @param password - Password dell'utente
     * @returns Risultato dell'operazione di login
     */
    static async signIn(email: string, password: string) {
        return supabase.auth.signInWithPassword({ email, password });
    }

    /**
     * Effettua il logout dell'utente corrente.
     */
    static async signOut() {
        return supabase.auth.signOut();
    }

    /**
     * Recupera la sessione corrente.
     * Utile per controlli rapidi dello stato di autenticazione.
     */
    static async getSession() {
        return supabase.auth.getSession();
    }

    // ═══════════════════════════════════════════════════════════
    // SEZIONE 2: GESTIONE PROFILI
    // ═══════════════════════════════════════════════════════════

    /**
     * Ottiene il profilo completo dell'utente loggato.
     *
     * Combina i dati anagrafici dalla tabella Profiles
     * con l'email dal sistema di autenticazione.
     *
     * @returns Profilo completo o null se non autenticato
     *
     * @remarks
     * In caso di profilo mancante (es. trigger di creazione fallito),
     * restituisce un profilo parziale con i dati disponibili dall'auth.
     */
    static async getCurrentProfile(): Promise<UserProfile | null> {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return null;
        }

        const { data: profile, error } = await supabase
            .from('Profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (error) {
            console.error('Errore recupero profilo:', error);
            // Fallback: restituisce dati parziali dall'auth
            return this.buildPartialProfile(user);
        }

        return {
            ...profile,
            email: user.email,
        } as UserProfile;
    }

    /**
     * Aggiorna il profilo dell'utente.
     *
     * @param id - ID dell'utente da aggiornare
     * @param updates - Campi da aggiornare
     * @returns Profilo aggiornato
     *
     * @remarks
     * L'email non può essere aggiornata tramite questo metodo
     * poiché è gestita da Supabase Auth.
     */
    static async updateProfile(id: string, updates: Partial<UserProfile>) {
        // Estrae solo i campi aggiornabili
        const { name, surname, avatar_url } = updates;
        const profileUpdates: Partial<ProfileUpdateData> = {};

        if (name !== undefined) profileUpdates.name = name;
        if (surname !== undefined) profileUpdates.surname = surname;
        if (avatar_url !== undefined) profileUpdates.avatar_url = avatar_url;

        return supabase
            .from('Profiles')
            .update(profileUpdates)
            .eq('id', id)
            .select()
            .single();
    }

    /**
     * Ottiene un profilo tramite ID.
     *
     * @param userId - ID dell'utente
     * @returns Profilo o null se non trovato
     */
    static async getProfileById(userId: string): Promise<UserProfile | null> {
        const { data } = await supabase
            .from('Profiles')
            .select('*')
            .eq('id', userId)
            .single();

        return data;
    }

    // ═══════════════════════════════════════════════════════════
    // SEZIONE 3: RICERCA E UTILITY
    // ═══════════════════════════════════════════════════════════

    /**
     * Cerca utenti per nome o cognome.
     * Utilizzato per l'assegnazione dei task.
     *
     * @param query - Stringa di ricerca (min 1 carattere)
     * @returns Lista di utenti corrispondenti (max 10)
     *
     * @example
     * ```typescript
     * const users = await UserModel.searchUsers('Mar');
     * // Trova: Marco, Maria, Martina...
     * ```
     */
    static async searchUsers(query: string): Promise<UserSearchResult[]> {
        if (!query.trim()) {
            return [];
        }

        const { data } = await supabase
            .from('Profiles')
            .select('id, name, surname, avatar_url')
            .or(`name.ilike.%${query}%,surname.ilike.%${query}%`)
            .limit(10);

        return data ?? [];
    }

    /**
     * Ottiene tutti gli utenti ordinati per nome.
     * Utile per dropdown amministrativi.
     */
    static async findAll() {
        return supabase
            .from('Profiles')
            .select('id, name, surname, avatar_url')
            .order('name', { ascending: true });
    }

    // ═══════════════════════════════════════════════════════════
    // METODI PRIVATI
    // ═══════════════════════════════════════════════════════════

    /**
     * Costruisce un profilo parziale dai dati dell'auth.
     * Utilizzato come fallback quando il profilo DB non esiste.
     */
    private static buildPartialProfile(authUser: {
        id: string;
        email?: string;
        user_metadata?: { name?: string; surname?: string }
    }): UserProfile {
        return {
            id: authUser.id,
            email: authUser.email,
            name: authUser.user_metadata?.name ?? '',
            surname: authUser.user_metadata?.surname ?? '',
        };
    }
}