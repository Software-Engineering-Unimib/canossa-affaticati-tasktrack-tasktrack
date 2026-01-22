/**
 * @fileoverview Context per la modalità Focus.
 *
 * Gestisce un timer che traccia il tempo in modalità focus.
 * Utile per funzionalità di produttività.
 *
 * @module context/FocusContext
 */

'use client';

import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    useMemo,
    useRef,
    type ReactNode
} from 'react';

/**
 * Tipo del valore esposto dal context.
 */
interface FocusContextValue {
    /** Indica se la modalità focus è attiva */
    isFocusMode: boolean;
    /** Attiva/disattiva la modalità focus */
    toggleFocusMode: () => void;
    /** Secondi trascorsi dall'attivazione */
    seconds: number;
}

/**
 * Context per la modalità focus.
 */
const FocusContext = createContext<FocusContextValue | undefined>(undefined);

/**
 * Props del provider.
 */
interface FocusProviderProps {
    children: ReactNode;
}

/** Intervallo di aggiornamento del timer in millisecondi */
const TIMER_INTERVAL_MS = 1000;

/**
 * Provider per la modalità focus.
 *
 * Gestisce un cronometro che parte quando la modalità è attivata
 * e si resetta quando viene disattivata.
 */
export function FocusProvider({ children }: FocusProviderProps) {
    const [isFocusMode, setIsFocusMode] = useState(false);
    const [seconds, setSeconds] = useState(0);

    /**
     * Ref per memorizzare il timestamp di inizio.
     * Usare una ref invece di state evita re-render non necessari.
     */
    const startTimeRef = useRef<number | null>(null);

    /**
     * Attiva o disattiva la modalità focus.
     * All'attivazione, memorizza il timestamp corrente.
     * Alla disattivazione, resetta il timer.
     */
    const toggleFocusMode = useCallback(() => {
        setIsFocusMode(prev => {
            if (prev) {
                // Disattivazione: reset
                startTimeRef.current = null;
                setSeconds(0);
                return false;
            } else {
                // Attivazione: memorizza start time
                startTimeRef.current = Date.now();
                setSeconds(0);
                return true;
            }
        });
    }, []);

    /**
     * Aggiorna il contatore ogni secondo quando in focus mode.
     */
    useEffect(() => {
        if (!isFocusMode || startTimeRef.current === null) {
            return;
        }

        const intervalId = setInterval(() => {
            const elapsed = Math.floor((Date.now() - startTimeRef.current!) / 1000);
            setSeconds(elapsed);
        }, TIMER_INTERVAL_MS);

        return () => {
            clearInterval(intervalId);
        };
    }, [isFocusMode]);

    /**
     * Valore del context memoizzato.
     */
    const contextValue = useMemo<FocusContextValue>(
        () => ({
            isFocusMode,
            toggleFocusMode,
            seconds,
        }),
        [isFocusMode, toggleFocusMode, seconds]
    );

    return (
        <FocusContext.Provider value={contextValue}>
            {children}
        </FocusContext.Provider>
    );
}

/**
 * Hook per accedere alla modalità focus.
 *
 * @throws Error se usato fuori da FocusProvider
 *
 * @example
 * ```tsx
 * function FocusButton() {
 *   const { isFocusMode, toggleFocusMode, seconds } = useFocus();
 *
 *   return (
 *     <button onClick={toggleFocusMode}>
 *       {isFocusMode ? `Focus: ${seconds}s` : 'Start Focus'}
 *     </button>
 *   );
 * }
 * ```
 */
export function useFocus(): FocusContextValue {
    const context = useContext(FocusContext);

    if (context === undefined) {
        throw new Error(
            'useFocus deve essere usato all\'interno di un FocusProvider. ' +
            'Assicurati che il componente sia avvolto da <FocusProvider>.'
        );
    }

    return context;
}