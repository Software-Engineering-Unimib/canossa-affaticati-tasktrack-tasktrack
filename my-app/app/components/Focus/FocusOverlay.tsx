'use client';

import React from 'react';
import { useFocus } from '../../context/FocusContext';
import { X, Timer } from 'lucide-react';

export default function FocusOverlay() {
    const { isFocusMode, toggleFocusMode, seconds } = useFocus();

    if (!isFocusMode) return null;

    // Formatta i secondi in MM:SS o HH:MM:SS
    const formatTime = (totalSeconds: number) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;

        const pad = (n: number) => n.toString().padStart(2, '0');

        if (hours > 0) {
            return `${pad(hours)}:${pad(minutes)}:${pad(secs)}`;
        }
        return `${pad(minutes)}:${pad(secs)}`;
    };

    return (
        <div className="absolute inset-0 z-50 bg-purple-600 text-white flex flex-col items-center justify-center animate-in fade-in duration-300">

            {/* Timer Gigante */}
            <div className="flex flex-col items-center gap-6">
                <div className="p-6 bg-white/10 rounded-full backdrop-blur-md border border-white/20 shadow-2xl">
                    <Timer className="w-16 h-16 animate-pulse" />
                </div>

                <div className="text-center">
                    <h2 className="text-2xl font-medium opacity-80 uppercase tracking-widest mb-2">Focus Session</h2>
                    <div className="text-9xl font-bold font-mono tracking-tighter tabular-nums">
                        {formatTime(seconds)}
                    </div>
                </div>

                {/* Bottone Disattiva */}
                <button
                    onClick={toggleFocusMode}
                    className="mt-8 group flex items-center gap-3 px-8 py-4 bg-white text-purple-600 rounded-full font-bold text-lg hover:scale-105 hover:shadow-xl transition-all"
                >
                    <X className="w-6 h-6 group-hover:rotate-90 transition-transform" />
                    Termina Sessione
                </button>
            </div>

            {/* Citazione o Decorazione (Opzionale) */}
            <p className="absolute bottom-10 opacity-50 text-sm font-medium">
                Rimani concentrato. Una cosa alla volta.
            </p>

        </div>
    );
}