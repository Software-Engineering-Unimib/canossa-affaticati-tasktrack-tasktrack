'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserModel, UserProfile } from '@/models/User';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface AuthContextType {
    user: UserProfile | null;
    loading: boolean;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const fetchProfile = async () => {
        try {
            // getCurrentProfile restituisce direttamente UserProfile | null
            const profile = await UserModel.getCurrentProfile();

            if (profile) {
                const { data: { user: authUser } } = await supabase.auth.getUser();

                const fullProfile = {
                    ...profile,
                    email: profile.email || authUser?.email
                };
                setUser(fullProfile as UserProfile);
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error('Errore nel caricamento profilo:', error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Carica il profilo al montaggio
        fetchProfile();

        // Ascolta eventi di auth (es. login/logout su altre schede)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                fetchProfile();
            } else if (event === 'SIGNED_OUT') {
                setUser(null);
                router.push('/login'); // Redirect se sloggato
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [router]);

    const signOut = async () => {
        await UserModel.signOut();
        setUser(null);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, loading, signOut, refreshProfile: fetchProfile }}>
            {children}
        </AuthContext.Provider>
    );
}

// Hook per usare l'utente ovunque: const { user } = useAuth();
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}