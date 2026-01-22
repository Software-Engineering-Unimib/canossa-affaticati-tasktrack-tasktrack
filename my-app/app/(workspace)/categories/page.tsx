/**
 * @fileoverview Pagina di gestione delle categorie per bacheca.
 *
 * Permette di visualizzare e modificare le etichette (categorie)
 * associate a ciascuna bacheca dell'utente.
 *
 * @module pages/categories
 */

'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, LayoutGrid, Tag, Loader2 } from 'lucide-react';

import { useAuth } from '@/app/context/AuthContext';
import { BoardModel, CategoryModel } from '@/models';
import { Board } from '@/items/Board';
import { Category } from '@/items/Category';

import CategoryCard from '@/app/components/categories/CategoryCard';
import EditCategoryDialog from '@/app/components/categories/EditCategoryDialog';

/**
 * Prefisso per ID temporanei (client-side).
 */
const TEMP_ID_PREFIX = 'temp';

/**
 * Verifica se un ID è temporaneo (generato lato client).
 */
function isTemporaryId(id: string | number): boolean {
    return String(id).startsWith(TEMP_ID_PREFIX);
}

/**
 * Pagina gestione categorie.
 */
export default function CategoriesPage() {
    const { user } = useAuth();

    // ═══════════════════════════════════════════════════════════
    // STATO
    // ═══════════════════════════════════════════════════════════

    const [boards, setBoards] = useState<Board[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeBoardId, setActiveBoardId] = useState<string | null>(null);

    // ═══════════════════════════════════════════════════════════
    // CARICAMENTO DATI
    // ═══════════════════════════════════════════════════════════

    /**
     * Carica le bacheche dal server.
     */
    const fetchData = useCallback(async () => {
        if (!user) return;

        setIsLoading(true);
        try {
            const data = await BoardModel.getAllBoards();
            setBoards(data);
        } catch (error) {
            console.error('Errore caricamento categorie:', error);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // ════════════════════════════════════════════════════���══════
    // FILTRAGGIO
    // ═══════════════════════════════════════════════════════════

    /**
     * Bacheche filtrate per query di ricerca.
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

    /**
     * Bacheca attualmente selezionata per il dialog.
     */
    const activeBoard = useMemo(() =>
            boards.find(b => b.id === activeBoardId),
        [boards, activeBoardId]
    );

    // ═══════════════════════════════════════════════════════════
    // HANDLERS DIALOG
    // ═══════════════════════════════════════════════════════════

    const openDialog = useCallback((boardId: string) => {
        setActiveBoardId(boardId);
    }, []);

    const closeDialog = useCallback(() => {
        setActiveBoardId(null);
    }, []);

    // ═══════════════════════════════════════════════════════════
    // HANDLERS CRUD
    // ═══════════════════════════════════════════════════════════

    /**
     * Salva una categoria (crea o aggiorna).
     */
    const handleSaveCategory = useCallback(async (categoryData: Category) => {
        if (!activeBoardId) return;

        try {
            const isExisting = categoryData.id && !isTemporaryId(categoryData.id);

            if (isExisting) {
                await CategoryModel.updateCategory(categoryData.id, {
                    name: categoryData.name,
                    color: categoryData.color,
                });
            } else {
                await CategoryModel.createCategory(
                    activeBoardId,
                    categoryData.name,
                    categoryData.color
                );
            }

            await fetchData();
        } catch (error) {
            console.error('Errore salvataggio categoria:', error);
            alert('Errore durante il salvataggio.');
        }
    }, [activeBoardId, fetchData]);

    /**
     * Elimina una categoria.
     */
    const handleDeleteCategory = useCallback(async (categoryId: string | number) => {
        if (!activeBoardId) return;
        if (!confirm('Vuoi davvero eliminare questa etichetta?')) return;

        try {
            await CategoryModel.deleteCategory(categoryId);
            await fetchData();
        } catch (error) {
            console.error('Errore eliminazione categoria:', error);
            alert('Errore durante l\'eliminazione.');
        }
    }, [activeBoardId, fetchData]);

    // ═══════════════════════════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════════════════════════

    if (isLoading && boards.length === 0) {
        return (
            <div className="flex h-full w-full items-center justify-center min-h-[50vh]">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-10 max-w-7xl mx-auto pb-20 space-y-8">
            {/* Header */}
            <PageHeader
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
            />

            {/* Content */}
            {filteredBoards.length === 0 ? (
                <EmptyState searchQuery={searchQuery} />
            ) : (
                <BoardsGrid
                    boards={filteredBoards}
                    onEditClick={openDialog}
                />
            )}

            {/* Dialog */}
            {activeBoard && (
                <EditCategoryDialog
                    isOpen={true}
                    boardName={activeBoard.title}
                    categories={activeBoard.categories}
                    onClose={closeDialog}
                    onSaveCategory={handleSaveCategory}
                    onDeleteCategory={handleDeleteCategory}
                />
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════
// COMPONENTI INTERNI
// ═══════════════════════════════════════════════════════════════════

/**
 * Header della pagina.
 */
function PageHeader({
                        searchQuery,
                        onSearchChange,
                    }: {
    searchQuery: string;
    onSearchChange: (value: string) => void;
}) {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                    <Tag className="w-8 h-8 text-blue-600" />
                    Gestione Categorie
                </h1>
                <p className="text-slate-500 mt-2 text-lg">
                    Organizza le etichette e i colori per ogni tua bacheca.
                </p>
            </div>

            <div className="relative w-full md:w-72 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                    type="text"
                    placeholder="Cerca bacheca..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                />
            </div>
        </div>
    );
}

/**
 * Stato vuoto (nessuna bacheca).
 */
function EmptyState({ searchQuery }: { searchQuery: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl">
            <LayoutGrid className="w-12 h-12 text-slate-300 mb-3" />
            <p className="text-slate-500 font-medium">
                {searchQuery
                    ? `Nessuna bacheca trovata per "${searchQuery}"`
                    : 'Non hai ancora bacheche attive.'
                }
            </p>
        </div>
    );
}

/**
 * Griglia delle bacheche.
 */
function BoardsGrid({
                        boards,
                        onEditClick,
                    }: {
    boards: Board[];
    onEditClick: (boardId: string) => void;
}) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {boards.map((board) => (
                <CategoryCard
                    key={board.id}
                    id={board.id}
                    title={board.title}
                    theme={board.theme}
                    categories={board.categories}
                    icon={board.icon}
                    onEdit={() => onEditClick(board.id)}
                />
            ))}
        </div>
    );
}