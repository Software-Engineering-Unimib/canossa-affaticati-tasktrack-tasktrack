'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
    MoreVertical,
    BookOpen
} from 'lucide-react';
import {categoryBoardIcons, BoardCategory} from "@/public/BoardCategory";
import {BoardStats, themeCardStyles, BoardTheme} from "@/public/Board";

export interface BoardCardProps {
    id: string | number;
    title: string;
    category: BoardCategory;
    theme: BoardTheme;
    stats: BoardStats;
    onEdit: () => void; // Funzione scatenata al click su Modifica
}


// --- COMPONENTE BOARD CARD ---
export default function BoardCard({
                                      id,
                                      title,
                                      category,
                                      theme,
                                      stats,
                                      onEdit,
                                  }: BoardCardProps) {

    const [isMenuOpen, setIsMenuOpen] = useState(false); // Stato per gestire l'apertura del menu di modifica ed eliminazione
    const Icon = categoryBoardIcons[category] || BookOpen; //Prende da BoardCategory.tsx l'icona in base alla categoria
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

            {/*  CORPO CARD (Cliccabile -> Va alla Board) */}
            <Link href={`/board/${id}`} className="block space-y-3 relative z-10">

                {/* Indicatore SCADENZE */}
                <div className="flex items-center gap-3 text-sm font-medium">
                    {stats.deadlines > 0 ? (
                        <>
                            <div className="w-3.5 h-3.5 rounded-full bg-red-500 shadow-sm shrink-0 animate-pulse" />
                            <span className="text-slate-700">
                <span className="font-bold text-red-600">{stats.deadlines}</span> Scadenze oggi
              </span>
                        </>
                    ) : (
                        <>
                            <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-400/50 shrink-0" />
                            <span className="text-slate-500">Nessuna scadenza</span>
                        </>
                    )}
                </div>

                {/* Indicatore IN CORSO */}
                <div className="flex items-center gap-3 text-sm font-medium">
                    <div className={`w-3.5 h-3.5 rounded-full shadow-sm shrink-0 ${stats.inProgress > 0 ? 'bg-amber-400' : 'border-2 border-slate-400/50 bg-transparent'}`} />
                    <span className={stats.inProgress > 0 ? 'text-slate-700' : 'text-slate-500'}>
                <span className="font-bold">{stats.inProgress}</span> In corso
            </span>
                </div>

                {/* Indicatore COMPLETATI */}
                <div className="flex items-center gap-3 text-sm font-medium">
                    <div className={`w-3.5 h-3.5 rounded-full shadow-sm shrink-0 ${stats.completed > 0 ? 'bg-emerald-500' : 'border-2 border-slate-400/50 bg-transparent'}`} />
                    <span className={stats.completed > 0 ? 'text-slate-700' : 'text-slate-500'}>
                <span className="font-bold">{stats.completed}</span> Completati
            </span>
                </div>

            </Link>
        </div>
    );
}