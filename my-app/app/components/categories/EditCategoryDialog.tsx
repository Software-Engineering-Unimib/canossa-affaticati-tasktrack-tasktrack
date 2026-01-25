/**
 * @fileoverview Dialog per la gestione delle categorie di una bacheca.
 *
 * Supporta:
 * - Lista categorie esistenti con ricerca
 * - Creazione nuove categorie
 * - Modifica ed eliminazione categorie esistenti
 *
 * @module components/categories/EditCategoryDialog
 */

'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
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
    Loader2,
} from 'lucide-react';

import { Category, themeCategoryOptions } from '@/items/Category';

/**
 * Props del componente.
 */
interface EditCategoryDialogProps {
    isOpen: boolean;
    boardName: string;
    categories: Category[];
    onClose: () => void;
    onSaveCategory: (category: Category) => void;
    onDeleteCategory: (categoryId: string | number) => void;
}

/**
 * Modalità del dialog.
 */
type DialogMode = 'list' | 'create' | 'edit';

/**
 * Stato del form.
 */
interface FormState {
    name: string;
    color: string;
    editingId: string | null;
}

/**
 * Stato iniziale del form.
 */
const INITIAL_FORM_STATE: FormState = {
    name: '',
    color: 'blue',
    editingId: null,
};

/**
 * Genera un ID temporaneo per nuove categorie.
 */
function generateTempId(): string {
    return `temp-${Date.now()}`;
}

/**
 * Ottiene le classi CSS per un colore.
 */
function getColorPreviewClass(colorValue: string): string {
    const option = themeCategoryOptions.find(o => o.value === colorValue);
    return option?.class ?? 'bg-slate-200';
}

/**
 * Dialog per gestione categorie.
 */
export default function EditCategoryDialog({
                                               isOpen,
                                               boardName,
                                               categories,
                                               onClose,
                                               onSaveCategory,
                                               onDeleteCategory,
                                           }: EditCategoryDialogProps): React.ReactElement | null {
    // Stati
    const [searchQuery, setSearchQuery] = useState('');
    const [mode, setMode] = useState<DialogMode>('list');
    const [formState, setFormState] = useState<FormState>(INITIAL_FORM_STATE);
    const [isSaving, setIsSaving] = useState(false);

    // Reset all'apertura
    useEffect(() => {
        if (isOpen) {
            setMode('list');
            setSearchQuery('');
            setFormState(INITIAL_FORM_STATE);
            setIsSaving(false);
        }
    }, [isOpen]);

    // Categorie filtrate
    const filteredCategories = useMemo(() => {
        if (!searchQuery.trim()) return categories;

        const query = searchQuery.toLowerCase();
        return categories.filter(cat =>
            cat.name.toLowerCase().includes(query)
        );
    }, [categories, searchQuery]);

    // Rileva modifiche
    const hasChanges = useMemo(() => {
        if (mode === 'create') {
            return formState.name.trim().length > 0;
        }
        if (mode === 'edit' && formState.editingId) {
            const original = categories.find(c => c.id === formState.editingId);
            if (!original) return false;
            return original.name !== formState.name || original.color !== formState.color;
        }
        return false;
    }, [mode, formState, categories]);

    // ═══════════════════════════════════════════════════════════
    // HANDLERS
    // ═══════════════════════════════════════════════════════════

    const handleStartCreate = useCallback(() => {
        setFormState(INITIAL_FORM_STATE);
        setMode('create');
    }, []);

    const handleStartEdit = useCallback((category: Category) => {
        setFormState({
            name: category.name,
            color: category.color,
            editingId: category.id as string,
        });
        setMode('edit');
    }, []);

    const handleBackToList = useCallback(() => {
        setMode('list');
        setFormState(INITIAL_FORM_STATE);
    }, []);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!hasChanges || isSaving) return;

        setIsSaving(true);

        const categoryId = mode === 'edit' && formState.editingId
            ? formState.editingId
            : generateTempId();

        const categoryToSave: Category = {
            id: categoryId,
            name: formState.name,
            color: formState.color,
        };

        await onSaveCategory(categoryToSave);

        setIsSaving(false);
        handleBackToList();
    }, [hasChanges, isSaving, mode, formState, onSaveCategory, handleBackToList]);

    const handleDelete = useCallback(() => {
        if (formState.editingId) {
            onDeleteCategory(formState.editingId);
            handleBackToList();
        }
    }, [formState.editingId, onDeleteCategory, handleBackToList]);

    const updateFormField = useCallback((field: keyof FormState, value: string) => {
        setFormState(prev => ({ ...prev, [field]: value }));
    }, []);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200"
            role="dialog"
            aria-modal="true"
        >
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-4xl h-[600px] overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-200">

                {/* Tasto chiudi */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-50 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors bg-white/80 backdrop-blur-sm md:bg-transparent"
                    aria-label="Chiudi"
                >
                    <X className="w-6 h-6" />
                </button>

                {/* Colonna sinistra: Lista */}
                <CategoryListPanel
                    isVisible={mode === 'list'}
                    boardName={boardName}
                    categories={filteredCategories}
                    searchQuery={searchQuery}
                    selectedId={formState.editingId}
                    isEditMode={mode === 'edit'}
                    onSearchChange={setSearchQuery}
                    onCreateClick={handleStartCreate}
                    onCategoryClick={handleStartEdit}
                />

                {/* Colonna destra: Form */}
                <CategoryFormPanel
                    mode={mode}
                    formState={formState}
                    hasChanges={hasChanges}
                    isSaving={isSaving}
                    onNameChange={(value) => updateFormField('name', value)}
                    onColorChange={(value) => updateFormField('color', value)}
                    onSubmit={handleSubmit}
                    onDelete={handleDelete}
                    onBack={handleBackToList}
                />
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════
// COMPONENTI INTERNI
// ══════════════════════════════════════════════════════════���════════

/**
 * Pannello lista categorie (colonna sinistra).
 */
function CategoryListPanel({
                               isVisible,
                               boardName,
                               categories,
                               searchQuery,
                               selectedId,
                               isEditMode,
                               onSearchChange,
                               onCreateClick,
                               onCategoryClick,
                           }: {
    isVisible: boolean;
    boardName: string;
    categories: Category[];
    searchQuery: string;
    selectedId: string | null;
    isEditMode: boolean;
    onSearchChange: (value: string) => void;
    onCreateClick: () => void;
    onCategoryClick: (category: Category) => void;
}) {
    return (
        <div className={`
            w-full md:w-1/2 flex flex-col border-r border-slate-100 bg-slate-50/50
            ${isVisible ? 'flex' : 'hidden md:flex'}
        `}>
            {/* Header */}
            <div className="p-4 border-b border-slate-200/60 bg-white flex justify-between items-center h-[69px]">
                <div>
                    <h3 className="font-bold text-slate-800">Categorie</h3>
                    <p
                        className="text-xs text-slate-500 truncate max-w-[200px]"
                        title={boardName}
                    >
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
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                </div>
                <button
                    onClick={onCreateClick}
                    className="w-full py-2.5 rounded-xl text-sm font-semibold border border-dashed border-slate-300 text-slate-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 transition-all flex items-center justify-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Nuova Categoria
                </button>
            </div>

            {/* Lista scrollabile */}
            <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2 custom-scrollbar">
                {categories.length === 0 ? (
                    <EmptyListMessage hasSearch={!!searchQuery} />
                ) : (
                    categories.map(cat => (
                        <CategoryListItem
                            key={cat.id}
                            category={cat}
                            isSelected={selectedId === cat.id && isEditMode}
                            onClick={() => onCategoryClick(cat)}
                        />
                    ))
                )}
            </div>
        </div>
    );
}

/**
 * Messaggio lista vuota.
 */
function EmptyListMessage({ hasSearch }: { hasSearch: boolean }) {
    return (
        <div className="text-center py-8 text-slate-400 text-sm">
            {hasSearch ? 'Nessuna categoria trovata.' : 'Nessuna categoria presente.'}
        </div>
    );
}

/**
 * Item della lista categorie.
 */
function CategoryListItem({
                              category,
                              isSelected,
                              onClick,
                          }: {
    category: Category;
    isSelected: boolean;
    onClick: () => void;
}) {
    return (
        <div
            onClick={onClick}
            className={`
                group flex items-center justify-between p-3 rounded-xl cursor-pointer border transition-all
                ${isSelected
                ? 'bg-white border-blue-500 shadow-md ring-1 ring-blue-500/20'
                : 'bg-white border-slate-100 hover:border-blue-300 hover:shadow-sm'
            }
            `}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onClick()}
        >
            <div className="flex items-center gap-3">
                <div
                    className={`w-3 h-3 rounded-full ${getColorPreviewClass(category.color)}`}
                    aria-hidden="true"
                />
                <span className="font-medium text-slate-700 text-sm truncate max-w-[180px]">
                    {category.name}
                </span>
            </div>
            <ChevronRight
                className={`w-4 h-4 ${isSelected ? 'text-blue-500' : 'text-slate-300 group-hover:text-slate-500'}`}
                aria-hidden="true"
            />
        </div>
    );
}

/**
 * Pannello form categoria (colonna destra).
 */
function CategoryFormPanel({
                               mode,
                               formState,
                               hasChanges,
                               isSaving,
                               onNameChange,
                               onColorChange,
                               onSubmit,
                               onDelete,
                               onBack,
                           }: {
    mode: DialogMode;
    formState: FormState;
    hasChanges: boolean;
    isSaving: boolean;
    onNameChange: (value: string) => void;
    onColorChange: (value: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    onDelete: () => void;
    onBack: () => void;
}) {
    const isFormVisible = mode !== 'list';

    return (
        <div className={`
            w-full md:w-1/2 flex flex-col bg-white
            ${mode === 'list' ? 'hidden md:flex' : 'flex'}
        `}>
            {/* Header */}
            <FormPanelHeader
                mode={mode}
                onBack={onBack}
                onDelete={mode === 'edit' ? onDelete : undefined}
            />

            {/* Contenuto */}
            {mode === 'list' ? (
                <FormPlaceholder />
            ) : (
                <CategoryFormContent
                    formState={formState}
                    isSaving={isSaving}
                    onNameChange={onNameChange}
                    onColorChange={onColorChange}
                    onSubmit={onSubmit}
                />
            )}

            {/* Footer */}
            {isFormVisible && (
                <FormPanelFooter
                    hasChanges={hasChanges}
                    isSaving={isSaving}
                    onCancel={onBack}
                />
            )}
        </div>
    );
}

/**
 * Header del pannello form.
 */
function FormPanelHeader({
                             mode,
                             onBack,
                             onDelete,
                         }: {
    mode: DialogMode;
    onBack: () => void;
    onDelete?: () => void;
}) {
    if (mode === 'list') {
        return (
            <div className="p-4 border-b border-slate-100 flex items-center h-[69px]">
                <div className="hidden md:flex items-center gap-2 text-slate-400">
                    <AlertCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">Seleziona o crea una categoria</span>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 border-b border-slate-100 flex items-center justify-between h-[69px]">
            <div className="flex items-center gap-3 w-full pr-8">
                <button
                    onClick={onBack}
                    className="md:hidden p-1 -ml-2 text-slate-400 hover:text-slate-700"
                    aria-label="Torna alla lista"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <span className="font-bold text-slate-800 text-lg">
                    {mode === 'create' ? 'Nuova Categoria' : 'Modifica Categoria'}
                </span>
                {onDelete && (
                    <button
                        onClick={onDelete}
                        className="ml-auto p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Elimina"
                        aria-label="Elimina categoria"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                )}
            </div>
        </div>
    );
}

/**
 * Placeholder quando nessuna categoria è selezionata.
 */
function FormPlaceholder() {
    return (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center bg-slate-50/30">
            <Palette className="w-12 h-12 mb-4 opacity-20" aria-hidden="true" />
            <p className="text-sm">
                Seleziona una categoria dalla lista per modificarla
                <br />
                oppure creane una nuova.
            </p>
        </div>
    );
}

/**
 * Contenuto del form categoria.
 */
function CategoryFormContent({
                                 formState,
                                 isSaving,
                                 onNameChange,
                                 onColorChange,
                                 onSubmit,
                             }: {
    formState: FormState;
    isSaving: boolean;
    onNameChange: (value: string) => void;
    onColorChange: (value: string) => void;
    onSubmit: (e: React.FormEvent) => void;
}) {
    return (
        <div className="flex-1 overflow-y-auto p-6">
            <form id="category-form" onSubmit={onSubmit} className="space-y-6">
                {/* Nome */}
                <div className="space-y-2">
                    <label
                        htmlFor="category-name"
                        className="text-xs font-bold text-slate-500 uppercase tracking-wider"
                    >
                        Nome Categoria
                    </label>
                    <input
                        id="category-name"
                        type="text"
                        value={formState.name}
                        onChange={(e) => onNameChange(e.target.value)}
                        placeholder="Es. Marketing, Bug..."
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        autoFocus
                        disabled={isSaving}
                    />
                </div>

                {/* Colore */}
                <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Colore Etichetta
                    </label>
                    <ColorPicker
                        selectedColor={formState.color}
                        onColorChange={onColorChange}
                        disabled={isSaving}
                    />
                </div>
            </form>
        </div>
    );
}

/**
 * Selettore colore.
 */
function ColorPicker({
                         selectedColor,
                         onColorChange,
                         disabled,
                     }: {
    selectedColor: string;
    onColorChange: (color: string) => void;
    disabled: boolean;
}) {
    return (
        <div className="grid grid-cols-3 gap-3" role="radiogroup" aria-label="Seleziona colore">
            {themeCategoryOptions.map((option) => {
                const isSelected = selectedColor === option.value;

                return (
                    <button
                        key={option.value}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => onColorChange(option.value)}
                        disabled={disabled}
                        className={`
                            relative h-12 rounded-xl border-2 transition-all flex items-center justify-center
                            ${isSelected
                            ? 'border-slate-800 scale-105 shadow-md'
                            : 'border-transparent hover:border-slate-200 hover:scale-105'
                        }
                            disabled:opacity-50 disabled:cursor-not-allowed
                        `}
                    >
                        <div className={`absolute inset-1 rounded-lg opacity-90 ${option.class}`} />
                        <span className="relative z-10 text-xs font-medium text-white/90 drop-shadow-sm">
                            {isSelected ? <Check className="w-5 h-5 text-white" /> : option.label}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}

/**
 * Footer del pannello form.
 */
function FormPanelFooter({
                             hasChanges,
                             isSaving,
                             onCancel,
                         }: {
    hasChanges: boolean;
    isSaving: boolean;
    onCancel: () => void;
}) {
    return (
        <div className="p-4 border-t border-slate-100 bg-white flex justify-end gap-3">
            <button
                type="button"
                onClick={onCancel}
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
    );
}