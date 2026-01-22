/**
 * @fileoverview Pagina di gestione delle priorità e notifiche.
 *
 * Permette di configurare i promemoria per ogni livello di priorità.
 * I promemoria definiscono quando l'utente riceve notifiche prima
 * della scadenza di un task.
 *
 * @module pages/priorities
 */

'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
    Flag,
    Clock,
    Trash2,
    Plus,
    Save,
    AlertCircle,
    Check,
    Loader2,
} from 'lucide-react';

import { useAuth } from '@/app/context/AuthContext';
import { PriorityModel, Reminder } from '@/models/Priority';
import { unitOptions } from '@/items/Priority';

/**
 * Configurazione priorità per l'interfaccia UI.
 * Mappa i dati del DB (snake_case) al formato UI (camelCase).
 */
interface UiPriorityConfig {
    id: number;
    label: string;
    description: string;
    priorityLevel: string;
    colorClass: string;
    bgClass: string;
    reminders: Reminder[];
}

/**
 * Numero massimo di promemoria per priorità.
 */
const MAX_REMINDERS_PER_PRIORITY = 3;

/**
 * Mappa i dati del database al formato UI.
 */
function mapDbToUi(dbPriority: any): UiPriorityConfig {
    return {
        id: dbPriority.id,
        priorityLevel: dbPriority.priority_level,
        label: dbPriority.label,
        description: dbPriority.description ?? '',
        colorClass: dbPriority.color_class,
        bgClass: dbPriority.bg_class,
        reminders: dbPriority.reminders ?? [],
    };
}

/**
 * Genera un ID temporaneo per nuovi reminder.
 */
function generateTempId(): string {
    return `new-${Date.now()}`;
}

/**
 * Crea un reminder con valori di default.
 */
function createDefaultReminder(): Reminder {
    return {
        id: generateTempId(),
        value: 1,
        unit: 'hours',
    };
}

/**
 * Pagina gestione priorità.
 */
export default function PrioritiesPage() {
    const { user } = useAuth();

    // ═══════════════════════════════════════════════════════════
    // STATO
    // ═══════════════════════════════════════════════════════════

    const [priorities, setPriorities] = useState<UiPriorityConfig[]>([]);
    const [savedPriorities, setSavedPriorities] = useState<UiPriorityConfig[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    // ═══════════════════════════════════════════════════════════
    // CARICAMENTO DATI
    // ═══════════════════════════════════════════════════════════

    useEffect(() => {
        const loadData = async () => {
            if (!user) return;

            setIsLoading(true);
            try {
                const data = await PriorityModel.getAllPriorities();
                const uiData = data.map(mapDbToUi);

                setPriorities(uiData);
                setSavedPriorities(uiData);
            } catch (error) {
                console.error('Errore fetch priorità:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [user]);

    // ═══════════════════════════════════════════════════════════
    // RILEVAMENTO MODIFICHE
    // ═══════════════════════════════════════════════════════════

    /**
     * Verifica se ci sono modifiche non salvate.
     */
    const hasChanges = useMemo(() => {
        return JSON.stringify(priorities) !== JSON.stringify(savedPriorities);
    }, [priorities, savedPriorities]);

    // ═══════════════════════════════════════════════════════════
    // HANDLERS REMINDER
    // ═══════════════════════════════════════════════════════════

    /**
     * Aggiunge un reminder a una priorità.
     */
    const addReminder = useCallback((priorityId: number) => {
        setPriorities(prev => prev.map(p => {
            if (p.id !== priorityId) return p;
            if (p.reminders.length >= MAX_REMINDERS_PER_PRIORITY) return p;

            return {
                ...p,
                reminders: [...p.reminders, createDefaultReminder()],
            };
        }));
    }, []);

    /**
     * Rimuove un reminder da una priorità.
     */
    const removeReminder = useCallback((priorityId: number, reminderId: string | number) => {
        setPriorities(prev => prev.map(p => {
            if (p.id !== priorityId) return p;

            return {
                ...p,
                reminders: p.reminders.filter(r => r.id !== reminderId),
            };
        }));
    }, []);

    /**
     * Aggiorna un campo di un reminder.
     */
    const updateReminder = useCallback((
        priorityId: number,
        reminderId: string | number,
        field: 'value' | 'unit',
        newValue: string | number
    ) => {
        setPriorities(prev => prev.map(p => {
            if (p.id !== priorityId) return p;

            return {
                ...p,
                reminders: p.reminders.map(r => {
                    if (r.id !== reminderId) return r;
                    return { ...r, [field]: newValue };
                }),
            };
        }));
    }, []);

    // ═══════════════════════════════════════════════════════════
    // SALVATAGGIO
    // ═══════════════════════════════════════════════════════════

    /**
     * Salva tutte le modifiche.
     */
    const handleSaveAll = useCallback(async () => {
        if (!hasChanges) return;

        setIsSaving(true);
        try {
            const promises = priorities.map(p =>
                PriorityModel.syncReminders(p.id, p.reminders)
            );

            await Promise.all(promises);

            setSavedPriorities(priorities);
            setLastSaved(new Date());
        } catch (error) {
            console.error('Errore salvataggio:', error);
            alert('Si è verificato un errore durante il salvataggio.');
        } finally {
            setIsSaving(false);
        }
    }, [hasChanges, priorities]);

    // ═══════════════════════════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════════════════════════

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center min-h-[50vh]">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8 pb-24">
            {/* Header */}
            <PageHeader
                hasChanges={hasChanges}
                isSaving={isSaving}
                onSave={handleSaveAll}
            />

            {/* Success Message */}
            {lastSaved && !isSaving && !hasChanges && (
                <SuccessMessage savedAt={lastSaved} />
            )}

            {/* Priority Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {priorities.map((priority) => (
                    <PriorityCard
                        key={priority.id}
                        priority={priority}
                        maxReminders={MAX_REMINDERS_PER_PRIORITY}
                        onAddReminder={() => addReminder(priority.id)}
                        onRemoveReminder={(reminderId) => removeReminder(priority.id, reminderId)}
                        onUpdateReminder={(reminderId, field, value) =>
                            updateReminder(priority.id, reminderId, field, value)
                        }
                    />
                ))}
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════
// COMPONENTI INTERNI
// ═══════════════════════════════════════════════════════════════════

/**
 * Header della pagina.
 */
function PageHeader({
                        hasChanges,
                        isSaving,
                        onSave,
                    }: {
    hasChanges: boolean;
    isSaving: boolean;
    onSave: () => void;
}) {
    return (
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                    <Flag className="w-8 h-8 text-blue-600" />
                    Gestione Priorità & Notifiche
                </h1>
                <p className="text-slate-500 mt-2 text-lg">
                    Configura quando ricevere i promemoria per ogni livello di priorità.
                </p>
            </div>

            <button
                onClick={onSave}
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
    );
}

/**
 * Messaggio di successo dopo il salvataggio.
 */
function SuccessMessage({ savedAt }: { savedAt: Date }) {
    return (
        <div className="bg-green-50 text-green-700 px-4 py-2 rounded-lg border border-green-200 flex items-center gap-2 text-sm font-medium animate-in fade-in slide-in-from-top-2">
            <Check className="w-4 h-4" />
            Configurazione salvata con successo alle {savedAt.toLocaleTimeString()}
        </div>
    );
}

/**
 * Card per una singola priorità.
 */
function PriorityCard({
                          priority,
                          maxReminders,
                          onAddReminder,
                          onRemoveReminder,
                          onUpdateReminder,
                      }: {
    priority: UiPriorityConfig;
    maxReminders: number;
    onAddReminder: () => void;
    onRemoveReminder: (reminderId: string | number) => void;
    onUpdateReminder: (reminderId: string | number, field: 'value' | 'unit', value: string | number) => void;
}) {
    const canAddMore = priority.reminders.length < maxReminders;

    return (
        <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white">
            {/* Header */}
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

            {/* Body */}
            <div className="p-6 space-y-4">
                <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-400" />
                        Promemoria impostati
                    </h4>
                    <span className="text-xs font-medium text-slate-400">
                        {priority.reminders.length} / {maxReminders}
                    </span>
                </div>

                {priority.reminders.length === 0 ? (
                    <EmptyRemindersState />
                ) : (
                    <div className="space-y-3">
                        {priority.reminders.map((reminder) => (
                            <ReminderRow
                                key={reminder.id}
                                reminder={reminder}
                                onUpdate={(field, value) => onUpdateReminder(reminder.id!, field, value)}
                                onRemove={() => onRemoveReminder(reminder.id!)}
                            />
                        ))}
                    </div>
                )}

                {/* Add Button */}
                <button
                    onClick={onAddReminder}
                    disabled={!canAddMore}
                    className="w-full mt-2 py-2.5 border border-dashed border-slate-300 rounded-xl text-sm font-semibold text-slate-500 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Aggiungi Promemoria
                </button>
            </div>
        </div>
    );
}

/**
 * Stato vuoto per i reminder.
 */
function EmptyRemindersState() {
    return (
        <div className="text-center py-6 border-2 border-dashed border-slate-100 rounded-xl">
            <p className="text-slate-400 text-sm italic">Nessun promemoria attivo</p>
        </div>
    );
}

/**
 * Riga di un singolo reminder.
 */
function ReminderRow({
                         reminder,
                         onUpdate,
                         onRemove,
                     }: {
    reminder: Reminder;
    onUpdate: (field: 'value' | 'unit', value: string | number) => void;
    onRemove: () => void;
}) {
    return (
        <div className="flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
            {/* Value Input */}
            <input
                type="number"
                min="1"
                max="365"
                value={reminder.value}
                onChange={(e) => onUpdate('value', parseInt(e.target.value) || 0)}
                className="w-20 px-3 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />

            {/* Unit Select */}
            <div className="relative flex-1">
                <select
                    value={reminder.unit}
                    onChange={(e) => onUpdate('unit', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none cursor-pointer"
                >
                    {unitOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* Remove Button */}
            <button
                onClick={onRemove}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Rimuovi promemoria"
                aria-label="Rimuovi promemoria"
            >
                <Trash2 className="w-4 h-4" />
            </button>
        </div>
    );
}