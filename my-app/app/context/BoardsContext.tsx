'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Board } from '@/items/Board';
import { BoardModel } from '@/models';
import { useAuth } from './AuthContext';

interface BoardsContextType {
    boards: Board[];
    isLoading: boolean;
    refreshBoards: () => Promise<void>;
}

const BoardsContext = createContext<BoardsContextType | undefined>(undefined);

export function BoardsProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [boards, setBoards] = useState<Board[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Funzione centralizzata per scaricare le bacheche
    const refreshBoards = useCallback(async () => {
        if (!user) {
            setBoards([]);
            return;
        }
        try {
            const data = await BoardModel.getAllBoards();
            setBoards(data);
        } catch (error) {
            console.error("Errore caricamento boards:", error);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    // Carica i dati quando cambia l'utente
    useEffect(() => {
        refreshBoards();
    }, [refreshBoards]);

    return (
        <BoardsContext.Provider value={{ boards, isLoading, refreshBoards }}>
            {children}
        </BoardsContext.Provider>
    );
}

export function useBoards() {
    const context = useContext(BoardsContext);
    if (context === undefined) {
        throw new Error('useBoards must be used within a BoardsProvider');
    }
    return context;
}