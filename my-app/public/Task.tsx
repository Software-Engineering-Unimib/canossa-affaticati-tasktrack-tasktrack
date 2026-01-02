import { Priority } from "./Priority";
import { Category } from "./Category";

export type ColumnId = 'todo' | 'inprogress' | 'done';

export interface Task {
    id: string;
    title: string;
    description?: string;
    category: Category;
    priority: Priority;
    columnId: ColumnId;
    dueDate: string;
    assignees?: string[];
    comments: number;
    attachments: number;
}

export interface ColumnData {
    id: ColumnId;
    title: string;
    color: string;
}