'use client';

import React, { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import EditBoardDialog from "@/app/components/EditBoardDialog";
import CreateBoardDialog, {NewBoardData} from "@/app/components/CreateBoardDialog";
import BoardCard from "@/app/components/BoardCard";
import {initialBoards} from "@/public/datas";
import {Board} from "@/public/Board";

// --- DATI INIZIALI (MOCK) ---

export default function WorkspacePage() {
    // --- STATI ---
    const [boards, setBoards] = useState<Board[]>(initialBoards);
    const [searchQuery, setSearchQuery] = useState('');

    // Stati per i Dialog
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [boardToEdit, setBoardToEdit] = useState<Board | null>(null);

    // --- LOGICA FILTRO ---
    const filteredBoards = boards.filter(board =>
        board.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // --- HANDLERS (CRUD) ---

    // 1. CREAZIONE
    const handleCreateBoard = (data: NewBoardData) => {
        const newBoard: Board = {
            id: Date.now(), // ID temporaneo univoco
            title: data.title,
            description: data.description,
            theme: data.theme,
            category: 'personal', // Default, potresti aggiungerlo al form di creazione
            stats: { deadlines: 0, inProgress: 0, completed: 0 },
            guests: data.guests
        };

        setBoards([...boards, newBoard]);
        setIsCreateDialogOpen(false);
    };

    // 2. AGGIORNAMENTO
    const handleUpdateBoard = (updatedData: Board) => {
        setBoards(prevBoards =>
            prevBoards.map(board => board.id === updatedData.id ? updatedData : board)
        );
        setBoardToEdit(null);
    };

    // 3. ELIMINAZIONE
    const handleDeleteBoard = (id: string | number) => {
        setBoards(prevBoards => prevBoards.filter(board => board.id !== id));
        setBoardToEdit(null); // Chiude il dialog se aperto
    };

    return (
        <div className="p-6 lg:p-10 w-full max-w-7xl mx-auto space-y-8">

            {/* --- HEADER --- */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                        Buongiorno, Alessandro! 👋
                    </h1>
                    <p className="text-slate-500 mt-2 text-lg">
                        Ecco una panoramica dei tuoi spazi di lavoro attivi.
                    </p>
                </div>

                {/* Barra di Ricerca */}
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

            {/* --- GRIGLIA BACHECHE --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

                {/* CARD 1: TASTO "CREA NUOVA" */}
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

                {/* MAPPATURA BACHECHE */}
                {filteredBoards.map((board) => (
                    <BoardCard
                        key={board.id}
                        {...board} // Passa id, title, category, theme, stats

                        // Apertura Dialog Modifica
                        onEdit={() => setBoardToEdit(board)}
                    />
                ))}

                {/* FEEDBACK NESSUN RISULTATO */}
                {filteredBoards.length === 0 && searchQuery && (
                    <div className="col-span-full text-center py-12 text-slate-400 italic">
                        Nessuna bacheca trovata per "{searchQuery}"
                    </div>
                )}

            </div>

            {/* --- DIALOGS --- */}

            {/* 1. Dialog Creazione */}
            <CreateBoardDialog
                isOpen={isCreateDialogOpen}
                onClose={() => setIsCreateDialogOpen(false)}
                onCreate={handleCreateBoard}
            />

            {/* 2. Dialog Modifica */}
            <EditBoardDialog
                isOpen={!!boardToEdit}        // Aperto se boardToEdit non è null
                initialData={boardToEdit}     // Passa i dati attuali
                onClose={() => setBoardToEdit(null)}
                onUpdate={handleUpdateBoard}
                onDelete={handleDeleteBoard}
            />

        </div>
    );
}