'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function loginAction(email: string, password: string) {
    const cookieStore = await cookies()

    // 1. Crea il client Supabase lato server per gestire i cookie
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch {
                        // Questo catch è necessario se la server action viene chiamata da un Server Component,
                        // ma qui la chiamiamo dal Client Component quindi i cookie funzioneranno.
                    }
                },
            },
        }
    )

    // 2. Tenta il login
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        console.error('❌ Errore Login sul server:', error.message)
        return { success: false, error: error.message }
    }

    // 3. LOG SUL TERMINALE (Quello che hai chiesto)
    console.log('✅ LOGIN AVVENUTO CON SUCCESSO PER:', data.user?.email)
    console.log('   User ID:', data.user?.id)

    return { success: true }
}