import React from 'react';
import type { Metadata } from 'next';
import "../globals.css";

// Definiamo metadati specifici per le pagine di autenticazione
export const metadata: Metadata = {
    title: 'Accesso - TaskTrack',
    description: 'Accedi al tuo workspace per gestire task e scadenze.',
};

interface AuthLayoutProps {
    children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
    return (
        <main className="min-h-screen w-full bg-white">
            {children}
        </main>
    );
}