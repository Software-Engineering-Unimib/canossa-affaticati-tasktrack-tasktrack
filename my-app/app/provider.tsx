/**
 * @fileoverview Composizione dei provider globali dell'applicazione.
 *
 * Raggruppa tutti i Context Provider in un unico componente
 * per semplificare la struttura del layout root.
 *
 * Pattern: Composite Provider
 *
 * @module app/provider
 */

'use client';

import React, { type ReactNode } from 'react';
import { AuthProvider } from '@/app/context/AuthContext';
import { FocusProvider } from '@/app/context/FocusContext';
import { BoardsProvider } from '@/app/context/BoardsContext';

/**
 * Props del componente Providers.
 */
interface ProvidersProps {
    children: ReactNode;
}

/**
 * Wrapper che compone tutti i provider globali dell'applicazione.
 *
 * L'ordine di nesting è importante:
 * 1. AuthProvider - fornisce l'utente a tutti gli altri
 * 2. BoardsProvider - dipende da AuthProvider per l'utente
 * 3. FocusProvider - indipendente, ma interno per coerenza
 *
 * @example
 * ```tsx
 * // In app/layout.tsx
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <Providers>{children}</Providers>
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 */
export function Providers({ children }: ProvidersProps) {
    return (
        <AuthProvider>
            <BoardsProvider>
                <FocusProvider>
                    {children}
                </FocusProvider>
            </BoardsProvider>
        </AuthProvider>
    );
}