/**
 * @fileoverview Registry delle icone disponibili per le bacheche.
 *
 * Implementa il pattern Registry per associare stringhe identificative
 * ai componenti icona di Lucide React.
 *
 * @module items/BoardIcon
 */

import { BookSearch, Briefcase, GraduationCap, Home, LucideIcon } from 'lucide-react';

/** Identificatori delle icone disponibili per le bacheche */
export type Icon = 'university' | 'personal' | 'work' | 'other';

/**
 * Registry delle icone.
 * Mappa ogni identificatore al componente Lucide corrispondente.
 *
 * Pattern: Registry Pattern
 * Vantaggi:
 * - Centralizza la mappatura icone
 * - Facilita l'aggiunta di nuove icone
 * - Type-safe grazie al tipo Icon
 */
export const BoardIcons: Readonly<Record<Icon, LucideIcon>> = {
    university: GraduationCap,
    personal: Home,
    other: BookSearch,
    work: Briefcase,
} as const;

/**
 * Configurazione delle opzioni per i selettori di icone.
 * Fornisce etichette localizzate per l'interfaccia utente.
 */
interface IconOption {
    value: Icon;
    label: string;
}

/**
 * Opzioni per la select delle icone nei form di creazione/modifica bacheca.
 */
export const iconBoardOptions: ReadonlyArray<IconOption> = [
    { value: 'university', label: 'Università' },
    { value: 'personal', label: 'Personale & Hobby' },
    { value: 'work', label: 'Lavoro' },
    { value: 'other', label: 'Altro' },
] as const;