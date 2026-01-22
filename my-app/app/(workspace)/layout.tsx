/**
 * @fileoverview Layout per le pagine del workspace.
 *
 * Fornisce la struttura comune a tutte le pagine protette:
 * - Sidebar di navigazione
 * - Area contenuto principale
 * - Overlay per modalità focus
 *
 * @module layouts/workspace
 */

import React, { type ReactNode } from 'react';
import Sidebar from '@/app/components/sidebar/Sidebar';
import FocusOverlay from '@/app/components/Focus/FocusOverlay';
import { FocusProvider } from '@/app/context/FocusContext';

/**
 * Props del layout.
 */
interface WorkspaceLayoutProps {
    children: ReactNode;
}

/**
 * Layout wrapper per le pagine del workspace.
 *
 * Struttura:
 * - Sidebar fissa a sinistra (hidden su mobile)
 * - Area main scrollabile con overlay focus
 * - FocusProvider per gestire stato focus locale
 */
export default function WorkspaceLayout({ children }: WorkspaceLayoutProps) {
    return (
        <FocusProvider>
            <div className="flex h-screen overflow-hidden bg-gray-50">
                {/* Sidebar - Desktop */}
                <div className="flex-none hidden lg:block">
                    <Sidebar />
                </div>

                {/* Sidebar - Mobile */}
                <div className="lg:hidden">
                    <Sidebar />
                </div>

                {/* Area principale */}
                <main className="flex-1 overflow-y-auto relative scroll-smooth flex flex-col pt-16 lg:pt-0">
                    {/* Overlay focus mode */}
                    <FocusOverlay />

                    {/* Contenuto pagina */}
                    <div className="flex-1 relative z-0">
                        {children}
                    </div>
                </main>
            </div>
        </FocusProvider>
    );
}