'use client';

import React, { useState, useEffect } from 'react';
import { X, Loader2, Save } from 'lucide-react';
import { Board } from "@/public/Board";
import { Category } from '@/public/Category';

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
                <div className="overflow-y-auto p-6 space-y-6">
                    <form id="edit-board-form" onSubmit={handleSubmit} className="space-y-6">
                        {/* Lista delle Categorie */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-3">
                                Categorie
                            </label>
                            <div className="mt-auto gap-2">
                                {categories.map((category) => (
                                    <span 
                                        key={category.id} 
                                        className={`${category.color} flex items-center gap-2 backdrop-blur-sm text-xs strong text-black font-medium px-2 py-1 rounded-md border-1`}
                                    >
                                        {category.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </form>
                </div>



                {/* Footer Actions */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-gray-50/50">
                    <div className="flex items-center gap-3">
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
                </div>

            </div>
        </div>
    );
}