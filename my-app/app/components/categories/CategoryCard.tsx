'use client';

import React, { useState } from 'react';
import {
    MoreVertical,
    BookOpen,
} from 'lucide-react';
import { BoardIcons, Icon } from "@/items/BoardIcon";
import { themeCardStyles, BoardTheme } from "@/items/Board";
import { Category, getCategoryColorClass } from '@/items/Category'; // Importa l'interfaccia Category e le opzioni di tema

export interface CategoryCardProps {
    id: string | number;
    title: string;
    theme: BoardTheme;
    categories: Category[];
    icon: Icon;
    onEdit: () => void;
}

export default function CategoryCard({
                                         id,
                                         title,
                                         icon,
                                         theme,
                                         categories,
                                         onEdit
                                     }: CategoryCardProps) {

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const IconComponent = BoardIcons[icon] || BookOpen; // Rinominato per convenzione React (PascalCase)
    const baseClasses = themeCardStyles[theme] || themeCardStyles.blue;

    const closeMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsMenuOpen(false);
    };


    return (
        <div className={`relative group rounded-2xl p-5 transition-all duration-200 border shadow-sm hover:shadow-md ${baseClasses}`}>

            {/* HEADER CARD */}
            <div className="flex items-start justify-between mb-4 relative z-20">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/60 rounded-lg backdrop-blur-sm shadow-sm">
                        <IconComponent className="w-5 h-5 opacity-80" />
                    </div>
                    <h3 className="font-bold text-lg leading-tight tracking-tight">
                        {title}
                    </h3>
                </div>

                {/* Pulsante Menu */}
                <div className="relative">
                    <button
                        onClick={(e) => {
                            closeMenu(e);
                            onEdit();
                        }}
                        className="p-1.5 rounded-full hover:bg-white/60 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 outline-none"
                    >
                        <MoreVertical className="w-5 h-5 opacity-60" />
                    </button>
                </div>
            </div>

            {/* LISTA CATEGORIE (Badge) */}
            <div className="mt-auto flex flex-wrap gap-2">
                {categories.map((category) => (
                    <span
                        key={category.id}
                        className={`${getCategoryColorClass(category.color)} flex items-center gap-2 backdrop-blur-sm text-xs font-medium px-2 py-1 rounded-md shadow-sm border border-white/10`}
                    >
                        {category.name}
                    </span>
                ))}
            </div>
        </div>
    );
}