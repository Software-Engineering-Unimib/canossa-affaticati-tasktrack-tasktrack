import { supabase } from '@/lib/supabase'

export type PriorityLevel = 'Bassa' | 'Media' | 'Alta' | 'Urgente'

export interface PriorityConfig {
    id?: number
    created_at?: string
    updated_at?: string
    priority_level: PriorityLevel
    label: string
    description?: string
    color_class: string // Classe CSS per il colore del badge
    bg_class: string // Classe CSS per lo sfondo
    user_id: number // FK to Users - Ogni utente può avere le sue configurazioni
}

export interface PriorityConfigWithReminders extends PriorityConfig {
    reminders?: Reminder[]
}

// Import Reminder per evitare dipendenze circolari
import { Reminder } from './Reminder'

export class PriorityConfigModel {
    // Configurazioni di default per le priorità
    static readonly DEFAULT_CONFIGS: Omit<PriorityConfig, 'id' | 'created_at' | 'updated_at' | 'user_id'>[] = [
        {
            priority_level: 'Bassa',
            label: 'Bassa',
            description: 'Task non critici, scadenze flessibili.',
            color_class: 'text-emerald-700 bg-emerald-100 border-emerald-200',
            bg_class: 'bg-emerald-50/50'
        },
        {
            priority_level: 'Media',
            label: 'Media',
            description: 'Attività standard da completare in settimana.',
            color_class: 'text-amber-700 bg-amber-100 border-amber-200',
            bg_class: 'bg-amber-50/50'
        },
        {
            priority_level: 'Alta',
            label: 'Alta',
            description: 'Task importanti che richiedono attenzione immediata.',
            color_class: 'text-orange-700 bg-orange-100 border-orange-200',
            bg_class: 'bg-orange-50/50'
        },
        {
            priority_level: 'Urgente',
            label: 'Urgente',
            description: 'Scadenze imminenti o blocchi critici.',
            color_class: 'text-red-700 bg-red-100 border-red-200',
            bg_class: 'bg-red-50/50'
        }
    ]

    // Ottieni tutte le configurazioni di priorità di un utente
    static async findByUserId(userId: number): Promise<{ data: PriorityConfig[] | null; error: any }> {
        const { data, error } = await supabase
            .from('PriorityConfigs')
            .select('*')
            .eq('user_id', userId)
            .order('priority_level', { ascending: true })

        return { data, error }
    }

    // Ottieni tutte le configurazioni con i reminder
    static async findByUserIdWithReminders(userId: number): Promise<{ data: PriorityConfigWithReminders[] | null; error: any }> {
        const { data, error } = await supabase
            .from('PriorityConfigs')
            .select(`
                *,
                Reminders (*)
            `)
            .eq('user_id', userId)
            .order('priority_level', { ascending: true })

        const formattedData = data?.map(item => ({
            ...item,
            reminders: item.Reminders || []
        })) || null

        return { data: formattedData, error }
    }

    // Ottieni una configurazione per ID
    static async findById(id: number): Promise<{ data: PriorityConfig | null; error: any }> {
        const { data, error } = await supabase
            .from('PriorityConfigs')
            .select('*')
            .eq('id', id)
            .single()

        return { data, error }
    }

    // Ottieni una configurazione per livello di priorità e utente
    static async findByPriorityLevel(userId: number, priorityLevel: PriorityLevel): Promise<{ data: PriorityConfig | null; error: any }> {
        const { data, error } = await supabase
            .from('PriorityConfigs')
            .select('*')
            .eq('user_id', userId)
            .eq('priority_level', priorityLevel)
            .single()

        return { data, error }
    }

    // Crea una nuova configurazione
    static async create(configData: Omit<PriorityConfig, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: PriorityConfig | null; error: any }> {
        const { data, error } = await supabase
            .from('PriorityConfigs')
            .insert(configData)
            .select()
            .single()

        return { data, error }
    }

    // Crea le configurazioni di default per un nuovo utente
    static async createDefaultsForUser(userId: number): Promise<{ data: PriorityConfig[] | null; error: any }> {
        const configs = this.DEFAULT_CONFIGS.map(config => ({
            ...config,
            user_id: userId
        }))

        const { data, error } = await supabase
            .from('PriorityConfigs')
            .insert(configs)
            .select()

        return { data, error }
    }

    // Aggiorna una configurazione
    static async update(id: number, configData: Partial<Omit<PriorityConfig, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'priority_level'>>): Promise<{ data: PriorityConfig | null; error: any }> {
        const { data, error } = await supabase
            .from('PriorityConfigs')
            .update({ ...configData, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single()

        return { data, error }
    }

    // Elimina una configurazione
    static async delete(id: number): Promise<{ data: any; error: any }> {
        const { data, error } = await supabase
            .from('PriorityConfigs')
            .delete()
            .eq('id', id)

        return { data, error }
    }

    // Elimina tutte le configurazioni di un utente
    static async deleteByUserId(userId: number): Promise<{ data: any; error: any }> {
        const { data, error } = await supabase
            .from('PriorityConfigs')
            .delete()
            .eq('user_id', userId)

        return { data, error }
    }

    // Resetta le configurazioni alle impostazioni di default
    static async resetToDefaults(userId: number): Promise<{ data: PriorityConfig[] | null; error: any }> {
        // Prima elimina le configurazioni esistenti
        await this.deleteByUserId(userId)

        // Poi crea quelle di default
        return this.createDefaultsForUser(userId)
    }

    // Verifica se un utente ha già le configurazioni
    static async existsForUser(userId: number): Promise<{ exists: boolean; error: any }> {
        const { count, error } = await supabase
            .from('PriorityConfigs')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)

        return { exists: (count || 0) > 0, error }
    }

    // Helper per ottenere le classi CSS di una priorità
    static getPriorityStyles(priority: PriorityLevel): { colorClass: string; bgClass: string } {
        const config = this.DEFAULT_CONFIGS.find(c => c.priority_level === priority)
        return {
            colorClass: config?.color_class || 'text-slate-700 bg-slate-100 border-slate-200',
            bgClass: config?.bg_class || 'bg-slate-50/50'
        }
    }
}
