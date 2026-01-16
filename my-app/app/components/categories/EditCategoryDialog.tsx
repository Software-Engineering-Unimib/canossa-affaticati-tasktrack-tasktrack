'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
    X,
    Plus,
    Search,
    Trash2,
    Save,
    AlertCircle,
    Check,
    Palette,
    ArrowLeft,
    ChevronRight,
    Loader2
} from 'lucide-react';

// Import Dati e Tipi dai tuoi file
import { Category, themeCategoryOptions } from '@/items/Category';

interface EditCategoryDialogProps {
    isOpen: boolean;
    boardName: string;
    categories: Category[];
    onClose: () => void;
    onSaveCategory: (category: Category) => void;
    onDeleteCategory: (categoryId: string | number) => void;
}

export default function EditCategoryDialog({
                                               isOpen,
                                               boardName,
                                               categories,
                                               onClose,
                                               onSaveCategory,
                                               onDeleteCategory
                                           }: EditCategoryDialogProps) {

    // --- STATI INTERNI ---
    const [searchQuery, setSearchQuery] = useState('');
    const [mode, setMode] = useState<'list' | 'create' | 'edit'>('list');
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form State
    const [formName, setFormName] = useState('');
    // Default blue usando il value definito in themeCategoryOptions
    const [formColor, setFormColor] = useState<string>('blue');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setMode('list');
            setSearchQuery('');
            resetForm();
            setIsSaving(false);
        }
    }, [isOpen]);

    const resetForm = () => {
        setFormName('');
        setFormColor('blue');
        setEditingId(null);
    };

    const filteredCategories = useMemo(() => {
        return categories.filter(cat =>
            cat.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [categories, searchQuery]);

    const handleStartCreate = () => {
        resetForm();
        setMode('create');
    };

    const handleStartEdit = (cat: Category) => {
        setEditingId(cat.id);
        setFormName(cat.name);
        setFormColor(cat.color);
        setMode('edit');
    };

    const hasChanges = useMemo(() => {
        if (mode === 'create') {
            return formName.trim().length > 0;
        }
        if (mode === 'edit' && editingId !== null) {
            const original = categories.find(c => c.id === editingId);
            if (!original) return false;
            return original.name !== formName || original.color !== formColor;
        }
        return false;
    }, [mode, formName, formColor, editingId, categories]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!hasChanges || isSaving) return;

        setIsSaving(true);

        const finalId = (mode === 'edit' && editingId !== null)
            ? editingId
            : `temp-${Date.now()}`;

        const newCategory: Category = {
            id: finalId,
            name: formName,
            color: formColor
        };

        await onSaveCategory(newCategory);

        setIsSaving(false);
        setMode('list');
        resetForm();
    };

    const handleDelete = () => {
        if (editingId !== null) {
            onDeleteCategory(editingId);
            setMode('list');
            resetForm();
        }
    };

    // Helper per estrarre classi pulite per l'anteprima (rimuove text-white e hover effects se necessario)
    // Ma per semplicità usiamo la classe completa fornita, che include il colore di sfondo.
    const getPreviewClass = (colorValue: string) => {
        const option = themeCategoryOptions.find(o => o.value === colorValue);
        return option ? option.class : 'bg-slate-200';
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">

            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-4xl h-[600px] overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-200">

                {/* --- TASTO CHIUSURA FISSO --- */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-50 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors bg-white/80 backdrop-blur-sm md:bg-transparent"
                    title="Chiudi"
                >
                    <X className="w-6 h-6" />
                </button>

                {/* COLONNA SINISTRA (Lista) */}
                <div className={`
                    w-full md:w-1/2 flex flex-col border-r border-slate-100 bg-slate-50/50
                    ${mode !== 'list' ? 'hidden md:flex' : 'flex'}
                `}>
                    {/* Header Lista */}
                    <div className="p-4 border-b border-slate-200/60 bg-white flex justify-between items-center sticky top-0 h-[69px]">
                        <div>
                            <h3 className="font-bold text-slate-800">Categorie</h3>
                            <p className="text-xs text-slate-500 truncate max-w-[200px]" title={boardName}>
                                {boardName}
                            </p>
                        </div>
                    </div>

                    {/* Search & Add */}
                    <div className="p-4 space-y-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Cerca..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                        </div>
                        <button
                            onClick={handleStartCreate}
                            className={`w-full py-2.5 rounded-xl text-sm font-semibold border border-dashed border-slate-300 text-slate-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-2
                            ${mode === 'create' ? 'ring-2 ring-blue-500 border-transparent bg-blue-50 text-blue-700' : ''}`}
                        >
                            <Plus className="w-4 h-4" />
                            Nuova Categoria
                        </button>
                    </div>

                    {/* Lista Scrollabile */}
                    <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2 custom-scrollbar">
                        {filteredCategories.length === 0 ? (
                            <div className="text-center py-8 text-slate-400 text-sm">
                                {searchQuery ? 'Nessuna categoria trovata.' : 'Nessuna categoria presente.'}
                            </div>
                        ) : (
                            filteredCategories.map(cat => (
                                <div
                                    key={cat.id}
                                    onClick={() => handleStartEdit(cat)}
                                    className={`
                                        group flex items-center justify-between p-3 rounded-xl cursor-pointer border transition-all
                                        ${editingId === cat.id && mode === 'edit'
                                        ? 'bg-white border-blue-500 shadow-md ring-1 ring-blue-500/20'
                                        : 'bg-white border-slate-100 hover:border-blue-300 hover:shadow-sm'
                                    }
                                    `}
                                >
                                    <div className="flex items-center gap-3">
                                        {/* Pallino colore: usiamo la classe definita nell'item Category */}
                                        <div className={`w-3 h-3 rounded-full ${getPreviewClass(cat.color)}`}></div>
                                        <span className="font-medium text-slate-700 text-sm truncate max-w-[180px]">{cat.name}</span>
                                    </div>
                                    <ChevronRight className={`w-4 h-4 text-slate-300 ${editingId === cat.id ? 'text-blue-500' : 'group-hover:text-slate-500'}`} />
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* COLONNA DESTRA (Form) */}
                <div className={`
                    w-full md:w-1/2 flex flex-col bg-white
                    ${mode === 'list' ? 'hidden md:flex' : 'flex'}
                `}>

                    {/* Header Form */}
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between h-[69px]">
                        {mode === 'list' ? (
                            <div className="hidden md:flex items-center gap-2 text-slate-400">
                                <AlertCircle className="w-5 h-5" />
                                <span className="text-sm font-medium">Seleziona o crea una categoria</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 w-full pr-8">
                                <button onClick={() => setMode('list')} className="md:hidden p-1 -ml-2 text-slate-400 hover:text-slate-700">
                                    <ArrowLeft className="w-5 h-5" />
                                </button>
                                <span className="font-bold text-slate-800 text-lg">
                                    {mode === 'create' ? 'Nuova Categoria' : 'Modifica Categoria'}
                                </span>
                                <div className="ml-auto flex items-center gap-2">
                                    {mode === 'edit' && (
                                        <button onClick={handleDelete} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Elimina">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Contenuto Form */}
                    {mode === 'list' ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center bg-slate-50/30">
                            <Palette className="w-12 h-12 mb-4 opacity-20" />
                            <p className="text-sm">Seleziona una categoria dalla lista per modificarla <br/> oppure creane una nuova.</p>
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto p-6">
                            <form id="category-form" onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nome Categoria</label>
                                    <input
                                        type="text"
                                        value={formName}
                                        onChange={(e) => setFormName(e.target.value)}
                                        placeholder="Es. Marketing, Bug..."
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                                        autoFocus
                                        disabled={isSaving}
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Colore Etichetta</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {/* Iteriamo su themeCategoryOptions invece dell'array locale */}
                                        {themeCategoryOptions.map((option) => (
                                            <button
                                                key={option.value}
                                                type="button"
                                                onClick={() => setFormColor(option.value)}
                                                disabled={isSaving}
                                                className={`
                                                    relative h-12 rounded-xl border-2 transition-all flex items-center justify-center
                                                    ${formColor === option.value
                                                    ? 'border-slate-800 scale-105 shadow-md'
                                                    : 'border-transparent hover:border-slate-200 hover:scale-105'
                                                }
                                                `}
                                            >
                                                {/* Usiamo option.class per il colore di sfondo */}
                                                <div className={`absolute inset-1 rounded-lg opacity-90 ${option.class}`}></div>

                                                {/* Mostriamo label o check */}
                                                <span className="relative z-10 text-xs font-medium text-white/90 drop-shadow-sm">
                                                    {formColor === option.value ? <Check className="w-5 h-5 text-white" /> : option.label}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Footer Form */}
                    {mode !== 'list' && (
                        <div className="p-4 border-t border-slate-100 bg-white flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setMode('list')}
                                disabled={isSaving}
                                className="px-4 py-2 text-slate-500 font-medium hover:bg-slate-100 rounded-lg transition-colors text-sm"
                            >
                                Annulla
                            </button>
                            <button
                                type="submit"
                                form="category-form"
                                disabled={!hasChanges || isSaving}
                                className={`
                                    px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all shadow-lg
                                    ${hasChanges
                                    ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/20 cursor-pointer'
                                    : 'bg-slate-200 text-slate-400 shadow-none cursor-not-allowed'
                                }
                                `}
                            >
                                {isSaving ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Save className="w-4 h-4" />
                                )}
                                {isSaving ? 'Salvataggio...' : 'Salva Modifiche'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}