'use client';

import React, { useState, useEffect } from 'react';
import { X, Check, Trash2, Save, Tag } from 'lucide-react';

export type CategoryColor = 'red' | 'orange' | 'amber' | 'green' | 'blue' | 'indigo' | 'purple' | 'pink' | 'slate';

export interface CategoryData {
    id: string;
    name: string;
    color: CategoryColor;
}

interface EditCategoryDialogProps {
    isOpen: boolean;
    category: CategoryData | null;
    onClose: () => void;
    onSave: (updatedCategory: CategoryData) => void;
    onDelete: (categoryId: string) => void;
}

// Mappa dei colori disponibili per la selezione
const colorOptions: { value: CategoryColor; class: string }[] = [
    { value: 'slate', class: 'bg-slate-500' },
    { value: 'red', class: 'bg-red-500' },
    { value: 'orange', class: 'bg-orange-500' },
    { value: 'amber', class: 'bg-amber-500' },
    { value: 'green', class: 'bg-emerald-500' },
    { value: 'blue', class: 'bg-blue-500' },
    { value: 'indigo', class: 'bg-indigo-500' },
    { value: 'purple', class: 'bg-purple-500' },
    { value: 'pink', class: 'bg-pink-500' },
];

export default function EditCategoryDialog({ isOpen, category, onClose, onSave, onDelete }: EditCategoryDialogProps) {
    const [name, setName] = useState('');
    const [selectedColor, setSelectedColor] = useState<CategoryColor>('slate');

    useEffect(() => {
        if (isOpen && category) {
            setName(category.name);
            setSelectedColor(category.color);
        }
    }, [isOpen, category]);

    if (!isOpen || !category) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...category, name, color: selectedColor });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Tag className="w-4 h-4" />
                        Modifica Categoria
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">

                    {/* Input Nome */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Nome Categoria</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                            placeholder="Es. Urgente, Analisi..."
                        />
                    </div>

                    {/* Color Picker */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Colore Etichetta</label>
                        <div className="flex flex-wrap gap-2">
                            {colorOptions.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => setSelectedColor(option.value)}
                                    className={`
                    w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-105 ring-2 ring-offset-2
                    ${option.class}
                    ${selectedColor === option.value ? 'ring-slate-400 scale-110' : 'ring-transparent'}
                  `}
                                >
                                    {selectedColor === option.value && <Check className="w-4 h-4 text-white" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between pt-4">
                        <button
                            type="button"
                            onClick={() => {
                                onDelete(category.id);
                                onClose();
                            }}
                            className="flex items-center gap-2 text-red-500 hover:text-red-700 text-sm font-medium px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                            Elimina
                        </button>

                        <button
                            type="submit"
                            disabled={!name.trim()}
                            className="px-5 py-2 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-all flex items-center gap-2"
                        >
                            <Save className="w-4 h-4" />
                            Salva
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}