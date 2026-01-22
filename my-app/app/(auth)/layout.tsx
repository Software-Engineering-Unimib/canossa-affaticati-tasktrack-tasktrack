/**
 * @fileoverview Layout per le pagine di autenticazione.
 *
 * Fornisce una struttura minimale per login, registrazione
 * e recupero password, senza sidebar o navigazione.
 *
 * @module layouts/auth
 */

import React, { type ReactNode } from 'react';
import type { Metadata } from 'next';

/**
 * Metadata specifici per le pagine di autenticazione.
 */
export const metadata: Metadata = {
    title: 'Accesso - TaskTrack',
    description: 'Accedi al tuo workspace per gestire task e scadenze.',
};

/**
 * Props del layout.
 */
interface AuthLayoutProps {
    children: ReactNode;
}

/**
 * Layout per le pagine di autenticazione.
 *
 * Struttura minimale senza sidebar, ottimizzata per form di login/registrazione.
 */
export default function AuthLayout({ children }: AuthLayoutProps) {
    return (
        <main className="min-h-screen w-full bg-white">
            {children}
        </main>
    );
}