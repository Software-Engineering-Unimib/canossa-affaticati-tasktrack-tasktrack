/**
 * @fileoverview Layout root dell'applicazione Next.js.
 *
 * Configura metadata SEO e avvolge l'applicazione nei provider globali.
 *
 * @module app/layout
 */

import React, { type ReactNode } from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './provider';

/**
 * Metadata SEO dell'applicazione.
 * Next.js le utilizza per generare i tag <head> appropriati.
 */
export const metadata: Metadata = {
    title: {
        template: '%s | TaskTrack',
        default: 'TaskTrack - Gestione task per studenti',
    },
    description: 'Applicazione di gestione task e produttività per studenti universitari.',
    icons: {
        icon: '/favicon.ico',
    },
};

/**
 * Props del layout.
 */
interface RootLayoutProps {
    children: ReactNode;
}

/**
 * Layout root dell'applicazione.
 *
 * Responsabilità:
 * - Definisce la struttura HTML base
 * - Avvolge l'app nei provider globali
 * - Imposta la lingua del documento
 */
export default function RootLayout({ children }: RootLayoutProps) {
    return (
        <html lang="it">
        <body>
        <Providers>
            {children}
        </Providers>
        </body>
        </html>
    );
}