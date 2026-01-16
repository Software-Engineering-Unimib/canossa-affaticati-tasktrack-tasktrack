import { supabase } from '@/lib/supabase'

export type TimeUnit = 'minutes' | 'hours' | 'days'

export interface Reminder {
    id?: number
    created_at?: string
    value: number // Valore numerico (es. 30)
    unit: TimeUnit // Unità di tempo (es. 'minutes')
    priority_config_id: number // FK to PriorityConfigs
}

export class ReminderModel {
    // Ottieni tutti i reminder di una configurazione di priorità
    static async findByPriorityConfigId(priorityConfigId: number): Promise<{ data: Reminder[] | null; error: any }> {
        const { data, error } = await supabase
            .from('Reminders')
            .select('*')
            .eq('priority_config_id', priorityConfigId)
            .order('created_at', { ascending: true })

        return { data, error }
    }

    // Ottieni un reminder per ID
    static async findById(id: number): Promise<{ data: Reminder | null; error: any }> {
        const { data, error } = await supabase
            .from('Reminders')
            .select('*')
            .eq('id', id)
            .single()

        return { data, error }
    }

    // Crea un nuovo reminder
    static async create(reminderData: Omit<Reminder, 'id' | 'created_at'>): Promise<{ data: Reminder | null; error: any }> {
        const { data, error } = await supabase
            .from('Reminders')
            .insert(reminderData)
            .select()
            .single()

        return { data, error }
    }

    // Crea multiple reminder
    static async createMany(reminders: Omit<Reminder, 'id' | 'created_at'>[]): Promise<{ data: Reminder[] | null; error: any }> {
        const { data, error } = await supabase
            .from('Reminders')
            .insert(reminders)
            .select()

        return { data, error }
    }

    // Aggiorna un reminder
    static async update(id: number, reminderData: Partial<Omit<Reminder, 'id' | 'created_at' | 'priority_config_id'>>): Promise<{ data: Reminder | null; error: any }> {
        const { data, error } = await supabase
            .from('Reminders')
            .update(reminderData)
            .eq('id', id)
            .select()
            .single()

        return { data, error }
    }

    // Elimina un reminder
    static async delete(id: number): Promise<{ data: any; error: any }> {
        const { data, error } = await supabase
            .from('Reminders')
            .delete()
            .eq('id', id)

        return { data, error }
    }

    // Elimina tutti i reminder di una configurazione di priorità
    static async deleteByPriorityConfigId(priorityConfigId: number): Promise<{ data: any; error: any }> {
        const { data, error } = await supabase
            .from('Reminders')
            .delete()
            .eq('priority_config_id', priorityConfigId)

        return { data, error }
    }

    // Aggiorna tutti i reminder di una configurazione (elimina e ricrea)
    static async updateRemindersForConfig(
        priorityConfigId: number,
        reminders: Omit<Reminder, 'id' | 'created_at' | 'priority_config_id'>[]
    ): Promise<{ data: Reminder[] | null; error: any }> {
        // Prima elimina tutti i reminder esistenti
        const { error: deleteError } = await supabase
            .from('Reminders')
            .delete()
            .eq('priority_config_id', priorityConfigId)

        if (deleteError) return { data: null, error: deleteError }

        // Se non ci sono reminder da aggiungere, ritorna array vuoto
        if (reminders.length === 0) {
            return { data: [], error: null }
        }

        // Aggiungi i nuovi reminder
        const remindersWithConfigId = reminders.map(r => ({
            ...r,
            priority_config_id: priorityConfigId
        }))

        const { data, error } = await supabase
            .from('Reminders')
            .insert(remindersWithConfigId)
            .select()

        return { data, error }
    }

    // Conta i reminder di una configurazione
    static async countByPriorityConfigId(priorityConfigId: number): Promise<{ count: number | null; error: any }> {
        const { count, error } = await supabase
            .from('Reminders')
            .select('*', { count: 'exact', head: true })
            .eq('priority_config_id', priorityConfigId)

        return { count, error }
    }

    // Converti il valore del reminder in millisecondi
    static toMilliseconds(value: number, unit: TimeUnit): number {
        switch (unit) {
            case 'minutes':
                return value * 60 * 1000
            case 'hours':
                return value * 60 * 60 * 1000
            case 'days':
                return value * 24 * 60 * 60 * 1000
            default:
                return 0
        }
    }

    // Converti il valore del reminder in minuti
    static toMinutes(value: number, unit: TimeUnit): number {
        switch (unit) {
            case 'minutes':
                return value
            case 'hours':
                return value * 60
            case 'days':
                return value * 24 * 60
            default:
                return 0
        }
    }

    // Formatta il reminder in stringa leggibile
    static formatReminder(value: number, unit: TimeUnit): string {
        const unitLabels: Record<TimeUnit, { singular: string; plural: string }> = {
            minutes: { singular: 'minuto', plural: 'minuti' },
            hours: { singular: 'ora', plural: 'ore' },
            days: { singular: 'giorno', plural: 'giorni' }
        }

        const label = value === 1 ? unitLabels[unit].singular : unitLabels[unit].plural
        return `${value} ${label} prima`
    }

    // Calcola la data/ora del reminder basata sulla scadenza del task
    static calculateReminderTime(dueDate: Date, value: number, unit: TimeUnit): Date {
        const reminderTime = new Date(dueDate)
        const milliseconds = this.toMilliseconds(value, unit)
        reminderTime.setTime(reminderTime.getTime() - milliseconds)
        return reminderTime
    }

    // Verifica se un reminder deve essere inviato ora
    static shouldTrigger(dueDate: Date, value: number, unit: TimeUnit, toleranceMinutes: number = 5): boolean {
        const reminderTime = this.calculateReminderTime(dueDate, value, unit)
        const now = new Date()
        const toleranceMs = toleranceMinutes * 60 * 1000

        return Math.abs(now.getTime() - reminderTime.getTime()) <= toleranceMs
    }
}
