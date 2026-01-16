import React from 'react';
import type { Metadata } from 'next';
import './globals.css'; // Assicurati che l'import del CSS sia presente
import { Providers } from './provider'; // Importa il wrapper creato al punto 2

export const metadata: Metadata = {
    title: {
        template: '%s | TaskTrack',
        default: 'TaskTrack - Personal task tracking application',
    },
    description: 'Personal task tracking application',
    icons: {
        icon: '/favicon.ico',
    },
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="it">
        <body>
        {/* Avvolgiamo tutto nei Providers globali */}
        <Providers>
            {children}
        </Providers>
        </body>
        </html>
    );
}