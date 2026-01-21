import { supabase } from '@/lib/supabase';

// Tipi
export type PriorityLevel = 'Bassa' | 'Media' | 'Alta' | 'Urgente';

export interface PriorityConfig {
    id: number;
    priority_level: PriorityLevel;
    label: string;
    description: string | null;
    color_class: string;
    bg_class: string;
    user_id: string;
    // Aggiungiamo i reminders
    reminders?: Reminder[];
}

export interface Reminder {
    id?: string | number; // Può essere stringa ('new-123') lato frontend
    value: number;
    unit: 'minutes' | 'hours' | 'days';
    priority_config_id?: number;
}

export class PriorityModel {

    /**
     * Ottiene priorità E promemoria
     */
    static async getAllPriorities(): Promise<PriorityConfig[]> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        // Fetch Configs + Reminders (Join)
        const { data, error } = await supabase
            .from('PriorityConfigs')
            .select(`
                *,
                Reminders (id, value, unit)
            `)
            .eq('user_id', user.id);

        if (error) {
            console.error('Errore fetch priorities:', error);
            return [];
        }

        // Ordiniamo logicamente
        const sortOrder = { 'Bassa': 1, 'Media': 2, 'Alta': 3, 'Urgente': 4 };

        // Mappiamo i dati per assicurarci che 'Reminders' diventi 'reminders' (lowercase)
        const mappedData = data.map((item: any) => ({
            ...item,
            reminders: item.Reminders || []
        }));

        return mappedData.sort((a, b) =>
            (sortOrder[a.priority_level as PriorityLevel] || 99) - (sortOrder[b.priority_level as PriorityLevel] || 99)
        );
    }

    /**
     * Aggiorna i promemoria per una specifica priorità.
     * Strategia: Delete All + Insert New (per evitare complessità di diff)
     */
    static async syncReminders(priorityConfigId: number, reminders: Reminder[]) {
        // 1. Elimina i vecchi promemoria per questa priorità
        const { error: deleteError } = await supabase
            .from('Reminders')
            .delete()
            .eq('priority_config_id', priorityConfigId);

        if (deleteError) throw deleteError;

        // 2. Se ci sono nuovi promemoria, inseriscili
        if (reminders.length > 0) {
            const remindersToInsert = reminders.map(r => ({
                priority_config_id: priorityConfigId,
                value: r.value,
                unit: r.unit
            }));

            const { error: insertError } = await supabase
                .from('Reminders')
                .insert(remindersToInsert);

            if (insertError) throw insertError;
        }
    }
}