'use client';

import React from 'react';
import { BookOpen, Plus } from 'lucide-react';
import { CategoryData, CategoryColor } from './EditCategoryDialog';
import {BoardTheme} from "@/app/components/BoardCard";

interface CategoryBoardCardProps {
    boardName: string;
    categories: CategoryData[];
    onEditCategory: (category: CategoryData) => void;
    onAddCategory?: () => void; // Opzionale: per aggiungere nuove categorie
    theme: BoardTheme;

}

// Mappa stili CSS per i badge (sfondo pastello + testo scuro per leggibilità, come nella foto)
const colorStyles: Record<CategoryColor, string> = {
    slate:  'bg-slate-200 text-slate-700 hover:bg-slate-300',
    red:    'bg-red-200 text-red-800 hover:bg-red-300',
    orange: 'bg-orange-200 text-orange-800 hover:bg-orange-300',
    amber:  'bg-amber-200 text-amber-800 hover:bg-amber-300',
    green:  'bg-emerald-200 text-emerald-800 hover:bg-emerald-300',
    blue:   'bg-blue-200 text-blue-800 hover:bg-blue-300',
    indigo: 'bg-indigo-200 text-indigo-800 hover:bg-indigo-300',
    purple: 'bg-purple-200 text-purple-800 hover:bg-purple-300',
    pink:   'bg-pink-200 text-pink-800 hover:bg-pink-300',
};

const themeStyles: Record<BoardTheme, string> = {
    blue: 'bg-blue-50 border-blue-200 hover:border-blue-300 text-blue-900',
    green: 'bg-green-50 border-green-200 hover:border-green-300 text-green-900',
    purple: 'bg-purple-50 border-purple-200 hover:border-purple-300 text-purple-900',
    orange: 'bg-orange-50 border-orange-200 hover:border-orange-300 text-orange-900',
};



export default function CategoryBoardCard({ boardName, categories, onEditCategory, onAddCategory, theme }: CategoryBoardCardProps) {
    const baseClasses = themeStyles[theme] || themeStyles.blue;

    return (
        <div className={`${baseClasses} rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow`}>

            {/* Header Card */}
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                    <BookOpen className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">{boardName}</h2>
            </div>

            {/* Lista Categorie (Pills) */}
            <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => onEditCategory(cat)}
                        className={`
              px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95
              ${colorStyles[cat.color]}
            `}
                    >
                        {cat.name}
                    </button>
                ))}

                {/* Bottone "Aggiungi" (piccolo plus tratteggiato) */}
                <button
                    onClick={onAddCategory}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium border border-dashed border-slate-300 text-slate-400 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-all flex items-center gap-1"
                >
                    <Plus className="w-3.5 h-3.5" />
                    Nuova
                </button>
            </div>
        </div>
    );
}