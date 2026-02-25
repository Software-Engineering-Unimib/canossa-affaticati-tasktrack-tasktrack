/**
 * @fileoverview Definizioni e utility per la gestione delle categorie dei task.
 *
 * Le categorie permettono di classificare i task all'interno di una bacheca.
 * Ogni categoria ha un nome e un colore associato per la visualizzazione.
 *
 * @module items/Category
 */

/**
 * Rappresenta una categoria di task.
 */
export interface Category {
    id: string;
    name: string;
    color: string;
}

/**
 * Configurazione di un tema colore per le categorie.
 */
interface ThemeCategoryOption {
    value: string;
    label: string;
    class: string;
}

/**
 * Palette di colori disponibili per le categorie.
 * Ogni opzione include il valore, l'etichetta localizzata e le classi CSS.
 */
export const themeCategoryOptions: ReadonlyArray<ThemeCategoryOption> = [
    { value: 'blue', label: 'Blu', class: 'bg-blue-500 text-white hover:bg-blue-300' },
    { value: 'cyan', label: 'Ciano', class: 'bg-cyan-500 text-white hover:bg-cyan-300' },
    { value: 'green', label: 'Verde', class: 'bg-green-500 text-white hover:bg-green-300' },
    { value: 'purple', label: 'Viola', class: 'bg-purple-500 text-white hover:bg-purple-300' },
    { value: 'orange', label: 'Arancione', class: 'bg-orange-500 text-white hover:bg-orange-300' },
    { value: 'yellow', label: 'Giallo', class: 'bg-yellow-500 text-white hover:bg-yellow-300' },
    { value: 'red', label: 'Rosso', class: 'bg-red-500 text-white hover:bg-red-300' },
    { value: 'pink', label: 'Rosa', class: 'bg-pink-500 text-white hover:bg-pink-300' },
    { value: 'slate', label: 'Grigio', class: 'bg-slate-500 text-white hover:bg-slate-300' },
] as const;

/** Classe CSS di fallback per colori non riconosciuti */
const DEFAULT_CATEGORY_CLASS = 'bg-slate-200 text-slate-800';

/**
 * Mappa per lookup O(1) delle classi CSS per colore.
 * Costruita una sola volta all'inizializzazione del modulo.
 */
const categoryColorMap = new Map<string, string>(
    themeCategoryOptions.map(opt => [opt.value, opt.class])
);

/**
 * Restituisce la classe CSS associata a un colore di categoria.
 *
 * @param colorValue - Il valore del colore (es. 'blue', 'red')
 * @returns Le classi CSS Tailwind per il colore specificato
 *
 * @example
 * ```tsx
 * <span className={getCategoryColorClass(category.color)}>{category.name}</span>
 * ```
 */
export const getCategoryColorClass = (colorValue: string): string => {
    return categoryColorMap.get(colorValue) ?? DEFAULT_CATEGORY_CLASS;
};