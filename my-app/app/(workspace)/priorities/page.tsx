'use client';

import React, { useState, useMemo } from 'react';
import {
    Bell,
    Clock,
    Trash2,
    Plus,
    Save,
    AlertCircle,
    Check,
    Loader2
} from 'lucide-react';

import { PriorityConfig, PriorityLevel, unitOptions } from '@/public/Priority';
import { initialPriorities } from '@/public/datas';

export default function PrioritiesPage() {
    // Stato corrente modificabile dall'utente
    const [priorities, setPriorities] = useState<PriorityConfig[]>(initialPriorities);

    // NUOVO: Stato di "riferimento" (rappresenta i dati salvati nel DB)
    const [savedPriorities, setSavedPriorities] = useState<PriorityConfig[]>(initialPriorities);

    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    // NUOVO: Calcoliamo se ci sono differenze tra lo stato corrente e quello salvato
    const hasChanges = useMemo(() => {
        return JSON.stringify(priorities) !== JSON.stringify(savedPriorities);
    }, [priorities, savedPriorities]);

    // --- HANDLERS ---

    const addReminder = (priorityId: PriorityLevel) => {
        setPriorities(prev => prev.map(p => {
            if (p.id === priorityId && p.reminders.length < 3) {
                return {
                    ...p,
                    reminders: [
                        ...p.reminders,
                        { id: `new-${Date.now()}`, value: 1, unit: 'hours' }
                    ]
                };
            }
            return p;
        }));
    };

    const removeReminder = (priorityId: PriorityLevel, reminderId: string) => {
        setPriorities(prev => prev.map(p => {
            if (p.id === priorityId) {
                return {
                    ...p,
                    reminders: p.reminders.filter(r => r.id !== reminderId)
                };
            }
            return p;
        }));
    };

    const updateReminder = (priorityId: PriorityLevel, reminderId: string, field: 'value' | 'unit', newValue: string | number) => {
        setPriorities(prev => prev.map(p => {
            if (p.id === priorityId) {
                return {
                    ...p,
                    reminders: p.reminders.map(r => {
                        if (r.id === reminderId) {
                            return { ...r, [field]: newValue };
                        }
                        return r;
                    })
                };
            }
            return p;
        }));
    };

    const handleSaveAll = async () => {
        if (!hasChanges) return; // Blocco di sicurezza extra

        setIsSaving(true);
        // Simulazione chiamata API
        await new Promise(resolve => setTimeout(resolve, 1500));

        setSavedPriorities(priorities);

        setLastSaved(new Date());
        setIsSaving(false);
    };

    return (
        <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8 pb-24">

            {/* HEADER */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                        <Bell className="w-8 h-8 text-blue-600" />
                        Gestione Priorità & Notifiche
                    </h1>
                    <p className="text-slate-500 mt-2 text-lg">
                        Configura quando ricevere i promemoria per ogni livello di priorità.
                    </p>
                </div>

                {/* Tasto Salva Principale */}
                <button
                    onClick={handleSaveAll}
                    // MODIFICA QUI: Disabilitato se sta salvando OPPURE se non ci sono modifiche
                    disabled={isSaving || !hasChanges}
                    className={`
            flex items-center gap-2 px-6 py-3 font-bold rounded-xl transition-all shadow-lg 
            ${hasChanges
                        ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/20'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                    }
          `}
                >
                    {isSaving ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <Save className="w-5 h-5" />
                    )}
                    {isSaving ? 'Salvataggio...' : 'Salva Modifiche'}
                </button>
            </header>

            {/* FEEDBACK SALVATAGGIO */}
            {lastSaved && !isSaving && !hasChanges && (
                <div className="bg-green-50 text-green-700 px-4 py-2 rounded-lg border border-green-200 flex items-center gap-2 text-sm font-medium animate-in fade-in slide-in-from-top-2">
                    <Check className="w-4 h-4" />
                    Configurazione salvata con successo alle {lastSaved.toLocaleTimeString()}
                </div>
            )}

            {/* GRIGLIA PRIORITÀ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {priorities.map((priority) => (
                    <div
                        key={priority.id}
                        className={`rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white`}
                    >
                        {/* CARD HEADER */}
                        <div className={`px-6 py-4 border-b border-slate-100 flex items-start justify-between ${priority.bgClass}`}>
                            <div>
                                <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 border ${priority.colorClass}`}>
                                    {priority.label}
                                </div>
                                <p className="text-sm text-slate-500 font-medium">
                                    {priority.description}
                                </p>
                            </div>
                            <div className="bg-white p-2 rounded-full shadow-sm border border-slate-100">
                                <AlertCircle className={`w-5 h-5 opacity-80 ${priority.colorClass.split(' ')[0]}`} />
                            </div>
                        </div>

                        {/* CARD BODY: LISTA REMINDER */}
                        <div className="p-6 space-y-4">
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-slate-400" />
                                    Promemoria impostati
                                </h4>
                                <span className="text-xs font-medium text-slate-400">
                        {priority.reminders.length} / 3
                    </span>
                            </div>

                            {priority.reminders.length === 0 ? (
                                <div className="text-center py-6 border-2 border-dashed border-slate-100 rounded-xl">
                                    <p className="text-slate-400 text-sm italic">Nessun promemoria attivo</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {priority.reminders.map((reminder) => (
                                        <div key={reminder.id} className="flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
                                            {/* Input Valore */}
                                            <input
                                                type="number"
                                                min="1"
                                                max="365"
                                                value={reminder.value}
                                                onChange={(e) => updateReminder(priority.id, reminder.id, 'value', parseInt(e.target.value) || 0)}
                                                className="w-20 px-3 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                            />

                                            {/* Select Unità */}
                                            <div className="relative flex-1">
                                                <select
                                                    value={reminder.unit}
                                                    onChange={(e) => updateReminder(priority.id, reminder.id, 'unit', e.target.value)}
                                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none cursor-pointer"
                                                >
                                                    {unitOptions.map(opt => (
                                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Tasto Rimuovi */}
                                            <button
                                                onClick={() => removeReminder(priority.id, reminder.id)}
                                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Rimuovi promemoria"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* BOTTONE AGGIUNGI */}
                            <button
                                onClick={() => addReminder(priority.id)}
                                disabled={priority.reminders.length >= 3}
                                className="w-full mt-2 py-2.5 border border-dashed border-slate-300 rounded-xl text-sm font-semibold text-slate-500 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Aggiungi Promemoria
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}