/**
 * @fileoverview Definizioni e utility per la gestione delle priorità dei task.
 *
 * Questo modulo contiene:
 * - Type definitions per i livelli di priorità
 * - Configurazione dei reminder
 * - Funzioni helper per lo styling delle priorità
 *
 * @module items/Priority
 */

/** Livelli di priorità disponibili nel sistema */
export type PriorityLevel = 'Bassa' | 'Media' | 'Alta' | 'Urgente';

/** Unità di tempo supportate per i reminder */
export type TimeUnit = 'minutes' | 'hours' | 'days';

/**
 * Configurazione di un singolo reminder.
 * Definisce quando notificare l'utente prima della scadenza di un task.
 */
export interface Reminder {
    id: string;
    value: number;
    unit: TimeUnit;
}

/**
 * Configurazione completa di un livello di priorità.
 * Include informazioni di styling e reminder associati.
 */
export interface PriorityConfig {
    id: PriorityLevel;
    label: string;
    description: string;
    colorClass: string;
    bgClass: string;
    reminders: Reminder[];
}

/**
 * Mappa statica degli stili CSS associati a ciascun livello di priorità.
 * Applica il pattern Strategy per la selezione degli stili.
 */
const PRIORITY_STYLES: Record<PriorityLevel, string> = {
    Urgente: 'bg-red-50 text-red-700 border-red-200',
    Alta: 'bg-orange-50 text-orange-700 border-orange-200',
    Media: 'bg-amber-50 text-amber-700 border-amber-200',
    Bassa: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

/** Stile di default per priorità non riconosciute */
const DEFAULT_PRIORITY_STYLE = 'bg-slate-50 text-slate-700 border-slate-200';

/**
 * Restituisce le classi CSS per lo styling di un badge di priorità.
 *
 * @param priority - Il livello di priorità del task
 * @returns Stringa di classi CSS per Tailwind
 *
 * @example
 * ```tsx
 * <span className={getPriorityStyles('Alta')}>Alta Priorità</span>
 * ```
 */
export const getPriorityStyles = (priority: PriorityLevel): string => {
    return PRIORITY_STYLES[priority] ?? DEFAULT_PRIORITY_STYLE;
};

/**
 * Opzioni per la select delle unità temporali nei form.
 * Utilizzato nei componenti di configurazione dei reminder.
 */
export const unitOptions: ReadonlyArray<{ value: TimeUnit; label: string }> = [
    { value: 'minutes', label: 'Minuti prima' },
    { value: 'hours', label: 'Ore prima' },
    { value: 'days', label: 'Giorni prima' },
] as const;