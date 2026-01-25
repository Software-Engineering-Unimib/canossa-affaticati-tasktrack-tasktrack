/**
 * @fileoverview Repository per la gestione delle priorità e dei reminder.
 *
 * Ogni utente ha le proprie configurazioni di priorità con reminder personalizzati.
 *
 * @module models/Priority
 */

import { supabase } from '@/lib/supabase';

/** Livelli di priorità supportati */
export type PriorityLevel = 'Bassa' | 'Media' | 'Alta' | 'Urgente';

/**
 * Ordine logico delle priorità per l'ordinamento.
 */
const PRIORITY_ORDER: Record<PriorityLevel, number> = {
    Bassa: 1,
    Media: 2,
    Alta: 3,
    Urgente: 4,
};

/**
 * Configurazione di una priorità salvata nel database.
 */
export interface PriorityConfig {
    id: number;
    priority_level: PriorityLevel;
    label: string;
    description: string | null;
    color_class: string;
    bg_class: string;
    user_id: string;
    reminders?: Reminder[];
}

/**
 * Configurazione di un reminder.
 */
export interface Reminder {
    id?: string | number;
    value: number;
    unit: 'minutes' | 'hours' | 'days';
    priority_config_id?: number;
}

/**
 * Repository per le configurazioni di priorità utente.
 *
 * Pattern: Repository
 */
export class PriorityModel {
    /**
     * Ottiene tutte le configurazioni di priorità dell'utente corrente.
     * Include i reminder associati tramite join.
     *
     * @returns Array di configurazioni ordinate per livello
     */
    static async getAllPriorities(): Promise<PriorityConfig[]> {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return [];
        }

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

        return this.mapAndSortPriorities(data);
    }

    /**
     * Sincronizza i reminder per una configurazione di priorità.
     *
     * Strategia: Delete-All-Insert-New
     * Semplifica la gestione evitando diff complessi tra stato
     * precedente e nuovo.
     *
     * @param priorityConfigId - ID della configurazione
     * @param reminders - Nuova lista di reminder
     * @throws Error se la sincronizzazione fallisce
     */
    static async syncReminders(
        priorityConfigId: number,
        reminders: Reminder[]
    ): Promise<void> {
        // 1. Elimina tutti i reminder esistenti
        const { error: deleteError } = await supabase
            .from('Reminders')
            .delete()
            .eq('priority_config_id', priorityConfigId);

        if (deleteError) {
            throw new Error(`Errore eliminazione reminder: ${deleteError.message}`);
        }

        // 2. Inserisci i nuovi reminder (se presenti)
        if (reminders.length === 0) {
            return;
        }

        const remindersToInsert = reminders.map(r => ({
            priority_config_id: priorityConfigId,
            value: r.value,
            unit: r.unit,
        }));

        const { error: insertError } = await supabase
            .from('Reminders')
            .insert(remindersToInsert);

        if (insertError) {
            throw new Error(`Errore inserimento reminder: ${insertError.message}`);
        }
    }

    // ═══════════════════════════════════════════════════════════
    // METODI PRIVATI
    // ═══════════════════════════════════════════════════════════

    /**
     * Mappa e ordina i dati dal database.
     * Normalizza la chiave 'Reminders' in 'reminders' (lowercase).
     */
    private static mapAndSortPriorities(data: any[]): PriorityConfig[] {
        const mapped = data.map(item => ({
            ...item,
            reminders: item.Reminders ?? [],
        }));

        return mapped.sort((a, b) => {
            const orderA = PRIORITY_ORDER[a.priority_level as PriorityLevel] ?? 99;
            const orderB = PRIORITY_ORDER[b.priority_level as PriorityLevel] ?? 99;
            return orderA - orderB;
        });
    }
}