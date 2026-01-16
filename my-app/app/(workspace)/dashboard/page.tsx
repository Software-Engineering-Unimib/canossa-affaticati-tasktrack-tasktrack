'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase'; // Import necessario per update/delete rapidi

// Componenti UI
import EditBoardDialog from "@/app/components/Board/EditBoardDialog";
import CreateBoardDialog, { NewBoardData } from "@/app/components/Board/CreateBoardDialog";
import BoardCard from "@/app/components/Board/BoardCard";

// Logica e Tipi
import { useAuth } from '@/app/context/AuthContext';
import { BoardModel } from '@/models/Board';
import { Board } from '@/items/Board';

export default function WorkspacePage() {
    // --- HOOKS ---
    const { user } = useAuth(); // Dati utente reali

    // --- STATI ---
    const [boards, setBoards] = useState<Board[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Stati per i Dialog
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [boardToEdit, setBoardToEdit] = useState<Board | null>(null);

    // --- FETCH DATI DAL DB ---
    const fetchBoards = async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const data = await BoardModel.getAllBoards();
            setBoards(data);
        } catch (error) {
            console.error("Errore caricamento dashboard:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Carica i dati all'avvio o quando cambia l'utente
    useEffect(() => {
        fetchBoards();
    }, [user]);

    // --- LOGICA FILTRO (Client-side) ---
    const filteredBoards = boards.filter(board =>
        board.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // --- HANDLERS (CRUD REALE) ---

    // 1. CREAZIONE
    const handleCreateBoard = async (data: NewBoardData) => {
        try {
            // Usa il Model creato prima per salvare su Supabase
            await BoardModel.createBoard(data.title, data.theme, data.icon);

            // Ricarica i dati per vedere la nuova board
            await fetchBoards();
            setIsCreateDialogOpen(false);
        } catch (error) {
            console.error("Errore creazione:", error);
            alert("Impossibile creare la bacheca.");
        }
    };

    // 2. AGGIORNAMENTO
    const handleUpdateBoard = async (updatedData: Board) => {
        try {
            // Aggiornamento diretto su Supabase
            const { error } = await supabase
                .from('Boards')
                .update({
                    title: updatedData.title,
                    description: updatedData.description,
                    theme: updatedData.theme,
                    icon: updatedData.icon
                })
                .eq('id', updatedData.id);

            if (error) throw error;

            // Ricarica UI
            await fetchBoards();
            setBoardToEdit(null);
        } catch (error) {
            console.error("Errore aggiornamento:", error);
            alert("Errore durante la modifica.");
        }
    };

    // 3. ELIMINAZIONE
    const handleDeleteBoard = async (id: string | number) => {
        try {
            const { error } = await supabase
                .from('Boards')
                .delete()
                .eq('id', id);

            if (error) throw error;

            // Ricarica UI (rimuovendo la board eliminata)
            setBoards(prev => prev.filter(b => b.id !== String(id)));
            setBoardToEdit(null);
        } catch (error) {
            console.error("Errore eliminazione:", error);
            alert("Errore durante l'eliminazione.");
        }
    };

    // --- RENDER LOADING ---
    if (isLoading && boards.length === 0) {
        return (
            <div className="flex h-full w-full items-center justify-center min-h-[50vh]">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-10 w-full max-w-7xl mx-auto space-y-8">

            {/* --- HEADER --- */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                        Buongiorno, {user?.name || 'Utente'}! 👋
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
                        Nessuna bacheca trovata per {searchQuery}
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