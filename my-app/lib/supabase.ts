/**
 * @fileoverview Client Supabase singleton per l'applicazione.
 *
 * Questo modulo esporta un'istanza singleton del client Supabase
 * configurato per l'utilizzo lato browser (CSR).
 *
 * Pattern: Singleton
 * Il client viene istanziato una sola volta e riutilizzato
 * in tutta l'applicazione per garantire consistenza delle sessioni.
 *
 * @module lib/supabase
 */

import { createBrowserClient } from '@supabase/ssr';

/**
 * Variabili d'ambiente richieste per la connessione a Supabase.
 * Validate all'avvio dell'applicazione.
 */
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Valida la presenza delle variabili d'ambiente critiche.
 * Lancia un errore esplicito se mancanti per facilitare il debugging.
 */
const validateEnvironment = (): void => {
    if (!SUPABASE_URL) {
        throw new Error(
            'NEXT_PUBLIC_SUPABASE_URL is not defined. ' +
            'Please add it to your .env.local file.'
        );
    }

    if (!SUPABASE_ANON_KEY) {
        throw new Error(
            'NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined. ' +
            'Please add it to your .env.local file.'
        );
    }
};

// Validazione eseguita all'import del modulo
validateEnvironment();

/**
 * Client Supabase singleton per operazioni lato browser.
 *
 * @remarks
 * Utilizzare questo client per tutte le operazioni che richiedono
 * autenticazione utente o accesso al database dal frontend.
 *
 * Per operazioni server-side (API routes, middleware), utilizzare
 * `createServerClient` con la gestione appropriata dei cookie.
 *
 * @example
 * ```typescript
 * import { supabase } from '@/lib/supabase';
 *
 * const { data, error } = await supabase
 *   .from('Tasks')
 *   .select('*');
 * ```
 */
export const supabase = createBrowserClient(
    SUPABASE_URL!,
    SUPABASE_ANON_KEY!
);