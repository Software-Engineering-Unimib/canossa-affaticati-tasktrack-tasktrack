'use client';

import React, { useState, useEffect } from 'react';
import {
    Search,
    LayoutGrid,
    Tag,
    Loader2
} from 'lucide-react';

// Import Logica Reale
import { useAuth } from '@/app/context/AuthContext';
import { BoardModel, CategoryModel } from '@/models';
import { Board } from '@/items/Board';
import { Category } from '@/items/Category';

// Import Componenti
import CategoryCard from '@/app/components/categories/CategoryCard';
import EditCategoryDialog from '@/app/components/categories/EditCategoryDialog';

export default function CategoriesPage() {
    const { user } = useAuth();

    // --- STATI ---
    const [boards, setBoards] = useState<Board[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // --- STATO DIALOG ---
    const [activeBoardId, setActiveBoardId] = useState<string | null>(null);

    // --- FETCH DATI ---
    const fetchData = async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            // Scarichiamo le bacheche (che includono già le categorie grazie al Model)
            const data = await BoardModel.getAllBoards();
            setBoards(data);
        } catch (error) {
            console.error("Errore caricamento categorie:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user]);

    // --- HANDLERS ---

    // 1. Apertura Dialog
    const handleOpenDialog = (boardId: string) => {
        setActiveBoardId(boardId);
    };

    const handleCloseDialog = () => {
        setActiveBoardId(null);
    };

    // 2. Salvataggio Categoria (Creazione o Modifica)
    const handleSaveCategory = async (categoryData: Category) => {
        if (!activeBoardId) return;

        try {
            // Se la categoria ha un ID numerico (o stringa numerica valida), è un update.
            // Se l'ID è temporaneo (generato dal frontend) o mancante, è una create.
            const isExisting = categoryData.id && !String(categoryData.id).startsWith('temp');

            if (isExisting) {
                // UPDATE
                await CategoryModel.updateCategory(categoryData.id, {
                    name: categoryData.name,
                    color: categoryData.color
                });
            } else {
                // CREATE
                await CategoryModel.createCategory(
                    activeBoardId,
                    categoryData.name,
                    categoryData.color
                );
            }

            // Ricarica i dati per vedere le modifiche
            await fetchData();

        } catch (error) {
            console.error("Errore salvataggio categoria:", error);
            alert("Errore durante il salvataggio.");
        }
    };

    // 3. Eliminazione Categoria
    const handleDeleteCategory = async (categoryId: string | number) => {
        if (!activeBoardId) return;

        // Conferma extra per sicurezza
        if(!confirm("Vuoi davvero eliminare questa etichetta?")) return;

        try {
            await CategoryModel.deleteCategory(categoryId);
            await fetchData(); // Ricarica i dati
        } catch (error) {
            console.error("Errore eliminazione categoria:", error);
            alert("Errore durante l'eliminazione.");
        }
    };

    // --- FILTRAGGIO ---
    const filteredBoards = boards.filter(board =>
        board.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Recupera l'oggetto della bacheca attiva per passarlo al dialog
    const activeBoard = boards.find(b => b.id === activeBoardId);

    // --- RENDER LOADING ---
    if (isLoading && boards.length === 0) {
        return (
            <div className="flex h-full w-full items-center justify-center min-h-[50vh]">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            </div>
        );
    }

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
                    <p className="text-slate-500 font-medium">
                        {searchQuery ? `Nessuna bacheca trovata per "${searchQuery}"` : "Non hai ancora bacheche attive."}
                    </p>
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