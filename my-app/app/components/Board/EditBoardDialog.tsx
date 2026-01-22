/**
 * @fileoverview Dialog per la modifica di una bacheca esistente.
 *
 * Permette di modificare:
 * - Nome e descrizione
 * - Icona/categoria
 * - Tema colore
 * - Collaboratori (ospiti)
 *
 * Include anche la funzionalità di eliminazione con conferma.
 *
 * @module components/Board/EditBoardDialog
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { X, Trash2, Loader2, Save } from 'lucide-react';

import { Board, BoardTheme } from '@/items/Board';
import { Icon } from '@/items/BoardIcon';

// Importa componenti condivisi da CreateBoardDialog
import {
    BoardInfoSection,
    ThemeSelector,
    GuestsSection,
} from './CreateBoardDialog';

/**
 * Props del componente.
 */
interface EditBoardDialogProps {
    isOpen: boolean;
    initialData: Board | null;
    onClose: () => void;
    onUpdate: (updatedData: Board) => void;
    onDelete: (id: string | number) => void;
}

/**
 * Stato del form.
 */
interface FormState {
    title: string;
    description: string;
    icon: Icon;
    theme: BoardTheme;
    guestEmail: string;
    guests: string[];
}

/**
 * Stato iniziale del form (vuoto).
 */
const EMPTY_FORM_STATE: FormState = {
    title: '',
    description: '',
    icon: 'personal',
    theme: 'blue',
    guestEmail: '',
    guests: [],
};

/**
 * Valida un indirizzo email.
 */
function isValidEmail(email: string): boolean {
    return email.includes('@') && email.length > 3;
}

/**
 * Crea lo stato del form dai dati della bacheca.
 */
function createFormStateFromBoard(board: Board): FormState {
    return {
        title: board.title,
        description: board.description ?? '',
        icon: board.icon,
        theme: board.theme,
        guestEmail: '',
        guests: board.guests ?? [],
    };
}

/**
 * Dialog per la modifica di una bacheca.
 */
export default function EditBoardDialog({
                                            isOpen,
                                            initialData,
                                            onClose,
                                            onUpdate,
                                            onDelete,
                                        }: EditBoardDialogProps): React.ReactElement | null {
    // ═══════════════════════════════════════════════════════════
    // TUTTI GLI HOOKS DEVONO ESSERE CHIAMATI PRIMA DI QUALSIASI RETURN
    // ═══════════════════════════════════════════════════════════

    const [formState, setFormState] = useState<FormState>(EMPTY_FORM_STATE);
    const [isLoading, setIsLoading] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Sincronizza il form quando i dati iniziali cambiano
    useEffect(() => {
        if (isOpen && initialData) {
            setFormState(createFormStateFromBoard(initialData));
            setShowDeleteConfirm(false);
        }
    }, [isOpen, initialData]);

    /**
     * Aggiorna un campo del form.
     */
    const updateField = useCallback(<K extends keyof FormState>(field: K, value: FormState[K]) => {
        setFormState(prev => ({ ...prev, [field]: value }));
    }, []);

    /**
     * Aggiunge un ospite alla lista.
     */
    const handleAddGuest = useCallback(() => {
        setFormState(prev => {
            const { guestEmail, guests } = prev;
            if (isValidEmail(guestEmail) && !guests.includes(guestEmail)) {
                return {
                    ...prev,
                    guests: [...guests, guestEmail],
                    guestEmail: '',
                };
            }
            return prev;
        });
    }, []);

    /**
     * Rimuove un ospite dalla lista.
     */
    const handleRemoveGuest = useCallback((emailToRemove: string) => {
        setFormState(prev => ({
            ...prev,
            guests: prev.guests.filter(email => email !== emailToRemove),
        }));
    }, []);

    /**
     * Gestisce l'invio del form.
     */
    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formState.title.trim() || !initialData) return;

        setIsLoading(true);

        try {
            onUpdate({
                ...initialData,
                title: formState.title,
                description: formState.description,
                icon: formState.icon,
                theme: formState.theme,
                guests: formState.guests,
            });

            onClose();
        } finally {
            setIsLoading(false);
        }
    }, [formState, initialData, onUpdate, onClose]);

    /**
     * Gestisce l'eliminazione con conferma.
     */
    const handleDelete = useCallback(() => {
        if (!showDeleteConfirm) {
            setShowDeleteConfirm(true);
            return;
        }

        if (initialData) {
            onDelete(initialData.id);
            onClose();
        }
    }, [showDeleteConfirm, initialData, onDelete, onClose]);

    /**
     * Annulla la conferma di eliminazione.
     */
    const cancelDelete = useCallback(() => {
        setShowDeleteConfirm(false);
    }, []);

    /**
     * Gestisce il tasto Enter nell'input email.
     */
    const handleGuestInputKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddGuest();
        }
    }, [handleAddGuest]);

    // ═══════════════════════════════════════════════════════════
    // EARLY RETURN DOPO TUTTI GLI HOOKS
    // ═══════════════════════════════════════════════════════════

    if (!isOpen || !initialData) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-board-title"
        >
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white sticky top-0 z-10">
                    <h2 id="edit-board-title" className="text-lg font-bold text-slate-800">
                        Modifica Bacheca
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                        aria-label="Chiudi"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="overflow-y-auto p-6 space-y-6">
                    <form id="edit-board-form" onSubmit={handleSubmit} className="space-y-6">
                        {/* Sezione informazioni base */}
                        <BoardInfoSection
                            title={formState.title}
                            description={formState.description}
                            icon={formState.icon}
                            onTitleChange={(value) => updateField('title', value)}
                            onDescriptionChange={(value) => updateField('description', value)}
                            onIconChange={(value) => updateField('icon', value)}
                        />

                        {/* Sezione tema colore */}
                        <ThemeSelector
                            selectedTheme={formState.theme}
                            onThemeChange={(value) => updateField('theme', value)}
                            label="Tema Colore"
                        />

                        {/* Sezione collaboratori */}
                        <GuestsSection
                            guestEmail={formState.guestEmail}
                            guests={formState.guests}
                            onEmailChange={(value) => updateField('guestEmail', value)}
                            onAddGuest={handleAddGuest}
                            onRemoveGuest={handleRemoveGuest}
                            onKeyDown={handleGuestInputKeyDown}
                            label="Gestisci Collaboratori"
                        />

                        {/* Empty state per ospiti */}
                        {formState.guests.length === 0 && (
                            <p className="text-xs text-slate-400 italic -mt-4">
                                Nessun collaboratore invitato.
                            </p>
                        )}
                    </form>
                </div>

                {/* Footer */}
                <EditFormFooter
                    isLoading={isLoading}
                    isValid={!!formState.title.trim()}
                    showDeleteConfirm={showDeleteConfirm}
                    onDelete={handleDelete}
                    onCancelDelete={cancelDelete}
                    onCancel={onClose}
                />
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════
// COMPONENTI INTERNI
// ═══════════════════════════════════════════════════════════════════

/**
 * Footer specifico per il form di modifica.
 * Include pulsante eliminazione con conferma.
 */
function EditFormFooter({
                            isLoading,
                            isValid,
                            showDeleteConfirm,
                            onDelete,
                            onCancelDelete,
                            onCancel,
                        }: {
    isLoading: boolean;
    isValid: boolean;
    showDeleteConfirm: boolean;
    onDelete: () => void;
    onCancelDelete: () => void;
    onCancel: () => void;
}) {
    return (
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-gray-50/50">
            {/* Sezione eliminazione */}
            <DeleteSection
                showConfirm={showDeleteConfirm}
                onDelete={onDelete}
                onCancel={onCancelDelete}
            />

            {/* Sezione azioni principali */}
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isLoading}
                    className="px-4 py-2 text-slate-600 text-sm font-medium hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
                >
                    Annulla
                </button>
                <button
                    type="submit"
                    form="edit-board-form"
                    disabled={isLoading || !isValid}
                    className="px-5 py-2 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
    );
}

/**
 * Sezione eliminazione con conferma inline.
 */
function DeleteSection({
                           showConfirm,
                           onDelete,
                           onCancel,
                       }: {
    showConfirm: boolean;
    onDelete: () => void;
    onCancel: () => void;
}) {
    if (showConfirm) {
        return (
            <div className="flex items-center gap-2 animate-in slide-in-from-left-2 fade-in duration-200">
                <span className="text-xs font-bold text-red-600 mr-1">
                    Sicuro?
                </span>
                <button
                    type="button"
                    onClick={onDelete}
                    className="text-xs bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 font-medium transition-colors"
                >
                    Sì, elimina
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="text-xs text-slate-500 hover:text-slate-800 px-2 transition-colors"
                >
                    No
                </button>
            </div>
        );
    }

    return (
        <button
            type="button"
            onClick={onDelete}
            className="flex items-center gap-2 text-red-500 hover:text-red-700 text-sm font-medium px-2 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
        >
            <Trash2 className="w-4 h-4" />
            <span>Elimina</span>
        </button>
    );
}