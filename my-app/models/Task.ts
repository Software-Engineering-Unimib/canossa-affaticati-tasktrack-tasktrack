import { supabase } from '@/lib/supabase'
import { Category } from './Category'

export type ColumnId = 'todo' | 'inprogress' | 'done'
export type PriorityLevel = 'Bassa' | 'Media' | 'Alta' | 'Urgente'

export interface Task {
    id?: number
    created_at?: string
    updated_at?: string
    title: string
    description?: string
    priority: PriorityLevel
    column_id: ColumnId
    due_date: string // ISO date string
    board_id: number // FK to Boards
    created_by: number // FK to Users
}

export interface TaskWithRelations extends Task {
    categories?: Category[]
    assignees?: TaskAssignee[]
    comments_count?: number
    attachments_count?: number
}

export interface TaskAssignee {
    user_id: number
    user_email?: string
    user_name?: string
}

export class TaskModel {
    // Ottieni tutti i task
    static async findAll(): Promise<{ data: Task[] | null; error: any }> {
        const { data, error } = await supabase
            .from('Tasks')
            .select('*')
            .order('created_at', { ascending: false })

        return { data, error }
    }

    // Ottieni tutti i task di una bacheca
    static async findByBoardId(boardId: number): Promise<{ data: Task[] | null; error: any }> {
        const { data, error } = await supabase
            .from('Tasks')
            .select('*')
            .eq('board_id', boardId)
            .order('due_date', { ascending: true })

        return { data, error }
    }

    // Ottieni tutti i task di una bacheca con le relazioni
    static async findByBoardIdWithRelations(boardId: number): Promise<{ data: TaskWithRelations[] | null; error: any }> {
        const { data: tasks, error: tasksError } = await supabase
            .from('Tasks')
            .select(`
                *,
                TaskCategories (
                    Categories (*)
                ),
                TaskAssignees (
                    Users (id, email, name)
                )
            `)
            .eq('board_id', boardId)
            .order('due_date', { ascending: true })

        if (tasksError) return { data: null, error: tasksError }

        // Per ogni task, ottieni il conteggio di commenti e allegati
        const tasksWithCounts = await Promise.all(
            (tasks || []).map(async (task) => {
                const [commentsResult, attachmentsResult] = await Promise.all([
                    supabase.from('Comments').select('*', { count: 'exact', head: true }).eq('task_id', task.id),
                    supabase.from('Attachments').select('*', { count: 'exact', head: true }).eq('task_id', task.id)
                ])

                return {
                    ...task,
                    categories: task.TaskCategories?.map((tc: any) => tc.Categories).filter(Boolean) || [],
                    assignees: task.TaskAssignees?.map((ta: any) => ({
                        user_id: ta.Users?.id,
                        user_email: ta.Users?.email,
                        user_name: ta.Users?.name
                    })).filter((a: any) => a.user_id) || [],
                    comments_count: commentsResult.count || 0,
                    attachments_count: attachmentsResult.count || 0
                }
            })
        )

        return { data: tasksWithCounts, error: null }
    }

    // Ottieni un task per ID
    static async findById(id: number): Promise<{ data: Task | null; error: any }> {
        const { data, error } = await supabase
            .from('Tasks')
            .select('*')
            .eq('id', id)
            .single()

        return { data, error }
    }

    // Ottieni un task con tutte le relazioni
    static async findByIdWithRelations(id: number): Promise<{ data: TaskWithRelations | null; error: any }> {
        const { data: task, error: taskError } = await supabase
            .from('Tasks')
            .select(`
                *,
                TaskCategories (
                    Categories (*)
                ),
                TaskAssignees (
                    Users (id, email, name)
                )
            `)
            .eq('id', id)
            .single()

        if (taskError) return { data: null, error: taskError }

        const [commentsResult, attachmentsResult] = await Promise.all([
            supabase.from('Comments').select('*', { count: 'exact', head: true }).eq('task_id', id),
            supabase.from('Attachments').select('*', { count: 'exact', head: true }).eq('task_id', id)
        ])

        const taskWithRelations: TaskWithRelations = {
            ...task,
            categories: task.TaskCategories?.map((tc: any) => tc.Categories).filter(Boolean) || [],
            assignees: task.TaskAssignees?.map((ta: any) => ({
                user_id: ta.Users?.id,
                user_email: ta.Users?.email,
                user_name: ta.Users?.name
            })).filter((a: any) => a.user_id) || [],
            comments_count: commentsResult.count || 0,
            attachments_count: attachmentsResult.count || 0
        }

        return { data: taskWithRelations, error: null }
    }

    // Ottieni task per colonna
    static async findByColumnId(boardId: number, columnId: ColumnId): Promise<{ data: Task[] | null; error: any }> {
        const { data, error } = await supabase
            .from('Tasks')
            .select('*')
            .eq('board_id', boardId)
            .eq('column_id', columnId)
            .order('due_date', { ascending: true })

        return { data, error }
    }

    // Crea un nuovo task
    static async create(taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: Task | null; error: any }> {
        const { data, error } = await supabase
            .from('Tasks')
            .insert(taskData)
            .select()
            .single()

        return { data, error }
    }

    // Crea un task con categorie
    static async createWithCategories(
        taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>,
        categoryIds: number[]
    ): Promise<{ data: Task | null; error: any }> {
        // Prima crea il task
        const { data: task, error: taskError } = await supabase
            .from('Tasks')
            .insert(taskData)
            .select()
            .single()

        if (taskError || !task) return { data: null, error: taskError }

        // Poi aggiungi le categorie
        if (categoryIds.length > 0) {
            const taskCategories = categoryIds.map(categoryId => ({
                task_id: task.id,
                category_id: categoryId
            }))

            const { error: categoriesError } = await supabase
                .from('TaskCategories')
                .insert(taskCategories)

            if (categoriesError) {
                // Rollback: elimina il task se l'inserimento delle categorie fallisce
                await supabase.from('Tasks').delete().eq('id', task.id)
                return { data: null, error: categoriesError }
            }
        }

        return { data: task, error: null }
    }

    // Aggiorna un task
    static async update(id: number, taskData: Partial<Omit<Task, 'id' | 'created_at' | 'updated_at' | 'board_id' | 'created_by'>>): Promise<{ data: Task | null; error: any }> {
        const { data, error } = await supabase
            .from('Tasks')
            .update({ ...taskData, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single()

        return { data, error }
    }

    // Sposta un task in un'altra colonna
    static async moveToColumn(id: number, columnId: ColumnId): Promise<{ data: Task | null; error: any }> {
        return this.update(id, { column_id: columnId })
    }

    // Elimina un task
    static async delete(id: number): Promise<{ data: any; error: any }> {
        const { data, error } = await supabase
            .from('Tasks')
            .delete()
            .eq('id', id)

        return { data, error }
    }

    // Cerca task per titolo in una bacheca
    static async search(boardId: number, query: string): Promise<{ data: Task[] | null; error: any }> {
        const { data, error } = await supabase
            .from('Tasks')
            .select('*')
            .eq('board_id', boardId)
            .or(`title.ilike.%${query}%,description.ilike.%${query}%`)

        return { data, error }
    }

    // Filtra task per priorità
    static async findByPriority(boardId: number, priority: PriorityLevel): Promise<{ data: Task[] | null; error: any }> {
        const { data, error } = await supabase
            .from('Tasks')
            .select('*')
            .eq('board_id', boardId)
            .eq('priority', priority)

        return { data, error }
    }

    // Ottieni task in scadenza oggi
    static async findDueToday(userId: number): Promise<{ data: Task[] | null; error: any }> {
        const today = new Date()
        const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString()
        const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString()

        const { data, error } = await supabase
            .from('Tasks')
            .select(`
                *,
                Boards!inner (owner_id)
            `)
            .eq('Boards.owner_id', userId)
            .gte('due_date', startOfDay)
            .lte('due_date', endOfDay)
            .neq('column_id', 'done')

        return { data, error }
    }

    // Conta task per bacheca
    static async countByBoardId(boardId: number): Promise<{ count: number | null; error: any }> {
        const { count, error } = await supabase
            .from('Tasks')
            .select('*', { count: 'exact', head: true })
            .eq('board_id', boardId)

        return { count, error }
    }
}
