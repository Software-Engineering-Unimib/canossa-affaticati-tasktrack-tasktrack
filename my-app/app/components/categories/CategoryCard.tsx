/**
 * @fileoverview Card per visualizzare le categorie di una bacheca.
 *
 * Utilizzata nella pagina di gestione categorie.
 *
 * @module components/categories/CategoryCard
 */

'use client';

import React from 'react';
import { MoreVertical, BookOpen } from 'lucide-react';
import { BoardIcons, Icon } from '@/items/BoardIcon';
import { themeCardStyles, BoardTheme } from '@/items/Board';
import { Category, getCategoryColorClass } from '@/items/Category';

/**
 * Props del componente.
 */
export interface CategoryCardProps {
    /** ID della bacheca */
    id: string | number;
    /** Titolo della bacheca */
    title: string;
    /** Tema colore della card */
    theme: BoardTheme;
    /** Lista categorie della bacheca */
    categories: Category[];
    /** Icona della bacheca */
    icon: Icon;
    /** Callback per l'azione di modifica */
    onEdit: () => void;
}

/**
 * Card per visualizzare le categorie di una bacheca.
 */
export default function CategoryCard({
                                         id,
                                         title,
                                         icon,
                                         theme,
                                         categories,
                                         onEdit,
                                     }: CategoryCardProps): React.ReactElement {
    // Risolvi icona e stili
    const IconComponent = BoardIcons[icon] ?? BookOpen;
    const cardClasses = themeCardStyles[theme] ?? themeCardStyles.blue;

    /**
     * Handler per il click sul pulsante modifica.
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

                {/* Pulsante modifica */}
                <button
                    onClick={handleEditClick}
                    className="p-1.5 rounded-full hover:bg-white/60 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 outline-none"
                    aria-label={`Modifica categorie di ${title}`}
                >
                    <MoreVertical className="w-5 h-5 opacity-60" />
                </button>
            </div>

            {/* Lista categorie */}
            <CategoryBadgeList categories={categories} />
        </div>
    );
}

/**
 * Lista di badge per le categorie.
 */
function CategoryBadgeList({ categories }: { categories: Category[] }): React.ReactElement {
    if (categories.length === 0) {
        return (
            <p className="text-sm text-slate-400 italic">
                Nessuna categoria
            </p>
        );
    }

    return (
        <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
                <span
                    key={category.id}
                    className={`
                        ${getCategoryColorClass(category.color)} 
                        flex items-center gap-2 backdrop-blur-sm text-xs font-medium 
                        px-2 py-1 rounded-md shadow-sm border border-white/10
                    `}
                >
                    {category.name}
                </span>
            ))}
        </div>
    );
}