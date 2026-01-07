'use client';

import React, { useState } from 'react';
import { X, Check, Loader2 } from 'lucide-react';
import { Category } from '@/public/Category';

interface CreateCategoryDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (category: Category) => void;
}

// Configurazione colori per il selettore
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

export default function CreateCategoryDialog({
    isOpen,
    onClose,
    onAdd,
}: CreateCategoryDialogProps) {
  // Stati del Form
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState('bg-red-300');
  const [isLoading, setIsLoading] = useState(false);

  // Se il dialog è chiuso, non renderizzare nulla
  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simula una chiamata API o operazione asincrona
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newCategory: Category = {
        id: Date.now().toString(),
        name: name.trim(),
        color: selectedColor,
    };

    onAdd(newCategory);
    setIsLoading(false);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setName('');
    setSelectedColor('bg-red-300');
  };

  return (
    // Overlay Sfondo Scuro
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">

        {/* Contenitore Dialog */}
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-800">Crea Nuova Categoria</h2>
                <button
                    onClick={onClose}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>
            {/* Body Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">

                {/* Nome Categoria */}
                <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-1">
                        Nome Categoria <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="name"
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Es. Lavoro, Università..."
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                        autoFocus
                    />
                </div>

                {/* 2. Colore */}
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                        Scegli un colore
                    </label>
                    <div className="flex gap-3 flex-wrap">
                        {colorOptions.map((color) => (
                            <button
                                key={color.value}
                                type="button"
                                onClick={() => setSelectedColor(color.value)}
                                className={`
                                    w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-105 focus:outline-none ring-2 ring-offset-2
                                    ${color.class}
                                    ${selectedColor === color.value ? 'ring-slate-400 scale-110 shadow-md' : 'ring-transparent'}
                                `}
                                title={color.label}
                            >
                                {selectedColor === color.value && (
                                    <Check className="w-5 h-5 text-white stroke-[3]" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Footer Bottoni */}
                    <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-50">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 text-slate-600 text-sm font-medium hover:bg-slate-50 rounded-xl transition-colors"
                        >
                            Annulla
                        </button>

                        <button
                            type="submit"
                            disabled={isLoading || !name}
                            className="px-6 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                        >   
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Creazione...
                                </>
                            ) : (
                            'Crea Categoria'
                            )}
                        </button>
                    </div>
            </form>
        </div>
    </div>
);
}

