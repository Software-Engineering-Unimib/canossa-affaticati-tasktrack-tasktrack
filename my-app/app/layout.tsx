import React from 'react';
import type { Metadata } from 'next';


// Metadati di base per l'intera applicazione
export const metadata: Metadata = {
    title: {
        template: '%s | TaskTrack',
        default: 'TaskTrack - Personal task tracking application', // Titolo di default se non specificato altrove
    },
    description: 'Personal task tracking application',
    icons: {
        icon: '/favicon.ico', // Assicurati di avere una favicon in /public
    },
};

export default function RootLayout({
    children,
    }: {
    children: React.ReactNode;
    }) {
    return (
        <html lang="en">
            <body>
                {children}
            </body>
        </html>
    );
}