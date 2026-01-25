/**
 * @fileoverview Context per la gestione dell'autenticazione.
 *
 * Fornisce stato utente e metodi di autenticazione a tutta l'applicazione.
 * Implementa il pattern Observer tramite React Context per propagare
 * i cambiamenti di stato auth a tutti i componenti interessati.
 *
 * @module context/AuthContext
 */

'use client';

import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
    useMemo,
    type ReactNode
} from 'react';
import { useRouter } from 'next/navigation';
import { UserModel, UserProfile } from '@/models/User';
import { supabase } from '@/lib/supabase';

/**
 * Tipo del valore esposto dal context.
 */
interface AuthContextValue {
    /** Profilo dell'utente corrente (null se non autenticato) */
    user: UserProfile | null;
    /** Indica se il profilo è in fase di caricamento */
    loading: boolean;
    /** Effettua il logout dell'utente */
    signOut: () => Promise<void>;
    /** Ricarica il profilo utente dal server */
    refreshProfile: () => Promise<void>;
}

/**
 * Context per l'autenticazione.
 * Undefined indica che il provider non è stato montato.
 */
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Props del provider.
 */
interface AuthProviderProps {
    children: ReactNode;
}

/**
 * Provider per lo stato di autenticazione.
 *
 * Responsabilità:
 * - Carica il profilo utente all'avvio
 * - Ascolta eventi di auth (login/logout da altre tab)
 * - Fornisce metodi per logout e refresh
 *
 * Pattern: Observer (tramite onAuthStateChange)
 *
 * @example
 * ```tsx
 * // In app/provider.tsx
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 *
 * // In un componente
 * const { user, signOut } = useAuth();
 * ```
 */
export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    /**
     * Carica il profilo utente dal database.
     * Memoizzato per evitare ri-creazioni ad ogni render.
     */
    const fetchProfile = useCallback(async () => {
        try {
            const profile = await UserModel.getCurrentProfile();

            if (profile) {
                // Assicura che l'email sia presente
                const { data: { user: authUser } } = await supabase.auth.getUser();

                setUser({
                    ...profile,
                    email: profile.email || authUser?.email,
                });
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error('Errore caricamento profilo:', error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Effettua il logout e reindirizza al login.
     */
    const signOut = useCallback(async () => {
        await UserModel.signOut();
        setUser(null);
        router.push('/login');
    }, [router]);

    /**
     * Setup iniziale e subscription agli eventi auth.
     */
    useEffect(() => {
        // Carica profilo al mount
        fetchProfile();

        // Sottoscrizione agli eventi di autenticazione
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event) => {
                switch (event) {
                    case 'SIGNED_IN':
                    case 'TOKEN_REFRESHED':
                        fetchProfile();
                        break;
                    case 'SIGNED_OUT':
                        setUser(null);
                        router.push('/login');
                        break;
                }
            }
        );

        // Cleanup: rimuove subscription
        return () => {
            subscription.unsubscribe();
        };
    }, [fetchProfile, router]);

    /**
     * Valore del context memoizzato.
     * Evita re-render inutili dei consumer quando
     * le dipendenze non cambiano.
     */
    const contextValue = useMemo<AuthContextValue>(
        () => ({
            user,
            loading,
            signOut,
            refreshProfile: fetchProfile,
        }),
        [user, loading, signOut, fetchProfile]
    );

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
}

/**
 * Hook per accedere al context di autenticazione.
 *
 * @throws Error se usato fuori da AuthProvider
 *
 * @example
 * ```tsx
 * function ProfileButton() {
 *   const { user, signOut } = useAuth();
 *
 *   if (!user) return null;
 *
 *   return (
 *     <button onClick={signOut}>
 *       Logout {user.name}
 *     </button>
 *   );
 * }
 * ```
 */
export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext);

    if (context === undefined) {
        throw new Error(
            'useAuth deve essere usato all\'interno di un AuthProvider. ' +
            'Assicurati che il componente sia avvolto da <AuthProvider>.'
        );
    }

    return context;
}