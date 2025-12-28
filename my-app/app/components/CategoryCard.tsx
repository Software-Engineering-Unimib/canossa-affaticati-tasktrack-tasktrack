'use client';

import React, { useState } from 'react';
import { MoreVertical, CheckCircle2, ListTodo } from 'lucide-react';

interface CategoryStats {
  total: number;
  completed: number;
}

interface Category {
  id: string;
  name: string;
  color: string;
  description: string;
  stats: CategoryStats;
}

interface CategoryCardProps {
  category: Category;
  onEdit: (category: Category) => void;
}

// Mappa da colore Tailwind a tonalità light per il background
const colorToBgMap: Record<string, string> = {
  'bg-red-500': 'bg-red-50 border-red-200 hover:border-red-300',
  'bg-blue-500': 'bg-blue-50 border-blue-200 hover:border-blue-300',
  'bg-green-500': 'bg-green-50 border-green-200 hover:border-green-300',
  'bg-yellow-500': 'bg-yellow-50 border-yellow-200 hover:border-yellow-300',
  'bg-purple-500': 'bg-purple-50 border-purple-200 hover:border-purple-300',
  'bg-pink-500': 'bg-pink-50 border-pink-200 hover:border-pink-300',
  'bg-orange-500': 'bg-orange-50 border-orange-200 hover:border-orange-300',
  'bg-teal-500': 'bg-teal-50 border-teal-200 hover:border-teal-300',
};

export default function CategoryCard({
  category,
  onEdit,
}: CategoryCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Fallback per stats nel caso non esista
  const stats = category.stats || { total: 0, completed: 0 };

  const bgClasses = colorToBgMap[category.color] || colorToBgMap['bg-blue-500'];
  const colorClass = category.color;

  const closeMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMenuOpen(false);
  };

  return (
    <div
      className={`relative group rounded-2xl p-5 transition-all duration-200 border shadow-sm hover:shadow-md ${bgClasses}`}
    >
      {/* HEADER CARD (Nome + Menu Dropdown) */}
      <div className="flex items-start justify-between mb-4 relative z-20">
        <div className="flex items-center gap-3 flex-1">
          {/* Pallino colore */}
          <div className={`w-4 h-4 rounded-full ${colorClass} shadow-sm`}></div>
          <h3 className="font-bold text-lg leading-tight tracking-tight">
            {category.name}
          </h3>
        </div>

        {/* Pulsante Menu (Dropdown Trigger) */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              closeMenu(e);
              onEdit(category);
            }}
            className="p-1.5 rounded-full hover:bg-white/60 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 outline-none"
          >
            <MoreVertical className="w-5 h-5 opacity-60" />
          </button>
        </div>
      </div>

      {/* DESCRIPTION */}
      <p className="text-sm text-slate-600 line-clamp-2 mb-4">
        {category.description}
      </p>

      {/* STATS */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="flex items-center gap-2">
          <ListTodo className="w-4 h-4 text-slate-500" />
          <div>
            <p className="text-xs text-slate-600">Task totali</p>
            <p className="text-lg font-bold text-slate-900">{stats.total}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
          <div>
            <p className="text-xs text-slate-600">Completati</p>
            <p className="text-lg font-bold text-green-600">{stats.completed}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
