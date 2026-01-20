'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

export default function AuthCallbackPage() {
    const router = useRouter();

    useEffect(() => {
        const handleAuthCallback = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();

                if (error) {
                    console.error('Errore durante il callback:', error);
                    router.push('/login?error=auth_callback_failed');
                    return;
                }

                if (session) {
                    await syncUserData(session.user);

                    router.push('/dashboard');
                } else {
                    router.push('/login');
                }
            } catch (err) {
                console.error('Errore imprevisto:', err);
                router.push('/login?error=unexpected_error');
            }
        };

        handleAuthCallback();
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-slate-600 font-medium">Autenticazione in corso...</p>
            </div>
        </div>
    );
}

// Funzione per sincronizzare i dati utente OAuth con la tabella Users
async function syncUserData(user: any) {
    if (!user) return;

    const { data: existingUser } = await supabase
        .from('Users')
        .select('id')
        .eq('email', user.email)
        .single();

    // Se l'utente non esiste nella tabella Users, crealo
    if (!existingUser) {
        const metadata = user.user_metadata || {};

        // Estrai nome e cognome dai metadati GitHub
        const fullName = metadata.full_name || metadata.name || '';
        const nameParts = fullName.split(' ');
        const name = nameParts[0] || user.email?.split('@')[0] || 'Utente';
        const surname = nameParts.slice(1).join(' ') || '';

        await supabase.from('Users').insert({
            name,
            surname,
            email: user.email,
            password: '', // Password vuota per utenti OAuth
            avatar_url: metadata.avatar_url || null,
            provider: user.app_metadata?.provider || 'github'
        });
    }
}