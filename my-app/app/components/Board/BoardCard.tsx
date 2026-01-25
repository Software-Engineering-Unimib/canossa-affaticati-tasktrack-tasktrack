/**
 * @fileoverview Componente card per visualizzare una bacheca.
 *
 * Mostra titolo, icona, tema e statistiche della bacheca.
 * Supporta navigazione alla board e azione di modifica.
 *
 * @module components/Board/BoardCard
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { MoreVertical, BookOpen } from 'lucide-react';
import { BoardIcons, Icon } from '@/items/BoardIcon';
import { BoardStats, themeCardStyles, BoardTheme } from '@/items/Board';

/**
 * Props del componente BoardCard.
 */
export interface BoardCardProps {
    /** ID univoco della bacheca */
    id: string | number;
    /** Titolo della bacheca */
    title: string;
    /** Identificatore dell'icona */
    icon: Icon;
    /** Tema colore della card */
    theme: BoardTheme;
    /** Statistiche aggregate */
    stats: BoardStats;
    /** Callback per l'azione di modifica */
    onEdit: () => void;
}

/**
 * Configurazione di un indicatore statistico.
 */
interface StatIndicatorConfig {
    /** Valore numerico */
    value: number;
    /** Label quando il valore è > 0 */
    activeLabel: string;
    /** Label quando il valore è 0 */
    inactiveLabel: string;
    /** Classe CSS per il dot quando attivo */
    activeClass: string;
    /** Classe CSS aggiuntiva per il testo */
    textClass?: string;
}

/**
 * Componente per un singolo indicatore statistico.
 */
function StatIndicator({
                           value,
                           activeLabel,
                           inactiveLabel,
                           activeClass,
                           textClass = ''
                       }: StatIndicatorConfig) {
    const isActive = value > 0;
    const dotClass = isActive
        ? `${activeClass} shadow-sm`
        : 'border-2 border-slate-400/50 bg-transparent';

    return (
        <div className="flex items-center gap-3 text-sm font-medium">
            <div className={`w-3.5 h-3.5 rounded-full shrink-0 ${dotClass}`} />
            <span className={isActive ? `text-slate-700 ${textClass}` : 'text-slate-500'}>
                <span className={`font-bold ${textClass}`}>{value}</span> {isActive ? activeLabel : inactiveLabel}
            </span>
        </div>
    );
}

/**
 * Card per visualizzare una bacheca nella dashboard.
 *
 * Struttura:
 * - Header: icona + titolo + pulsante modifica
 * - Body: indicatori statistici (scadenze, in corso, completati)
 *
 * Il body è un link che naviga alla board.
 */
export default function BoardCard({
                                      id,
                                      title,
                                      icon,
                                      theme,
                                      stats,
                                      onEdit,
                                  }: BoardCardProps) {
    // Risolve l'icona dal registry, con fallback
    const IconComponent = BoardIcons[icon] ?? BookOpen;

    // Risolve le classi del tema, con fallback
    const cardClasses = themeCardStyles[theme] ?? themeCardStyles.blue;

    /**
     * Handler per il click sul pulsante modifica.
     * Previene la propagazione al link sottostante.
     */
    const handleEditClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onEdit();
    };

    return (
        <div className={`
            relative group rounded-2xl p-5 transition-all duration-200 
            border shadow-sm hover:shadow-md ${cardClasses}
        `}>
            {/* Header */}
            <div className="flex items-start justify-between mb-4 relative z-20">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/60 rounded-lg backdrop-blur-sm shadow-sm">
                        <IconComponent className="w-5 h-5 opacity-80" />
                    </div>
                    <h3 className="font-bold text-lg leading-tight tracking-tight">
                        {title}
                    </h3>
                </div>

                <button
                    onClick={handleEditClick}
                    className="
                        p-1.5 rounded-full hover:bg-white/60 transition-colors
                        opacity-0 group-hover:opacity-100 focus:opacity-100 outline-none
                    "
                    aria-label={`Modifica bacheca ${title}`}
                >
                    <MoreVertical className="w-5 h-5 opacity-60" />
                </button>
            </div>

            {/* Body - Link alla board */}
            <Link href={`/board/${id}`} className="block space-y-3 relative z-10">
                <StatIndicator
                    value={stats.deadlines}
                    activeLabel="Scadenze oggi"
                    inactiveLabel="Nessuna scadenza"
                    activeClass="bg-red-500 animate-pulse"
                    textClass="text-red-600"
                />

                <StatIndicator
                    value={stats.inProgress}
                    activeLabel="In corso"
                    inactiveLabel="In corso"
                    activeClass="bg-amber-400"
                />

                <StatIndicator
                    value={stats.completed}
                    activeLabel="Completati"
                    inactiveLabel="Completati"
                    activeClass="bg-emerald-500"
                />
            </Link>
        </div>
    );
}