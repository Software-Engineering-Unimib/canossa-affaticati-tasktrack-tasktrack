// Riusiamo i tipi (o importali da un file types.ts condiviso)
export type BoardTheme = 'blue' | 'green' | 'purple' | 'orange';

// Interfaccia per i dati della bacheca esistente
export interface Board {
    id: string | number;
    title: string;
    description: string;
    category: BoardCategory;
    theme: BoardTheme;
    stats: BoardStats;
    guests: string[];
}

export const themeOptions: { value: BoardTheme; label: string; class: string }[] = [
    { value: 'blue', label: 'Blu', class: 'bg-blue-500' },
    { value: 'green', label: 'Verde', class: 'bg-green-500' },
    { value: 'purple', label: 'Viola', class: 'bg-purple-500' },
    { value: 'orange', label: 'Arancione', class: 'bg-orange-400' },
];

export function getClassByTheme(themeValue: string): string {
    const theme = themeOptions.find(t => t.value === themeValue);
    return theme ? theme.class : 'bg-blue-500'; // Ritorna un default se non trova nulla
}


export type BoardCategory = 'university' | 'personal' | 'thesis' | 'work';

export interface BoardStats {
    deadlines: number;
    inProgress: number;
    completed: number;
}

export interface BoardCardProps {
    id: string | number;
    title: string;
    category: BoardCategory;
    theme: BoardTheme;
    stats: BoardStats;
    onEdit: () => void; // Funzione scatenata al click su Modifica
}