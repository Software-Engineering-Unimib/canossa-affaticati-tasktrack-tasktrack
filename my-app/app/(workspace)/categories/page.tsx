'use client';

import React, { useState } from 'react';
import {
    Search,
    LayoutGrid,
    Tag
} from 'lucide-react';

// Import Dati e Tipi
import { initialBoards } from '@/items/datas';
import { Board } from '@/items/Board';
import { Category } from '@/items/Category';

// Import Componenti
import CategoryCard from '@/app/components/categories/CategoryCard';
import EditCategoryDialog from '@/app/components/categories/EditCategoryDialog';

export default function CategoriesPage() {
    // Stato locale delle bacheche (inizializzato con i dati mock)
    const [boards, setBoards] = useState<Board[]>(initialBoards);
    const [searchQuery, setSearchQuery] = useState('');

    // --- STATO DIALOG ---
    // Tiene traccia di quale bacheca si sta modificando. Se null, il dialog è chiuso.
    const [activeBoardId, setActiveBoardId] = useState<string | null>(null);

    // --- HANDLERS ---

    // 1. Apertura Dialog
    const handleOpenDialog = (boardId: string) => {
        setActiveBoardId(boardId);
    };

    const handleCloseDialog = () => {
        setActiveBoardId(null);
    };

    // 2. Salvataggio Categoria (Creazione o Modifica)
    // Questa funzione viene passata al Dialog e gestisce entrambi i casi
    const handleSaveCategory = (updatedCategory: Category) => {
        if (!activeBoardId) return;

        setBoards(prev => prev.map(board => {
            // Troviamo la bacheca attiva
            if (board.id !== activeBoardId) return board;

            // Cerchiamo se la categoria esiste già
            const existingIndex = board.categories.findIndex(c => c.id === updatedCategory.id);
            let newCategories;

            if (existingIndex >= 0) {
                // MODIFICA: Sostituiamo la categoria esistente
                newCategories = [...board.categories];
                newCategories[existingIndex] = updatedCategory;
            } else {
                // CREAZIONE: Aggiungiamo la nuova categoria
                newCategories = [...board.categories, updatedCategory];
            }

            return { ...board, categories: newCategories };
        }));
    };

    // 3. Eliminazione Categoria
    const handleDeleteCategory = (categoryId: string | number) => {
        if (!activeBoardId) return;

        setBoards(prev => prev.map(board => {
            if (board.id !== activeBoardId) return board;
            return {
                ...board,
                categories: board.categories.filter(c => c.id !== categoryId)
            };
        }));
    };

    // --- FILTRAGGIO E DATI ---

    // Filtra le bacheche in base alla ricerca
    const filteredBoards = boards.filter(board =>
        board.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Recupera l'oggetto della bacheca attiva per passarlo al dialog
    const activeBoard = boards.find(b => b.id === activeBoardId);

    return (
        <div className="p-6 lg:p-10 max-w-7xl mx-auto pb-20 space-y-8">

            {/* Header Pagina */}
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

                {/* Search Bar */}
                <div className="relative w-full md:w-72 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Cerca bacheca..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                    />
                </div>
            </div>

            {/* Grid delle Bacheche */}
            {filteredBoards.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl">
                    <LayoutGrid className="w-12 h-12 text-slate-300 mb-3" />
                    <p className="text-slate-500 font-medium">Nessuna bacheca trovata</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {filteredBoards.map((board) => (
                        <CategoryCard
                            key={board.id}
                            id={board.id}
                            title={board.title}
                            theme={board.theme}
                            categories={board.categories}
                            icon={board.icon}
                            onEdit={() => handleOpenDialog(board.id)} // Apre il dialog unificato
                        />
                    ))}
                </div>
            )}

            {/* --- DIALOG UNICO PER EDIT/CREATE --- */}
            {/* Viene renderizzato solo se c'è una board attiva */}
            {activeBoard && (
                <EditCategoryDialog
                    isOpen={!!activeBoard}
                    boardName={activeBoard.title}
                    categories={activeBoard.categories}
                    onClose={handleCloseDialog}
                    onSaveCategory={handleSaveCategory}
                    onDeleteCategory={handleDeleteCategory}
                />
            )}
        </div>
    );
}