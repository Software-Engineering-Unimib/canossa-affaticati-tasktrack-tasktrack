import {BoardTheme} from "./Board";

export interface Category {
    id: string | number;
    name: string;
    color: string;
}

export const themeCategoryOptions: { value: BoardTheme; label: string; class: string }[] = [
    { value: 'blue', label: 'Blu', class: 'bg-blue-500 text-white hover:bg-blue-300' },
    { value: 'green', label: 'Verde', class: 'bg-green-500 text-white hover:bg-green-300' },
    { value: 'purple', label: 'Viola', class: 'bg-purple-500 text-white hover:bg-purple-300' },
    { value: 'orange', label: 'Arancione', class: 'bg-orange-500 text-white hover:bg-orange-300' },
];