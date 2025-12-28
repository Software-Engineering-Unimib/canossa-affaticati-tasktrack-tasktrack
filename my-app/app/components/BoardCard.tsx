'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
    MoreVertical,
    BookOpen,
    Home,
    GraduationCap,
    Briefcase,
    LucideIcon,
} from 'lucide-react';
import {BoardCardProps, BoardCategory, BoardTheme} from "@/public/Board";
import {categoryIcons} from "@/public/Category";

// --- MAPPE DI STILE E ICONE ---
const themeStyles: Record<BoardTheme, string> = {
    blue: 'bg-blue-50 border-blue-200 hover:border-blue-300 text-blue-900',
    green: 'bg-green-50 border-green-200 hover:border-green-300 text-green-900',
    purple: 'bg-purple-50 border-purple-200 hover:border-purple-300 text-purple-900',
    orange: 'bg-orange-50 border-orange-200 hover:border-orange-300 text-orange-900',
};

// --- COMPONENTE BOARD CARD ---
export default function BoardCard({
                                      id,
                                      title,
                                      category,
                                      theme,
                                      stats,
                                      onEdit,
                                  }: BoardCardProps) {

    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const Icon = categoryIcons[category] || BookOpen;
    const baseClasses = themeStyles[theme] || themeStyles.blue;

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