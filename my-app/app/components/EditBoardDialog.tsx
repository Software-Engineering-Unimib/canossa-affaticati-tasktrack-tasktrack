'use client';

import React, { useState, useEffect } from 'react';
import { X, UserPlus, Trash2, Check, Loader2, Save } from 'lucide-react';
import {BoardCategory, BoardStats} from "@/app/components/BoardCard";

// Riusiamo i tipi (o importali da un file types.ts condiviso)
export type BoardTheme = 'blue' | 'green' | 'purple' | 'orange';

// Interfaccia per i dati della bacheca esistente
export interface BoardData {
    id: string | number;
    title: string;
    description: string;
    category: BoardCategory;
    theme: BoardTheme;
    stats: BoardStats;
    guests: string[];
}

interface EditBoardDialogProps {
    isOpen: boolean;
    initialData: BoardData | null; // I dati attuali della bacheca
    onClose: () => void;
    onUpdate: (updatedData: BoardData) => void;
    onDelete: (id: string | number) => void; // Callback per l'eliminazione
}

const themeOptions: { value: BoardTheme; label: string; class: string }[] = [
    { value: 'blue', label: 'Blu', class: 'bg-blue-500' },
    { value: 'green', label: 'Verde', class: 'bg-green-500' },
    { value: 'purple', label: 'Viola', class: 'bg-purple-500' },
    { value: 'orange', label: 'Arancione', class: 'bg-orange-400' },
];

export default function EditBoardDialog({
                                            isOpen,
                                            initialData,
                                            onClose,
                                            onUpdate,
                                            onDelete
                                        }: EditBoardDialogProps) {

    // Stati del Form
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedTheme, setSelectedTheme] = useState<BoardTheme>('blue');
    const [guests, setGuests] = useState<string[]>([]);
    const [guestEmail, setGuestEmail] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false); // Per evitare cancellazioni accidentali

    // --- EFFETTO DI SINCRONIZZAZIONE ---
    // Quando il dialog si apre o cambiano i dati iniziali, riempiamo i campi
    useEffect(() => {
        if (isOpen && initialData) {
            setTitle(initialData.title);
            setDescription(initialData.description || '');
            setSelectedTheme(initialData.theme);
            setGuests(initialData.guests || []);
            setShowDeleteConfirm(false); // Reset conferma eliminazione
        }
    }, [isOpen, initialData]);

    if (!isOpen || !initialData) return null;

    // --- HANDLERS ---

    const handleAddGuest = () => {
        if (guestEmail && guestEmail.includes('@') && !guests.includes(guestEmail)) {
            setGuests([...guests, guestEmail]);
            setGuestEmail('');
        }
    };

    const handleRemoveGuest = (emailToRemove: string) => {
        setGuests(guests.filter(email => email !== emailToRemove));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulazione latenza network
        await new Promise(resolve => setTimeout(resolve, 800));

        onUpdate({
            ...initialData,
            title,
            description,
            theme: selectedTheme,
            guests
        });

        setIsLoading(false);
        onClose();
    };

    const handleDelete = () => {
        // Se è la prima volta che clicca, mostra la conferma
        if (!showDeleteConfirm) {
            setShowDeleteConfirm(true);
            return;
        }
        // Se ha già confermato, elimina
        onDelete(initialData.id);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white sticky top-0 z-10">
                    <h2 className="text-lg font-bold text-slate-800">Modifica Bacheca</h2>
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

                        {/* 1. Titolo e Descrizione */}
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="edit-title" className="block text-sm font-semibold text-slate-700 mb-1">
                                    Nome Bacheca
                                </label>
                                <input
                                    id="edit-title"
                                    type="text"
                                    required
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-slate-900"
                                />
                            </div>

                            <div>
                                <label htmlFor="edit-desc" className="block text-sm font-semibold text-slate-700 mb-1">
                                    Descrizione
                                </label>
                                <textarea
                                    id="edit-desc"
                                    rows={3}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm resize-none text-slate-700"
                                />
                            </div>
                        </div>

                        {/* 2. Colore Tema */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-3">
                                Tema Colore
                            </label>
                            <div className="flex gap-3">
                                {themeOptions.map((theme) => (
                                    <button
                                        key={theme.value}
                                        type="button"
                                        onClick={() => setSelectedTheme(theme.value)}
                                        className={`
                        w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-105 focus:outline-none ring-2 ring-offset-2
                        ${theme.class}
                        ${selectedTheme === theme.value ? 'ring-slate-400 scale-110 shadow-md' : 'ring-transparent'}
                    `}
                                    >
                                        {selectedTheme === theme.value && (
                                            <Check className="w-5 h-5 text-white stroke-[3]" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 3. Gestione Ospiti */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Gestisci Collaboratori
                            </label>

                            {/* Input Aggiunta */}
                            <div className="flex gap-2 mb-3">
                                <div className="relative flex-1">
                                    <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="email"
                                        value={guestEmail}
                                        onChange={(e) => setGuestEmail(e.target.value)}
                                        placeholder="Nuova email..."
                                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleAddGuest();
                                            }
                                        }}
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={handleAddGuest}
                                    disabled={!guestEmail.includes('@')}
                                    className="px-4 py-2 bg-slate-100 text-slate-600 font-medium text-sm rounded-lg hover:bg-slate-200 disabled:opacity-50 transition-colors"
                                >
                                    Aggiungi
                                </button>
                            </div>

                            {/* Lista Ospiti Esistenti */}
                            {guests.length > 0 ? (
                                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 max-h-32 overflow-y-auto">
                                    <div className="flex flex-wrap gap-2">
                                        {guests.map((email) => (
                                            <div
                                                key={email}
                                                className="flex items-center gap-2 px-3 py-1.5 bg-white text-slate-700 text-xs font-medium rounded-lg border border-slate-200 shadow-sm"
                                            >
                                                {email}
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveGuest(email)}
                                                    className="text-slate-400 hover:text-red-500 transition-colors"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <p className="text-xs text-slate-400 italic">Nessun collaboratore invitato.</p>
                            )}
                        </div>
                    </form>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-gray-50/50">

                    {/* Tasto Elimina (con conferma) */}
                    <div className="flex items-center">
                        {showDeleteConfirm ? (
                            <div className="flex items-center gap-2 animate-in slide-in-from-left-2 fade-in duration-200">
                                <span className="text-xs font-bold text-red-600 mr-1">Sicuro?</span>
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    className="text-xs bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 font-medium"
                                >
                                    Sì, elimina
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="text-xs text-slate-500 hover:text-slate-800 px-2"
                                >
                                    No
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="flex items-center gap-2 text-red-500 hover:text-red-700 text-sm font-medium px-2 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                                <span>Elimina</span>
                            </button>
                        )}
                    </div>

                    {/* Tasti Salva/Annulla */}
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
                            form="edit-board-form" // Collega il bottone al form
                            disabled={isLoading || !title}
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