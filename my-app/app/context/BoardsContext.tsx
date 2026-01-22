/**
 * @fileoverview Context per la gestione delle bacheche.
 *
 * Centralizza lo stato delle bacheche per evitare fetch duplicati
 * tra componenti (es. Sidebar e Dashboard).
 *
 * Pattern: Lifting State Up + Context
 * Lo stato è "sollevato" al livello più alto necessario
 * e condiviso tramite context.
 *
 * @module context/BoardsContext
 */

'use client';

import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    useMemo,
    type ReactNode
} from 'react';
import { Board } from '@/items/Board';
import { BoardModel } from '@/models';
import { useAuth } from './AuthContext';

/**
 * Tipo del valore esposto dal context.
 */
interface BoardsContextValue {
    /** Lista delle bacheche dell'utente */
    boards: Board[];
    /** Indica se le bacheche sono in caricamento */
    isLoading: boolean;
    /** Ricarica le bacheche dal server */
    refreshBoards: () => Promise<void>;
}

/**
 * Context per le bacheche.
 */
const BoardsContext = createContext<BoardsContextValue | undefined>(undefined);

/**
 * Props del provider.
 */
interface BoardsProviderProps {
    children: ReactNode;
}

/**
 * Provider per lo stato delle bacheche.
 *
 * Dipende da AuthContext per l'utente corrente.
 * Ricarica automaticamente le bacheche quando l'utente cambia.
 *
 * @remarks
 * Deve essere usato all'interno di AuthProvider.
 */
export function BoardsProvider({ children }: BoardsProviderProps) {
    const { user } = useAuth();
    const [boards, setBoards] = useState<Board[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    /**
     * Carica le bacheche dal server.
     * Gestisce lo stato di loading e gli errori.
     */
    const refreshBoards = useCallback(async () => {
        if (!user) {
            setBoards([]);
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            const data = await BoardModel.getAllBoards();
            setBoards(data);
        } catch (error) {
            console.error('Errore caricamento bacheche:', error);
            setBoards([]);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    /**
     * Ricarica le bacheche quando l'utente cambia.
     */
    useEffect(() => {
        refreshBoards();
    }, [refreshBoards]);

    /**
     * Valore del context memoizzato.
     */
    const contextValue = useMemo<BoardsContextValue>(
        () => ({
            boards,
            isLoading,
            refreshBoards,
        }),
        [boards, isLoading, refreshBoards]
    );

    return (
        <BoardsContext.Provider value={contextValue}>
            {children}
        </BoardsContext.Provider>
    );
}

/**
 * Hook per accedere al context delle bacheche.
 *
 * @throws Error se usato fuori da BoardsProvider
 *
 * @example
 * ```tsx
 * function BoardsList() {
 *   const { boards, isLoading, refreshBoards } = useBoards();
 *
 *   if (isLoading) return <Spinner />;
 *
 *   return (
 *     <ul>
 *       {boards.map(b => <li key={b.id}>{b.title}</li>)}
 *     </ul>
 *   );
 * }
 * ```
 */
export function useBoards(): BoardsContextValue {
    const context = useContext(BoardsContext);

    if (context === undefined) {
        throw new Error(
            'useBoards deve essere usato all\'interno di un BoardsProvider. ' +
            'Assicurati che il componente sia avvolto da <BoardsProvider>.'
        );
    }

    return context;
}