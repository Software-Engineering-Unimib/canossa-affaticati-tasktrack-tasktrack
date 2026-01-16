import { supabase } from './supabase'

// Login con GitHub
export async function signInWithGitHub() {
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
            redirectTo: `${window.location.origin}/auth/callback`
        }
    })

    return { data, error }
}

// Login con Google (se vuoi aggiungerlo in futuro)
export async function signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${window.location.origin}/auth/callback`
        }
    })

    return { data, error }
}

// Login con email e password
export async function signInWithEmail(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    })

    return { data, error }
}

// Registrazione con email e password
export async function signUpWithEmail(email: string, password: string, metadata?: { name?: string, surname?: string }) {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: metadata
        }
    })

    return { data, error }
}

// Logout
export async function signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
}

// Ottieni sessione corrente
export async function getSession() {
    const { data: { session }, error } = await supabase.auth.getSession()
    return { session, error }
}

// Ottieni utente corrente
export async function getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
}

// Ascolta cambiamenti di autenticazione
export function onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback)
}