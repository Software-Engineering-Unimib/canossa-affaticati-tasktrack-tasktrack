/**
 * @fileoverview Definizioni per i Task e le colonne Kanban.
 *
 * Questo modulo definisce la struttura dei task e delle colonne
 * utilizzate nella Kanban board.
 *
 * @module items/Task
 */

import { PriorityLevel } from './Priority';
import { Category } from './Category';

/** Identificatori delle colonne Kanban */
export type ColumnId = 'todo' | 'inprogress' | 'done';

/**
 * Rappresenta un assegnatario di un task.
 * Struttura allineata con la tabella Profiles del database.
 */
export interface TaskAssignee {
    id: string;
    name: string;
    surname: string;
    email?: string;
    avatar_url?: string;
    created_at?: string;
}

/**
 * @deprecated Usa TaskAssignee invece. Mantenuto per retrocompatibilità.
 */
export type TaskAssignees = TaskAssignee;

/**
 * Rappresenta un task nel sistema.
 */
export interface Task {
    id: string;
    title: string;
    description?: string;
    categories: Category[];
    priority: PriorityLevel;
    columnId: ColumnId;
    dueDate: Date;
    assignees: TaskAssignee[];
    /** Numero di commenti associati al task */
    comments: number;
    /** Numero di allegati associati al task */
    attachments: number;
}

/**
 * Configurazione di una colonna Kanban.
 */
export interface ColumnData {
    id: ColumnId;
    title: string;
    color: string;
}

/**
 * Configurazione predefinita delle colonne Kanban.
 * Può essere usata come default nel componente board.
 */
export const DEFAULT_COLUMNS: ReadonlyArray<ColumnData> = [
    { id: 'todo', title: 'Da Fare', color: 'bg-blue-500/50' },
    { id: 'inprogress', title: 'In Corso', color: 'bg-amber-500/50' },
    { id: 'done', title: 'Completato', color: 'bg-emerald-500/50' },
] as const;