'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Category } from '@/public/Category';

interface EditSingleCategoryDialogProps {
    isOpen: boolean;
    category: Category | null;
    onClose: () => void;
    onSave: (updatedCategory: Category) => void;
}

const colorOptions: { value: string; label: string; class: string }[] = [
    { value: 'bg-red-300', label: 'Rosso', class: 'bg-red-300' },
    { value: 'bg-blue-300', label: 'Blu', class: 'bg-blue-300' },
    { value: 'bg-green-300', label: 'Verde', class: 'bg-green-300' },
    { value: 'bg-yellow-300', label: 'Giallo', class: 'bg-yellow-300' },
    { value: 'bg-purple-300', label: 'Viola', class: 'bg-purple-300' },
    { value: 'bg-pink-300', label: 'Rosa', class: 'bg-pink-300' },
    { value: 'bg-orange-300', label: 'Arancione', class: 'bg-orange-300' },
    { value: 'bg-teal-300', label: 'Teal', class: 'bg-teal-300' },
];

export default function EditSingleCategoryDialog({
    isOpen,
    category,
    onClose,
    onSave,
}: EditSingleCategoryDialogProps) {
    const [name, setName] = useState('');
    const [color, setColor] = useState('');

    React.useEffect(() => {
        if (isOpen && category) {
            setName(category.name);
            setColor(category.color);
        }
    }, [isOpen, category]);

    if (!isOpen || !category) return null;

    const handleSave = () => {
        if (name.trim()) {
            onSave({
                ...category,
                name: name.trim(),
                color,
            });
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800">Modifica Categoria</h3>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Nome Categoria <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            placeholder="Nome categoria..."
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-3">
                            Colore
                        </label>
                        <div className="flex gap-2 flex-wrap">
                            {colorOptions.map((colorOption) => (
                                <button
                                    key={colorOption.value}
                                    type="button"
                                    onClick={() => setColor(colorOption.value)}
                                    className={`w-8 h-8 rounded-full transition-transform hover:scale-105 ${colorOption.class} ${
                                        color === colorOption.value ? 'ring-2 ring-slate-800 scale-110' : ''
                                    }`}
                                    title={colorOption.label}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-gray-50/50">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-slate-600 text-sm font-medium hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        Annulla
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={!name.trim()}
                        className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-colors"
                    >
                        Salva
                    </button>
                </div>
            </div>
        </div>
    );
}
