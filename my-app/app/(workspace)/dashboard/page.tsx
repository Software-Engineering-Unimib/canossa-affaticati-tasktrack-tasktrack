'use client';

import React, { useState } from 'react';
import { Plus, Search, Loader2 } from 'lucide-react';

// Componenti UI
import EditBoardDialog from "@/app/components/Board/EditBoardDialog";
import CreateBoardDialog, { NewBoardData } from "@/app/components/Board/CreateBoardDialog";
import BoardCard from "@/app/components/Board/BoardCard";

// Logica e Context
import { useAuth } from '@/app/context/AuthContext';
import { useBoards } from '@/app/context/BoardsContext'; // <--- USA IL NUOVO CONTEXT CONDIVISO
import { BoardModel } from '@/models';
import { Board } from '@/items/Board';

export default function WorkspacePage() {
    const { user } = useAuth();

    // USIAMO IL CONTEXT INVECE DI STATO LOCALE
    // boards è condiviso, refreshBoards aggiorna tutti i componenti che usano il context
    const { boards, isLoading, refreshBoards } = useBoards();

    const [searchQuery, setSearchQuery] = useState('');
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [boardToEdit, setBoardToEdit] = useState<Board | null>(null);

    // --- LOGICA FILTRO ---
    const filteredBoards = boards.filter(board =>
        board.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // --- HANDLERS (CRUD) ---

    // 1. CREAZIONE
    const handleCreateBoard = async (data: NewBoardData) => {
        try {
            await BoardModel.createBoard(data.title, data.description, data.theme, data.icon);
            await refreshBoards(); // Aggiorna Context -> Aggiorna Sidebar e Dashboard
            setIsCreateDialogOpen(false);
        } catch (error) {
            console.error("Errore creazione:", error);
            alert("Impossibile creare la bacheca.");
        }
    };

    // 2. AGGIORNAMENTO
    const handleUpdateBoard = async (updatedData: Board) => {
        try {
            await BoardModel.updateBoard(
                updatedData.id,
                updatedData.title,
                updatedData.description,
                updatedData.theme,
                updatedData.icon
            );
            await refreshBoards(); // Aggiorna tutto
            setBoardToEdit(null);
        } catch (error) {
            console.error("Errore aggiornamento:", error);
            alert("Errore durante la modifica.");
        }
    };

    // 3. ELIMINAZIONE
    const handleDeleteBoard = async (id: string | number) => {
        if(!confirm("Sei sicuro di voler eliminare questa bacheca?")) return;

        try {
            await BoardModel.deleteBoard(id);
            await refreshBoards(); // Aggiorna tutto
            setBoardToEdit(null);
        } catch (error) {
            console.error("Errore eliminazione:", error);
            alert("Errore durante l'eliminazione.");
        }
    };

    // --- RENDER ---
    if (isLoading && boards.length === 0) {
        return (
            <div className="flex h-full w-full items-center justify-center min-h-[50vh]">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-10 w-full max-w-7xl mx-auto space-y-8">

            {/* HEADER */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                        Buongiorno, {user?.name || 'Utente'}! 👋
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
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl bg-white text-sm w-full md:w-72 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                    />
                </div>
            </header>

            {/* GRIGLIA */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

                {/* Tasto Crea */}
                <button
                    onClick={() => setIsCreateDialogOpen(true)}
                    className="flex flex-col items-center justify-center h-full min-h-[180px] rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-white hover:border-blue-400 hover:shadow-md transition-all group animate-in fade-in duration-500"
                >
                    <div className="w-14 h-14 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 group-hover:border-blue-200 transition-all duration-300">
                        <Plus className="w-7 h-7 text-slate-400 group-hover:text-blue-600 transition-colors" />
                    </div>
                    <span className="font-semibold text-slate-500 group-hover:text-blue-600 transition-colors">
                        Crea Nuova Bacheca
                    </span>
                </button>

                {/* Card Bacheche */}
                {filteredBoards.map((board) => (
                    <BoardCard
                        key={board.id}
                        {...board}
                        onEdit={() => setBoardToEdit(board)}
                    />
                ))}

                {filteredBoards.length === 0 && searchQuery && (
                    <div className="col-span-full text-center py-12 text-slate-400 italic">
                        Nessuna bacheca trovata per "{searchQuery}"
                    </div>
                )}
            </div>

            {/* DIALOGS */}
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