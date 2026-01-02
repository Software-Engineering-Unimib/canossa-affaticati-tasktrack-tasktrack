'use client';

import React, { useState } from 'react';
import { X, UserPlus, Trash2, Check, Loader2, LayoutGrid, ChevronDown } from 'lucide-react';
// Assicurati che il percorso di importazione sia corretto per il tuo progetto
import { themeBoardOptions, BoardTheme } from "@/public/Board";
import { BoardCategory, categoryBoardOptions } from '@/public/BoardCategory';

interface CreateBoardDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (data: NewBoardData) => void;
}

// Aggiorniamo l'interfaccia per includere la categoria
export interface NewBoardData {
    title: string;
    description: string;
    category: BoardCategory;
    theme: BoardTheme;
    guests: string[];
}


export default function CreateBoardDialog({ isOpen, onClose, onCreate }: CreateBoardDialogProps) {
    // Stati del Form
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<BoardCategory>('personal'); // Stato Categoria
    const [selectedTheme, setSelectedTheme] = useState<BoardTheme>('blue');
    const [guestEmail, setGuestEmail] = useState('');
    const [guests, setGuests] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Se il dialog è chiuso, non renderizzare nulla
    if (!isOpen) return null;

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

        // Simula operazione asincrona
        await new Promise(resolve => setTimeout(resolve, 1000));

        onCreate({
            title,
            description,
            category: selectedCategory, // Passiamo la categoria selezionata
            theme: selectedTheme,
            guests
        });

        setIsLoading(false);
        resetForm();
        onClose();
    };

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setSelectedCategory('personal'); // Reset al default
        setSelectedTheme('blue');
        setGuests([]);
        setGuestEmail('');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">

            {/* Contenitore Dialog */}
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white sticky top-0 z-10">
                    <h2 className="text-lg font-bold text-slate-800">Crea Nuova Bacheca</h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body Form Scrollable */}
                <div className="overflow-y-auto p-6 space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* 1. Titolo, Descrizione e Categoria */}
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="title" className="block text-sm font-semibold text-slate-700 mb-1">
                                    Nome Bacheca <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="title"
                                    type="text"
                                    required
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Es. Progetto Tesi 2024"
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium"
                                />
                            </div>

                            <div>
                                <label htmlFor="desc" className="block text-sm font-semibold text-slate-700 mb-1">
                                    Descrizione <span className="text-slate-400 font-normal">(Opzionale)</span>
                                </label>
                                <textarea
                                    id="desc"
                                    rows={3}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="A cosa serve questo spazio di lavoro?"
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm resize-none"
                                />
                            </div>

                            <div>
                                <label htmlFor="category" className="block text-sm font-semibold text-slate-700 mb-1">
                                    Categoria
                                </label>
                                <div className="relative">
                                    {/* Icona sinistra */}
                                    <LayoutGrid className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />

                                    <select
                                        id="category"
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value as BoardCategory)}
                                        className="block w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm bg-white appearance-none text-slate-700 font-medium cursor-pointer hover:bg-slate-50"
                                    >
                                        {categoryBoardOptions.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>

                                    {/* Icona chevron destra */}
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        {/* 2. Colore Tema */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-3">
                                Scegli un colore
                            </label>
                            <div className="flex gap-3">
                                {themeBoardOptions.map((theme) => (
                                    <button
                                        key={theme.value}
                                        type="button"
                                        onClick={() => setSelectedTheme(theme.value)}
                                        className={`
                                            w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-105 focus:outline-none ring-2 ring-offset-2
                                            ${theme.class}
                                            ${selectedTheme === theme.value ? 'ring-slate-400 scale-110 shadow-md' : 'ring-transparent'}
                                        `}
                                        title={theme.label}
                                    >
                                        {selectedTheme === theme.value && (
                                            <Check className="w-5 h-5 text-white stroke-[3]" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 3. Invita Ospiti */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Invita collaboratori
                            </label>
                            <div className="flex gap-2 mb-3">
                                <div className="relative flex-1">
                                    <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="email"
                                        value={guestEmail}
                                        onChange={(e) => setGuestEmail(e.target.value)}
                                        placeholder="email@studente.it"
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
                                    className="px-4 py-2 bg-slate-100 text-slate-600 font-medium text-sm rounded-lg hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Aggiungi
                                </button>
                            </div>

                            {/* Lista Ospiti Aggiunti */}
                            {guests.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {guests.map((email) => (
                                        <span
                                            key={email}
                                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-100"
                                        >
                                            {email}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveGuest(email)}
                                                className="hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer Bottoni (Spostato dentro il form o fuori, qui è dentro il div scrollable) */}
                        <div className="pt-2 border-t border-slate-50 flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-5 py-2.5 text-slate-600 text-sm font-medium hover:bg-slate-50 rounded-xl transition-colors"
                            >
                                Annulla
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading || !title}
                                className="px-6 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Creazione...
                                    </>
                                ) : (
                                    'Crea Bacheca'
                                )}
                            </button>
                        </div>

                    </form>
                </div>

            </div>
        </div>
    );
}