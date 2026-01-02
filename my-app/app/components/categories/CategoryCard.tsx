'use client';

import React, { useState } from 'react';
import {
    MoreVertical,
    BookOpen,
} from 'lucide-react';
import {BoardIcons, Icon} from "@/public/BoardIcon";
import {themeCardStyles, BoardTheme} from "@/public/Board";
import { Category } from '@/public/Category';

export interface CategoryCardProps {
    id: string | number;
    title: string;
    theme: BoardTheme;
    categories: Category[];
    icon: Icon
    onEdit: () => void; // Funzione scatenata al click su Modifica
}


// --- COMPONENTE BOARD CARD ---
export default function CategoryCard({
                                      id,
                                      title,
                                      icon,
                                      theme,
                                      categories,
                                      onEdit
                                    }: CategoryCardProps) {

    const [isMenuOpen, setIsMenuOpen] = useState(false); // Stato per gestire l'apertura del menu di modifica ed eliminazione
    const Icon = BoardIcons[icon] || BookOpen; //Prende da BoardCategory.tsx l'icona in base alla categoria
    const baseClasses = themeCardStyles[theme] || themeCardStyles.blue; // Prende da Board.tsx gli stili in base al tema scelto per la board
    
    // Handler per chiudere il menu se si clicca fuori (overlay invisibile)
    const closeMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsMenuOpen(false);
    };

    return (
        <div className={`relative group rounded-2xl p-5 transition-all duration-200 border shadow-sm hover:shadow-md ${baseClasses}`}>

            {/* HEADER CARD (Titolo + Icona + Menu Dropdown) */}
            <div className="flex items-start justify-between mb-4 relative z-20">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/60 rounded-lg backdrop-blur-sm shadow-sm">
                        <Icon className="w-5 h-5 opacity-80" />
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
            <div className="mt-auto flex flex-wrap gap-2">
                {categories.map((category) => (
                    <span 
                        key={category.id} 
                        className={`${category.color} flex items-center gap-2 backdrop-blur-sm text-xs strong text-black font-medium px-2 py-1 rounded-md border-1`}
                    >
                        {category.name}
                    </span>
                ))}
            </div>
        </div>
    );
}