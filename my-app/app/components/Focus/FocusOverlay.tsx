/**
 * @fileoverview Overlay per la modalità Focus.
 *
 * Mostra un timer a schermo intero quando la modalità focus è attiva.
 * Copre tutta l'area di lavoro per minimizzare le distrazioni.
 *
 * @module components/focus/FocusOverlay
 */

'use client';

import React, { useMemo } from 'react';
import { X, Timer } from 'lucide-react';
import { useFocus } from '@/app/context/FocusContext';

/**
 * Formatta i secondi in formato leggibile (MM:SS o HH:MM:SS).
 *
 * @param totalSeconds - Secondi totali da formattare
 * @returns Stringa formattata
 */
function formatTime(totalSeconds: number): string {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (n: number) => n.toString().padStart(2, '0');

    if (hours > 0) {
        return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }

    return `${pad(minutes)}:${pad(seconds)}`;
}

/**
 * Overlay per la modalità Focus.
 *
 * Caratteristiche:
 * - Timer gigante al centro
 * - Pulsante per terminare la sessione
 * - Citazione motivazionale
 * - Stile minimal per ridurre distrazioni
 */
export default function FocusOverlay(): React.ReactElement | null {
    const { isFocusMode, toggleFocusMode, seconds } = useFocus();

    /**
     * Tempo formattato, memoizzato per evitare ricalcoli.
     */
    const formattedTime = useMemo(() => formatTime(seconds), [seconds]);

    if (!isFocusMode) return null;

    return (
        <div
            className="absolute inset-0 z-50 bg-purple-600 text-white flex flex-col items-center justify-center animate-in fade-in duration-300"
            role="dialog"
            aria-modal="true"
            aria-label="Modalità Focus attiva"
        >
            {/* Timer */}
            <div className="flex flex-col items-center gap-6">
                {/* Icona */}
                <div className="p-6 bg-white/10 rounded-full backdrop-blur-md border border-white/20 shadow-2xl">
                    <Timer className="w-16 h-16 animate-pulse" aria-hidden="true" />
                </div>

                {/* Etichetta e Tempo */}
                <div className="text-center">
                    <h2 className="text-2xl font-medium opacity-80 uppercase tracking-widest mb-2">
                        Focus Session
                    </h2>
                    <div
                        className="text-9xl font-bold font-mono tracking-tighter tabular-nums"
                        aria-live="polite"
                        aria-atomic="true"
                    >
                        {formattedTime}
                    </div>
                </div>

                {/* Pulsante Termina */}
                <button
                    onClick={toggleFocusMode}
                    className="mt-8 group flex items-center gap-3 px-8 py-4 bg-white text-purple-600 rounded-full font-bold text-lg hover:scale-105 hover:shadow-xl transition-all"
                >
                    <X
                        className="w-6 h-6 group-hover:rotate-90 transition-transform"
                        aria-hidden="true"
                    />
                    Termina Sessione
                </button>
            </div>

            {/* Citazione */}
            <p className="absolute bottom-10 opacity-50 text-sm font-medium">
                Rimani concentrato. Una cosa alla volta.
            </p>
        </div>
    );
}