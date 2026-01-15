'use client';

import React, { useState, useEffect } from 'react';
import { X, Loader2, Save, Trash2, Edit2, Plus } from 'lucide-react';
import { Board } from "@/public/Board";
import { Category, getCategoryColorClass} from '@/public/Category';
import EditSingleCategoryDialog from './EditSingleCategoryDialog';
import CreateCategoryDialog from './CreateCategoryDialog';

interface EditBoardDialogProps {
    isOpen: boolean;
    initialData: Board | null;
    onClose: () => void;
    onUpdate: (updatedData: Board) => void;
}

export default function EditCategoryDialog({
                                            isOpen,
                                            initialData,
                                            onClose,
                                            onUpdate,
                                        }: EditBoardDialogProps) {

    // Stati del Form
    const [isLoading, setIsLoading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [deletingCategoryId, setDeletingCategoryId] = useState<string | number | null>(null);
    const [showCreateDialog, setShowCreateDialog] = useState(false);

    // --- EFFETTO DI SINCRONIZZAZIONE ---
    useEffect(() => {
        if (isOpen && initialData) {
            setCategories(initialData.categories);
        }
    }, [isOpen, initialData]);

    if (!isOpen || !initialData) return null;

    // --- HANDLERS ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        
        const updatedBoard = { ...initialData, categories };
        onUpdate(updatedBoard);
        
        setIsLoading(false);
    };

    const handleDeleteCategory = (id: string | number) => {
        setCategories(categories.filter(cat => cat.id !== id));
        setDeletingCategoryId(null);
    };

    const handleEditCategory = (updatedCategory: Category) => {
        setCategories(categories.map(category =>
            category.id === updatedCategory.id ? updatedCategory : category
        ));
        setEditingCategory(null);
    };

    const handleCreateCategory = (newCategory: Category) => {
        setCategories([...categories, newCategory]);
        setShowCreateDialog(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white sticky top-0 z-10">
                    <h2 className="text-lg font-bold text-slate-800">Modifica Categorie</h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body Scrollable */}
                <div className="overflow-y-auto p-6 space-y-6 flex-1">
                    <form id="edit-board-form" onSubmit={handleSubmit} className="space-y-6">
                        {/* Lista delle Categorie */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-3">
                                Categorie
                            </label>
                            <div className="space-y-2">
                                {categories.map((category) => (
                                    <div
                                        key={category.id}
                                        className={`${getCategoryColorClass(category.color)} group flex items-center justify-between gap-2 backdrop-blur-sm text-xs text-black font-medium px-3 py-2.5 rounded-lg border border-black/10 transition-all hover:shadow-md`}
                                    >
                                        <span className="flex-1">{category.name}</span>
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                type="button"
                                                onClick={() => setEditingCategory(category)}
                                                className="p-1.5 bg-white/80 rounded-md hover:bg-white transition-colors"
                                                title="Modifica"
                                            >
                                                <Edit2 className="w-3.5 h-3.5 text-slate-700" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setDeletingCategoryId(category.id)}
                                                className="p-1.5 bg-white/80 rounded-md hover:bg-red-100 transition-colors"
                                                title="Elimina"
                                            >
                                                <Trash2 className="w-3.5 h-3.5 text-red-600" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Pulsante Crea Nuova Categoria */}
                        <button
                            type="button"
                            onClick={() => setShowCreateDialog(true)}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-dashed border-slate-300 text-slate-600 font-medium rounded-lg hover:border-slate-400 hover:bg-slate-50 transition-all"
                        >
                            <Plus className="w-4 h-4" />
                            Crea Nuova Categoria
                        </button>
                    </form>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-gray-50/50">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-slate-600 text-sm font-medium hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        Annulla
                    </button>
                    <button
                        type="submit"
                        form="edit-board-form"
                        disabled={isLoading || categories.length === 0}
                        className="px-5 py-2 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-all disabled:opacity-70 flex items-center gap-2"
                    >
                        {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        <span>Salva Modifiche</span>
                    </button>
                </div>

                {/* Dialog Modifica Categoria */}
                <EditSingleCategoryDialog
                    isOpen={!!editingCategory}
                    category={editingCategory}
                    onClose={() => setEditingCategory(null)}
                    onSave={handleEditCategory}
                />

                {/* Dialog Creazione Categoria */}
                <CreateCategoryDialog
                    isOpen={showCreateDialog}
                    onClose={() => setShowCreateDialog(false)}
                    onAdd={handleCreateCategory}
                />

                {/* Dialog Conferma Eliminazione */}
                {deletingCategoryId !== null && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                        <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
                            <div className="px-6 py-4 border-b border-slate-100">
                                <h3 className="text-lg font-bold text-slate-800">Elimina Categoria</h3>
                            </div>
                            <div className="p-6">
                                <p className="text-slate-600 text-sm">
                                    Sei sicuro di voler eliminare questa categoria? L'azione non può essere annullata.
                                </p>
                            </div>
                            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-gray-50/50">
                                <button
                                    type="button"
                                    onClick={() => setDeletingCategoryId(null)}
                                    className="px-4 py-2 text-slate-600 text-sm font-medium hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    Annulla
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleDeleteCategory(deletingCategoryId)}
                                    className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    Elimina
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}