'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface SidebarBoardItemProps {
    id: number | string; // Supporta sia ID numerici che stringhe
    name: string;
    color: string;       // Es. 'bg-blue-500'
}

export default function SidebarBoardItem({ id, name, color}: SidebarBoardItemProps) {
    return (
        <Link
            href={`/board/${id}`}
            className="group flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors"
        >
            {/* Indicatore Colore */}
            <span className={`w-2.5 h-2.5 rounded-full mr-3 ${color} shrink-0`}></span>

            {/* Nome Bacheca */}
            <span className="truncate flex-1">{name}</span>

            {/* Freccia che appare solo in hover */}
            <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 text-gray-400 transition-opacity" />
        </Link>
    );
}