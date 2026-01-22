/**
 * @fileoverview Dialog per la creazione di una nuova bacheca.
 *
 * Permette di configurare:
 * - Nome e descrizione
 * - Icona/categoria
 * - Tema colore
 * - Collaboratori (ospiti)
 *
 * @module components/Board/CreateBoardDialog
 */

'use client';

import React, { useState, useCallback } from 'react';
import { X, UserPlus, Trash2, Check, Loader2, LayoutGrid, ChevronDown } from 'lucide-react';

import { themeBoardOptions, BoardTheme } from '@/items/Board';
import { Icon, iconBoardOptions } from '@/items/BoardIcon';
import { Category } from '@/items/Category';

/**
 * Props del componente.
 */
interface CreateBoardDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (data: NewBoardData) => void;
}

/**
 * Dati per la creazione di una nuova bacheca.
 */
export interface NewBoardData {
    title: string;
    description: string;
    icon: Icon;
    categories: Category[];
    theme: BoardTheme;
    guests: string[];
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
 * Stato iniziale del form.
 */
const INITIAL_FORM_STATE: FormState = {
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
 * Dialog per la creazione di una nuova bacheca.
 */
export default function CreateBoardDialog({
                                              isOpen,
                                              onClose,
                                              onCreate
                                          }: CreateBoardDialogProps): React.ReactElement | null {
    // ═══════════════════════════════════════════════════════════
    // TUTTI GLI HOOKS DEVONO ESSERE CHIAMATI PRIMA DI QUALSIASI RETURN
    // ═══════════════════════════════════════════════════════════

    const [formState, setFormState] = useState<FormState>(INITIAL_FORM_STATE);
    const [isLoading, setIsLoading] = useState(false);

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
     * Resetta il form allo stato iniziale.
     */
    const resetForm = useCallback(() => {
        setFormState(INITIAL_FORM_STATE);
    }, []);

    /**
     * Gestisce la chiusura del dialog.
     */
    const handleClose = useCallback(() => {
        resetForm();
        onClose();
    }, [resetForm, onClose]);

    /**
     * Gestisce l'invio del form.
     */
    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formState.title.trim()) return;

        setIsLoading(true);

        try {
            onCreate({
                title: formState.title,
                description: formState.description,
                icon: formState.icon,
                categories: [],
                theme: formState.theme,
                guests: formState.guests,
            });

            resetForm();
            onClose();
        } finally {
            setIsLoading(false);
        }
    }, [formState, onCreate, resetForm, onClose]);

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

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200"
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-board-title"
        >
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                {/* Header */}
                <DialogHeader
                    title="Crea Nuova Bacheca"
                    onClose={handleClose}
                />

                {/* Body */}
                <div className="overflow-y-auto p-6 space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
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
                        />

                        {/* Sezione collaboratori */}
                        <GuestsSection
                            guestEmail={formState.guestEmail}
                            guests={formState.guests}
                            onEmailChange={(value) => updateField('guestEmail', value)}
                            onAddGuest={handleAddGuest}
                            onRemoveGuest={handleRemoveGuest}
                            onKeyDown={handleGuestInputKeyDown}
                        />

                        {/* Footer */}
                        <FormFooter
                            isLoading={isLoading}
                            isValid={!!formState.title.trim()}
                            submitLabel="Crea Bacheca"
                            loadingLabel="Creazione..."
                            onCancel={handleClose}
                        />
                    </form>
                </div>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════
// COMPONENTI CONDIVISI (usati anche da EditBoardDialog)
// ═══════════════════════════════════════════════════════════════════

/**
 * Header del dialog.
 */
export function DialogHeader({
                                 title,
                                 onClose
                             }: {
    title: string;
    onClose: () => void;
}) {
    return (
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white sticky top-0 z-10">
            <h2 id="create-board-title" className="text-lg font-bold text-slate-800">
                {title}
            </h2>
            <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                aria-label="Chiudi"
            >
                <X className="w-5 h-5" />
            </button>
        </div>
    );
}

/**
 * Sezione informazioni base (titolo, descrizione, icona).
 */
export function BoardInfoSection({
                                     title,
                                     description,
                                     icon,
                                     onTitleChange,
                                     onDescriptionChange,
                                     onIconChange,
                                     titleRequired = true,
                                 }: {
    title: string;
    description: string;
    icon: Icon;
    onTitleChange: (value: string) => void;
    onDescriptionChange: (value: string) => void;
    onIconChange: (value: Icon) => void;
    titleRequired?: boolean;
}) {
    return (
        <div className="space-y-4">
            {/* Titolo */}
            <div>
                <label
                    htmlFor="board-title"
                    className="block text-sm font-semibold text-slate-700 mb-1"
                >
                    Nome Bacheca {titleRequired && <span className="text-red-500">*</span>}
                </label>
                <input
                    id="board-title"
                    type="text"
                    required={titleRequired}
                    value={title}
                    onChange={(e) => onTitleChange(e.target.value)}
                    placeholder="Es. Progetto Tesi 2024"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                />
            </div>

            {/* Descrizione */}
            <div>
                <label
                    htmlFor="board-desc"
                    className="block text-sm font-semibold text-slate-700 mb-1"
                >
                    Descrizione <span className="text-slate-400 font-normal">(Opzionale)</span>
                </label>
                <textarea
                    id="board-desc"
                    rows={3}
                    value={description}
                    onChange={(e) => onDescriptionChange(e.target.value)}
                    placeholder="A cosa serve questo spazio di lavoro?"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm resize-none"
                />
            </div>

            {/* Icona/Categoria */}
            <div>
                <label
                    htmlFor="board-icon"
                    className="block text-sm font-semibold text-slate-700 mb-1"
                >
                    Categoria
                </label>
                <div className="relative">
                    <LayoutGrid
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none"
                        aria-hidden="true"
                    />
                    <select
                        id="board-icon"
                        value={icon}
                        onChange={(e) => onIconChange(e.target.value as Icon)}
                        className="block w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm bg-white appearance-none cursor-pointer"
                    >
                        {iconBoardOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <ChevronDown
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
                        aria-hidden="true"
                    />
                </div>
            </div>
        </div>
    );
}

/**
 * Selettore tema colore.
 */
export function ThemeSelector({
                                  selectedTheme,
                                  onThemeChange,
                                  label = 'Scegli un colore',
                              }: {
    selectedTheme: BoardTheme;
    onThemeChange: (theme: BoardTheme) => void;
    label?: string;
}) {
    return (
        <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">
                {label}
            </label>
            <div
                className="flex gap-3"
                role="radiogroup"
                aria-label="Seleziona tema colore"
            >
                {themeBoardOptions.map((theme) => {
                    const isSelected = selectedTheme === theme.value;

                    return (
                        <button
                            key={theme.value}
                            type="button"
                            role="radio"
                            aria-checked={isSelected}
                            onClick={() => onThemeChange(theme.value)}
                            title={theme.label}
                            className={`
                                w-10 h-10 rounded-full flex items-center justify-center 
                                transition-transform hover:scale-105 focus:outline-none 
                                ring-2 ring-offset-2 ${theme.class}
                                ${isSelected
                                ? 'ring-slate-400 scale-110 shadow-md'
                                : 'ring-transparent'
                            }
                            `}
                        >
                            {isSelected && (
                                <Check className="w-5 h-5 text-white stroke-[3]" aria-hidden="true" />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

/**
 * Sezione gestione ospiti/collaboratori.
 */
export function GuestsSection({
                                  guestEmail,
                                  guests,
                                  onEmailChange,
                                  onAddGuest,
                                  onRemoveGuest,
                                  onKeyDown,
                                  label = 'Invita collaboratori',
                              }: {
    guestEmail: string;
    guests: string[];
    onEmailChange: (value: string) => void;
    onAddGuest: () => void;
    onRemoveGuest: (email: string) => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
    label?: string;
}) {
    const canAdd = isValidEmail(guestEmail);

    return (
        <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
                {label}
            </label>

            {/* Input email */}
            <div className="flex gap-2 mb-3">
                <div className="relative flex-1">
                    <UserPlus
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                        aria-hidden="true"
                    />
                    <input
                        type="email"
                        value={guestEmail}
                        onChange={(e) => onEmailChange(e.target.value)}
                        onKeyDown={onKeyDown}
                        placeholder="email@studente.it"
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                </div>
                <button
                    type="button"
                    onClick={onAddGuest}
                    disabled={!canAdd}
                    className="px-4 py-2 bg-slate-100 text-slate-600 font-medium text-sm rounded-lg hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    Aggiungi
                </button>
            </div>

            {/* Lista ospiti */}
            <GuestsList guests={guests} onRemove={onRemoveGuest} />
        </div>
    );
}

/**
 * Lista degli ospiti.
 */
export function GuestsList({
                               guests,
                               onRemove,
                               emptyMessage = null,
                           }: {
    guests: string[];
    onRemove: (email: string) => void;
    emptyMessage?: React.ReactNode;
}) {
    if (guests.length === 0) {
        return emptyMessage ? <>{emptyMessage}</> : null;
    }

    return (
        <div className="flex flex-wrap gap-2 mt-2">
            {guests.map((email) => (
                <span
                    key={email}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-100"
                >
                    {email}
                    <button
                        type="button"
                        onClick={() => onRemove(email)}
                        className="hover:text-red-500 transition-colors"
                        aria-label={`Rimuovi ${email}`}
                    >
                        <Trash2 className="w-3 h-3" />
                    </button>
                </span>
            ))}
        </div>
    );
}

/**
 * Footer del form con pulsanti azione.
 */
export function FormFooter({
                               isLoading,
                               isValid,
                               submitLabel,
                               loadingLabel,
                               onCancel,
                           }: {
    isLoading: boolean;
    isValid: boolean;
    submitLabel: string;
    loadingLabel: string;
    onCancel: () => void;
}) {
    return (
        <div className="pt-2 border-t border-slate-50 flex items-center justify-end gap-3">
            <button
                type="button"
                onClick={onCancel}
                disabled={isLoading}
                className="px-5 py-2.5 text-slate-600 text-sm font-medium hover:bg-slate-50 rounded-xl transition-colors disabled:opacity-50"
            >
                Annulla
            </button>
            <button
                type="submit"
                disabled={isLoading || !isValid}
                className="px-6 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
                {isLoading ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {loadingLabel}
                    </>
                ) : (
                    submitLabel
                )}
            </button>
        </div>
    );
}