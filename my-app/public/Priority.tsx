export type Priority = 'Bassa' | 'Media' | 'Alta' | 'Urgente';

export const getPriorityStyles = (priority: Priority) => {
    switch (priority) {
        case 'Urgente': return 'bg-red-50 text-red-700 border-red-200';
        case 'Alta': return 'bg-orange-50 text-orange-700 border-orange-200';
        case 'Media': return 'bg-amber-50 text-amber-700 border-amber-200';
        case 'Bassa': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
        default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
};