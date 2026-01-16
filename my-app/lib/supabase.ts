import { createBrowserClient } from '@supabase/ssr'

// Questo client va usato nei componenti Client (es. nelle pagine con 'use client')
export const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)