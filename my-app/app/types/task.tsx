import { PriorityLevel } from "@/public/Priority";  
import { Category } from "@/public/Category";

export type ColumnData = {
    id: ColumnId;
    title: string;
    color: string;
};

export type ColumnId = 'todo' | 'inprogress' | 'done';

export interface Task {
    _id?: string;
    title: string;
    description: string;
    priority: PriorityLevel;
    boardId: string;
    columnId: ColumnId;
    dueDate: Date;
    categories: Category[];
    comments: number;
    attachments: number;
}