/**
 * @fileoverview Pagina dashboard principale.
 *
 * Mostra la griglia delle bacheche dell'utente con:
 * - Ricerca
 * - Creazione nuove bacheche
 * - Modifica/eliminazione bacheche esistenti
 *
 * @module pages/dashboard
 */

'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Plus, Search, Loader2 } from 'lucide-react';

import EditBoardDialog from '@/app/components/Board/EditBoardDialog';
import CreateBoardDialog, { NewBoardData } from '@/app/components/Board/CreateBoardDialog';
import BoardCard from '@/app/components/Board/BoardCard';

import { useAuth } from '@/app/context/AuthContext';
import { useBoards } from '@/app/context/BoardsContext';
import { BoardModel } from '@/models';
import { Board } from '@/items/Board';

/**
 * Pagina dashboard.
 */
export default function DashboardPage() {
    const { user, loading: authLoading } = useAuth();
    const { boards, refreshBoards } = useBoards();

    // Stato di loading locale - si resetta ogni volta che la pagina viene montata
    const [isPageLoading, setIsPageLoading] = useState(true);

    // Stati UI
    const [searchQuery, setSearchQuery] = useState('');
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [boardToEdit, setBoardToEdit] = useState<Board | null>(null);

    // ═══════════════════════════════════════════════════════════
    // CARICA I DATI OGNI VOLTA CHE LA PAGINA VIENE MONTATA
    // ═══════════════════════════════════════════════════════════

    useEffect(() => {
        let isMounted = true;

        const loadData = async () => {
            setIsPageLoading(true);

            try {
                await refreshBoards();
            } catch (error) {
                console.error('Errore caricamento bacheche:', error);
            } finally {
                setTimeout(() => {
                    if (isMounted) {
                        setIsPageLoading(false);
                    }
                }, 300);
            }
        };

        if (user && !authLoading) {
            loadData();
        }

        return () => {
            isMounted = false;
        };
    }, [user, authLoading, refreshBoards]);

    /**
     * Bacheche filtrate per query di ricerca.
     * Memoizzato per evitare ricalcoli inutili.
     */
    const filteredBoards = useMemo(() => {
        if (!searchQuery.trim()) {
            return boards;
        }

        const query = searchQuery.toLowerCase();
        return boards.filter(board =>
            board.title.toLowerCase().includes(query)
        );
    }, [boards, searchQuery]);

    // ═══════════════════════════════════════════════════════════
    // HANDLERS CRUD
    // ═══════════════════════════════════════════════════════════

    /**
     * Crea una nuova bacheca.
     */
    const handleCreateBoard = useCallback(async (data: NewBoardData) => {
        try {
            await BoardModel.createBoard(data.title, data.description, data.theme, data.icon);
            await refreshBoards();
            setIsCreateDialogOpen(false);
        } catch (error) {
            console.error('Errore creazione:', error);
            alert('Impossibile creare la bacheca.');
        }
    }, [refreshBoards]);

    /**
     * Aggiorna una bacheca esistente.
     */
    const handleUpdateBoard = useCallback(async (updatedData: Board) => {
        try {
            await BoardModel.updateBoard(
                updatedData.id,
                updatedData.title,
                updatedData.description,
                updatedData.theme,
                updatedData.icon
            );
            await refreshBoards();
            setBoardToEdit(null);
        } catch (error) {
            console.error('Errore aggiornamento:', error);
            alert('Errore durante la modifica.');
        }
    }, [refreshBoards]);

    /**
     * Elimina una bacheca.
     */
    const handleDeleteBoard = useCallback(async (id: string | number) => {
        if (!confirm('Sei sicuro di voler eliminare questa bacheca?')) {
            return;
        }

        try {
            await BoardModel.deleteBoard(id);
            await refreshBoards();
            setBoardToEdit(null);
        } catch (error) {
            console.error('Errore eliminazione:', error);
            alert('Errore durante l\'eliminazione.');
        }
    }, [refreshBoards]);

    // ═══════════════════════════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════════════════════════

    // Loading state - mostrato ogni volta che la pagina viene montata
    if (authLoading || isPageLoading) {
        return (
            <div className="flex h-full w-full items-center justify-center min-h-[50vh]">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-10 w-full max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <DashboardHeader
                userName={user?.name}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
            />

            {/* Griglia bacheche */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {/* Pulsante crea */}
                <CreateBoardButton onClick={() => setIsCreateDialogOpen(true)} />

                {/* Card bacheche */}
                {filteredBoards.map((board) => (
                    <BoardCard
                        key={board.id}
                        {...board}
                        onEdit={() => setBoardToEdit(board)}
                    />
                ))}

                {/* Empty state ricerca */}
                {filteredBoards.length === 0 && searchQuery && (
                    <EmptySearchResult query={searchQuery} />
                )}
            </div>

            {/* Dialogs */}
            <CreateBoardDialog
                isOpen={isCreateDialogOpen}
                onClose={() => setIsCreateDialogOpen(false)}
                onCreate={handleCreateBoard}
            />

            <EditBoardDialog
                isOpen={!!boardToEdit}
                initialData={boardToEdit}
                onClose={() => setBoardToEdit(null)}
                onUpdate={handleUpdateBoard}
                onDelete={handleDeleteBoard}
            />
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════
// COMPONENTI INTERNI
// ═══════════════════════════════════════════════════════════════════

/**
 * Header della dashboard.
 */
function DashboardHeader({
                             userName,
                             searchQuery,
                             onSearchChange,
                         }: {
    userName?: string;
    searchQuery: string;
    onSearchChange: (value: string) => void;
}) {
    return (
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                    Buongiorno, {userName ?? 'Utente'}! 👋
                </h1>
                <p className="text-slate-500 mt-2 text-lg">
                    Ecco una panoramica dei tuoi spazi di lavoro attivi.
                </p>
            </div>

            <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                    type="text"
                    placeholder="Cerca bacheca..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl bg-white text-sm w-full md:w-72 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                />
            </div>
        </header>
    );
}

/**
 * Pulsante per creare una nuova bacheca.
 */
function CreateBoardButton({ onClick }: { onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="flex flex-col items-center justify-center h-full min-h-[180px] rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-white hover:border-blue-400 hover:shadow-md transition-all group animate-in fade-in duration-500"
        >
            <div className="w-14 h-14 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 group-hover:border-blue-200 transition-all duration-300">
                <Plus className="w-7 h-7 text-slate-400 group-hover:text-blue-600 transition-colors" />
            </div>
            <span className="font-semibold text-slate-500 group-hover:text-blue-600 transition-colors">
                Crea Nuova Bacheca
            </span>
        </button>
    );
}

/**
 * Messaggio per ricerca senza risultati.
 */
function EmptySearchResult({ query }: { query: string }) {
    return (
        <div className="col-span-full text-center py-12 text-slate-400 italic">
            Nessuna bacheca trovata per &quot;{query}&quot;
        </div>
    );
}