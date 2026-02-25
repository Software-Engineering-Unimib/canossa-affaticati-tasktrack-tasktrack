/**
 * @fileoverview Item della sidebar per una singola bacheca.
 *
 * Mostra il nome e il colore della bacheca con link alla board.
 *
 * @module components/sidebar/SidebarBoardItem
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

/**
 * Props del componente.
 */
interface SidebarBoardItemProps {
    /** ID della bacheca (stringa o numero) */
    id: number | string;
    /** Nome della bacheca */
    name: string;
    /** Classe CSS per il colore del dot (es. 'bg-blue-500') */
    color: string;
}

/**
 * Item della sidebar per una bacheca.
 *
 * Mostra:
 * - Indicatore colore (dot)
 * - Nome bacheca (troncato se troppo lungo)
 * - Freccia on hover
 */
export default function SidebarBoardItem({
                                             id,
                                             name,
                                             color
                                         }: SidebarBoardItemProps): React.ReactElement {
    return (
        <Link
            href={`/board/${id}`}
            className="group flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors"
        >
            {/* Indicatore colore */}
            <span
                className={`w-2.5 h-2.5 rounded-full mr-3 shrink-0 ${color}`}
                aria-hidden="true"
            />

            {/* Nome bacheca */}
            <span className="truncate flex-1">{name}</span>

            {/* Freccia (visibile solo on hover) */}
            <ChevronRight
                className="w-4 h-4 opacity-0 group-hover:opacity-100 text-gray-400 transition-opacity"
                aria-hidden="true"
            />
        </Link>
    );
}