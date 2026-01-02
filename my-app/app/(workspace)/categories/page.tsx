'use client';

import React, { useState } from 'react';
import {Search } from 'lucide-react';
import EditCategoryDialog from "@/app/components/categories/EditCategoryDialog";
import {initialBoards} from "@/public/datas";
import {Board} from "@/public/Board";
import CategoryCard from '@/app/components/categories/CategoryCard';

export default function WorkspacePage() {
    // --- STATI ---
    const [boards, setBoards] = useState<Board[]>(initialBoards);
    const [searchQuery, setSearchQuery] = useState('');

    // Stati per i Dialog
    const [boardToEdit, setBoardToEdit] = useState<Board | null>(null);

    // --- LOGICA FILTRO ---
    const filteredBoards = boards.filter(board =>
        board.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleUpdateBoard = (updatedData: Board) => {
        setBoards(prevBoards =>
            prevBoards.map(board => board.id === updatedData.id ? updatedData : board)
        );
        setBoardToEdit(null);
    };

    return (
        <div className="p-6 lg:p-10 w-full max-w-7xl mx-auto space-y-8">

            {/* --- HEADER --- */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                        Buongiorno, Mario! 👋
                    </h1>
                    <p className="text-slate-500 mt-2 text-lg">
                        Ecco la lista delle tue bacheche e delle categorie create finora.
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

                {/* MAPPATURA BACHECHE */}
                {filteredBoards.map((board) => (
                    <CategoryCard
                        key={board.id}
                        {...board}
                        
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

            {/* 2. Dialog Modifica */}
            <EditCategoryDialog
                isOpen={!!boardToEdit}        // Aperto se boardToEdit non è null
                initialData={boardToEdit}     // Passa i dati attuali
                onClose={() => setBoardToEdit(null)}
                onUpdate={handleUpdateBoard}
            />
        </div>
    );
}