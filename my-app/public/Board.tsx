// Interfaccia per i dati della bacheca esistente
import { Icon } from "@/public/BoardIcon";
import { Category } from "./Category";

export interface Board {
    id: string;
    title: string;
    description: string;
    icon: Icon;
    categories: Category[];
    theme: BoardTheme;
    stats: BoardStats;
    guests: string[];
}

// Riusiamo i tipi (o importali da un file types.ts condiviso)
export type BoardTheme = 'blue' | 'green' | 'purple' | 'orange';

export const themeBoardOptions: { value: BoardTheme; label: string; class: string }[] = [
    { value: 'blue', label: 'Blu', class: 'bg-blue-500' },
    { value: 'green', label: 'Verde', class: 'bg-green-500' },
    { value: 'purple', label: 'Viola', class: 'bg-purple-500' },
    { value: 'orange', label: 'Arancione', class: 'bg-orange-400' },
];

export function getClassByTheme(themeValue: string): string {
    const theme = themeBoardOptions.find(t => t.value === themeValue);
    return theme ? theme.class : 'bg-blue-500';
}

export const themeCardStyles: Record<BoardTheme, string> = {
    blue: 'bg-blue-50 border-blue-200 hover:border-blue-300 text-blue-900',
    green: 'bg-green-50 border-green-200 hover:border-green-300 text-green-900',
    purple: 'bg-purple-50 border-purple-200 hover:border-purple-300 text-purple-900',
    orange: 'bg-orange-50 border-orange-200 hover:border-orange-300 text-orange-900',
};

export type BoardIcon = 'university' | 'personal' | 'work' | 'other';

export interface BoardStats {
    deadlines: number;
    inProgress: number;
    completed: number;
}

export function getBoardFromId(boards: Board[], id: string | number): Board | undefined {
    return boards.find(board => board.id == id);
}

