'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface FocusContextType {
    isFocusMode: boolean;
    toggleFocusMode: () => void;
    seconds: number; // Tempo trascorso in secondi
}

const FocusContext = createContext<FocusContextType | undefined>(undefined);

export function FocusProvider({ children }: { children: ReactNode }) {
    const [isFocusMode, setIsFocusMode] = useState(false);
    const [startTime, setStartTime] = useState<number | null>(null);
    const [seconds, setSeconds] = useState(0);

    // Gestione Start/Stop
    const toggleFocusMode = () => {
        if (isFocusMode) {
            // Spegni
            setIsFocusMode(false);
            setStartTime(null);
            setSeconds(0);
        } else {
            // Accendi
            setIsFocusMode(true);
            setStartTime(Date.now());
            setSeconds(0);
        }
    };

    // Logica Timer
    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isFocusMode && startTime) {
            // Aggiorna ogni secondo
            interval = setInterval(() => {
                const now = Date.now();
                setSeconds(Math.floor((now - startTime) / 1000));
            }, 1000);
        }

        return () => clearInterval(interval);
    }, [isFocusMode, startTime]);

    return (
        <FocusContext.Provider value={{ isFocusMode, toggleFocusMode, seconds }}>
            {children}
        </FocusContext.Provider>
    );
}

export function useFocus() {
    const context = useContext(FocusContext);
    if (context === undefined) {
        throw new Error('useFocus must be used within a FocusProvider');
    }
    return context;
}