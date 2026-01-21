import { PriorityLevel } from "./Priority";
import { Category } from "./Category";

export type ColumnId = 'todo' | 'inprogress' | 'done';

export interface Task {
    id: string;
    title: string;
    description?: string;
    categories: Category[];
    priority: PriorityLevel;
    columnId: ColumnId;
    dueDate: Date;
    assignees: TaskAssignees[];
    comments: number;
    attachments: number;
}

export interface ColumnData {
    id: ColumnId;
    title: string;
    color: string;
}

export interface TaskAssignees {
    id: string       // UUID
    name: string
    surname: string
    email?: string   // Preso da auth.users
    avatar_url?: string
    created_at?: string
}