/**
 * @fileoverview Componente card per visualizzare un task nella Kanban board.
 *
 * Supporta drag & drop e mostra informazioni riassuntive del task.
 *
 * @module components/KanbanBoard/TaskCard
 */

'use client';

import React from 'react';
import {
    MessageSquare,
    Paperclip,
    Clock,
    AlertCircle,
    CalendarDays,
    LucideIcon,
} from 'lucide-react';
import { Task } from '@/items/Task';
import { getPriorityStyles, PriorityLevel } from '@/items/Priority';
import { themeCategoryOptions } from '@/items/Category';

/**
 * Props del componente TaskCard.
 */
interface TaskCardProps {
    /** Dati del task da visualizzare */
    task: Task;
    /** Indica se il task è in fase di drag */
    isDragging?: boolean;
    /** Handler per l'inizio del drag */
    onDragStart?: (e: React.DragEvent, taskId: string) => void;
    /** Handler per il click sulla card */
    onClick: (task: Task) => void;
}

/**
 * Risultato dell'analisi della data di scadenza.
 */
interface DateInfo {
    colorClass: string;
    Icon: LucideIcon;
}

/**
 * Analizza la data di scadenza e restituisce informazioni di styling.
 *
 * Logica:
 * - Scaduto: rosso con icona alert
 * - Oggi: ambra con icona calendario
 * - Urgente: arancione con icona alert
 * - Default: grigio con icona clock
 */
function getDateDisplayInfo(dueDate: Date | string | undefined, priority: PriorityLevel): DateInfo {
    if (!dueDate) {
        return { colorClass: 'text-slate-400', Icon: Clock };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);

    // Scaduto
    if (due < today) {
        return { colorClass: 'text-red-600 font-bold', Icon: AlertCircle };
    }

    // Oggi
    if (due.getTime() === today.getTime()) {
        return { colorClass: 'text-amber-600 font-bold', Icon: CalendarDays };
    }

    // Urgente
    if (priority === 'Urgente') {
        return { colorClass: 'text-orange-500 font-bold', Icon: AlertCircle };
    }

    // Default
    return { colorClass: 'text-slate-400', Icon: Clock };
}

/**
 * Formatta una data nel formato italiano breve (dd/mm).
 */
function formatDateShort(date: Date | string): string {
    return new Date(date).toLocaleDateString('it-IT', {
        day: '2-digit',
        month: '2-digit'
    });
}

/**
 * Ottiene le iniziali di un assegnatario.
 */
function getAssigneeInitials(task: Task): string {
    if (task.assignees.length === 0) {
        return 'NN';
    }

    const first = task.assignees[0];
    return `${first.name.charAt(0)}${first.surname.charAt(0)}`.toUpperCase();
}

/**
 * Cerca la classe CSS per un colore di categoria.
 */
function getCategoryClass(color: string): string {
    const option = themeCategoryOptions.find(opt => opt.value === color);
    return option?.class ?? 'bg-slate-200 text-slate-800';
}

/**
 * Card per visualizzare un task nella Kanban board.
 *
 * Caratteristiche:
 * - Drag & drop supportato
 * - Badge priorità
 * - Lista categorie
 * - Indicatori per commenti e allegati
 * - Avatar assegnatario
 */
export default function TaskCard({
                                     task,
                                     isDragging = false,
                                     onDragStart,
                                     onClick
                                 }: TaskCardProps) {
    const dateInfo = getDateDisplayInfo(task.dueDate, task.priority);
    const DateIcon = dateInfo.Icon;

    return (
        <div
            draggable={!!onDragStart}
            onDragStart={(e) => onDragStart?.(e, task.id)}
            onClick={() => onClick(task)}
            className={`
                group bg-white p-4 rounded-xl shadow-sm border border-slate-100 
                cursor-pointer hover:shadow-md transition-all relative active:scale-[0.98]
                ${isDragging ? 'opacity-40 ring-2 ring-blue-400 ring-dashed grayscale' : ''}
            `}
        >
            {/* Header: Badge Priorità */}
            <div className="flex justify-between items-start mb-2">
                <span className={`
                    text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider
                    ${getPriorityStyles(task.priority)}
                `}>
                    {task.priority}
                </span>
            </div>

            {/* Titolo */}
            <h4 className="text-sm font-bold text-slate-800 leading-snug mb-1">
                {task.title}
            </h4>

            {/* Descrizione (troncata) */}
            {task.description && (
                <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                    {task.description}
                </p>
            )}

            {/* Categorie */}
            {task.categories.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                    {task.categories.map((cat) => (
                        <span
                            key={cat.id}
                            className={`
                                inline-block px-2 py-0.5 text-[10px] font-medium 
                                rounded border border-slate-200 ${getCategoryClass(cat.color)}
                            `}
                        >
                            {cat.name}
                        </span>
                    ))}
                </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-slate-50 pt-3 mt-2">
                {/* Data scadenza */}
                <div className={`flex items-center gap-1.5 text-xs font-medium ${dateInfo.colorClass}`}>
                    <DateIcon className="w-3.5 h-3.5" />
                    <span>
                        {task.dueDate ? formatDateShort(task.dueDate) : 'No date'}
                    </span>
                </div>

                {/* Indicatori e Avatar */}
                <div className="flex items-center gap-3 text-slate-400">
                    {task.comments > 0 && (
                        <div className="flex items-center gap-1 text-xs">
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>{task.comments}</span>
                        </div>
                    )}

                    {task.attachments > 0 && (
                        <div className="flex items-center gap-1 text-xs">
                            <Paperclip className="w-3.5 h-3.5" />
                            <span>{task.attachments}</span>
                        </div>
                    )}

                    <div className="
                        w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500
                        text-[9px] text-white flex items-center justify-center font-bold
                    ">
                        {getAssigneeInitials(task)}
                    </div>
                </div>
            </div>
        </div>
    );
}