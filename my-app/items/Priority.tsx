export type PriorityLevel = 'Bassa' | 'Media' | 'Alta' | 'Urgente';

export const getPriorityStyles = (priority: PriorityLevel) => {
    switch (priority) {
        case 'Urgente': return 'bg-red-50 text-red-700 border-red-200';
        case 'Alta': return 'bg-orange-50 text-orange-700 border-orange-200';
        case 'Media': return 'bg-amber-50 text-amber-700 border-amber-200';
        case 'Bassa': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
        default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
};

// --- TIPI ---
export type TimeUnit = 'minutes' | 'hours' | 'days';

export interface Reminder {
    id: string;
    value: number;
    unit: TimeUnit;
}

export interface PriorityConfig {
    id: PriorityLevel;
    label: string;
    description: string;
    colorClass: string;     // Colore per il badge/bordo
    bgClass: string;        // Sfondo leggero
    reminders: Reminder[];
}

// Opzioni per la select unità
export const unitOptions: { value: TimeUnit; label: string }[] = [
    { value: 'minutes', label: 'Minuti prima' },
    { value: 'hours', label: 'Ore prima' },
    { value: 'days', label: 'Giorni prima' },
];