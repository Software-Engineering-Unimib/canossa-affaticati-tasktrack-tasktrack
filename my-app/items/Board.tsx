/**
 * @fileoverview Definizioni e utility per le bacheche (Boards).
 *
 * Una bacheca rappresenta uno spazio di lavoro che contiene task organizzati
 * in categorie con un tema visivo personalizzabile.
 *
 * @module items/Board
 */

import { Icon } from '@/items/BoardIcon';
import { Category } from './Category';

/** Temi colore disponibili per le bacheche */
export type BoardTheme = 'blue' | 'green' | 'purple' | 'orange';

/** Alias per il tipo icona (re-export per comodità) */
export type BoardIcon = Icon;

/**
 * Statistiche aggregate di una bacheca.
 * Calcolate a partire dallo stato dei task contenuti.
 */
export interface BoardStats {
    /** Numero di task con scadenza oggi o passata (non completati) */
    deadlines: number;
    /** Numero di task in stato "in corso" */
    inProgress: number;
    /** Numero di task completati */
    completed: number;
}

/**
 * Rappresenta una bacheca completa.
 */
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

/**
 * Configurazione di un tema per le opzioni UI.
 */
interface ThemeBoardOption {
    value: BoardTheme;
    label: string;
    class: string;
}

/**
 * Opzioni per la select del tema nei form.
 */
export const themeBoardOptions: ReadonlyArray<ThemeBoardOption> = [
    { value: 'blue', label: 'Blu', class: 'bg-blue-500' },
    { value: 'green', label: 'Verde', class: 'bg-green-500' },
    { value: 'purple', label: 'Viola', class: 'bg-purple-500' },
    { value: 'orange', label: 'Arancione', class: 'bg-orange-400' },
] as const;

/**
 * Mappa per lookup O(1) delle classi tema.
 */
const themeClassMap = new Map<BoardTheme, string>(
    themeBoardOptions.map(opt => [opt.value, opt.class])
);

/** Classe CSS di default per temi non riconosciuti */
const DEFAULT_THEME_CLASS = 'bg-blue-500';

/**
 * Restituisce la classe CSS del tema di una bacheca.
 *
 * @param themeValue - Il valore del tema
 * @returns La classe CSS Tailwind corrispondente
 */
export const getClassByTheme = (themeValue: string): string => {
    return themeClassMap.get(themeValue as BoardTheme) ?? DEFAULT_THEME_CLASS;
};

/**
 * Stili CSS per le card delle bacheche, indicizzati per tema.
 * Utilizzati nel componente BoardCard.
 */
export const themeCardStyles: Readonly<Record<BoardTheme, string>> = {
    blue: 'bg-blue-50 border-blue-200 hover:border-blue-300 text-blue-900',
    green: 'bg-green-50 border-green-200 hover:border-green-300 text-green-900',
    purple: 'bg-purple-50 border-purple-200 hover:border-purple-300 text-purple-900',
    orange: 'bg-orange-50 border-orange-200 hover:border-orange-300 text-orange-900',
} as const;

/**
 * Cerca una bacheca per ID all'interno di un array.
 *
 * @param boards - Array di bacheche in cui cercare
 * @param id - ID della bacheca da trovare
 * @returns La bacheca trovata o undefined
 *
 * @remarks
 * Utilizza loose equality (==) per supportare sia ID stringa che numerici.
 */
export const getBoardFromId = (boards: Board[], id: string | number): Board | undefined => {
    return boards.find(board => board.id == id);
};