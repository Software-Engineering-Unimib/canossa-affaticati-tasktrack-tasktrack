'use client';

import React, { useState } from 'react';
import CategoryBoardCard from "@/app/components/CategoryBoardCard";
import EditCategoryDialog, {CategoryData} from "@/app/components/EditCategoryDialog";
import {BoardTheme} from "@/app/components/BoardCard";

// Struttura dati: Una Bacheca contiene N Categorie
interface BoardWithCategories {
    boardId: number;
    boardName: string;
    categories: CategoryData[];
    theme : BoardTheme;
}

// DATI MOCK INIZIALI
const initialData: BoardWithCategories[] = [
    {
        boardId: 1,
        boardName: 'Università',
        categories: [
            { id: 'c1', name: 'Iterazione 1', color: 'green' },
            { id: 'c2', name: 'Iterazione 2', color: 'amber' },
            { id: 'c3', name: 'Implementazione', color: 'red' },
            { id: 'c4', name: 'Progettazione', color: 'purple' },
            { id: 'c5', name: 'Analisi', color: 'blue' },
        ],
        theme: 'blue',
    },
    {
        boardId: 2,
        boardName: 'Personale & Hobby',
        categories: [
            { id: 'c6', name: 'Spesa', color: 'green' },
            { id: 'c7', name: 'Viaggi', color: 'blue' },
            { id: 'c8', name: 'Urgente', color: 'red' },
        ],
        theme: 'green',
    },
    {
        boardId: 3,
        boardName: 'Progetto di Tesi',
        categories: [
            { id: 'c9', name: 'Ricerca', color: 'indigo' },
            { id: 'c10', name: 'Scrittura', color: 'slate' },
            { id: 'c11', name: 'Revisione', color: 'pink' },
        ],
        theme : 'purple',
    }
];

export default function CategoriesPage() {
    const [boards, setBoards] = useState<BoardWithCategories[]>(initialData);

    // Stati per il Dialog
    const [editingCategory, setEditingCategory] = useState<CategoryData | null>(null);
    const [activeBoardId, setActiveBoardId] = useState<number | null>(null); // Per sapere a quale bacheca appartiene la cat

    // --- HANDLERS ---

    // 1. Apertura Dialog Modifica
    const handleOpenEdit = (boardId: number, category: CategoryData) => {
        setActiveBoardId(boardId);
        setEditingCategory(category);
    };

    // 2. Apertura Dialog Creazione (Simuliamo creando una cat vuota)
    const handleOpenCreate = (boardId: number) => {
        const newCat: CategoryData = {
            id: `new-${Date.now()}`,
            name: '',
            color: 'slate'
        };
        setActiveBoardId(boardId);
        setEditingCategory(newCat);
    };

    // 3. Salvataggio (Create o Update)
    const handleSaveCategory = (updatedCat: CategoryData) => {
        if (activeBoardId === null) return;

        setBoards(prevBoards => prevBoards.map(board => {
            if (board.boardId !== activeBoardId) return board;

            // Se la categoria esiste già, aggiornala
            const exists = board.categories.some(c => c.id === updatedCat.id);

            let newCategories;
            if (exists) {
                newCategories = board.categories.map(c => c.id === updatedCat.id ? updatedCat : c);
            } else {
                // Altrimenti aggiungila (nuova creazione)
                newCategories = [...board.categories, updatedCat];
            }

            return { ...board, categories: newCategories };
        }));
    };

    // 4. Eliminazione
    const handleDeleteCategory = (catId: string) => {
        if (activeBoardId === null) return;

        setBoards(prevBoards => prevBoards.map(board => {
            if (board.boardId !== activeBoardId) return board;
            return {
                ...board,
                categories: board.categories.filter(c => c.id !== catId)
            };
        }));
    };

    return (
        <div className="p-6 lg:p-10 max-w-7xl mx-auto">

            {/* Intestazione */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Gestione Categorie</h1>
                <p className="text-slate-500 mt-2">
                    Personalizza le etichette per ogni tua bacheca per organizzare meglio i task.
                </p>
            </div>

            {/* Griglia delle Bacheche */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {boards.map((board) => (
                    <CategoryBoardCard
                        key={board.boardId}
                        boardName={board.boardName}
                        categories={board.categories}
                        onEditCategory={(cat) => handleOpenEdit(board.boardId, cat)}
                        onAddCategory={() => handleOpenCreate(board.boardId)}
                        theme={board.theme}
                    />
                ))}
            </div>

            {/* Dialog Modifica/Creazione */}
            <EditCategoryDialog
                isOpen={!!editingCategory}
                category={editingCategory}
                onClose={() => setEditingCategory(null)}
                onSave={handleSaveCategory}
                onDelete={handleDeleteCategory}
            />

        </div>
    );
}