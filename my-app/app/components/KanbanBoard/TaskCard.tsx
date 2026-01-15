'use client';

import React from 'react';
import {
    MoreHorizontal,
    MessageSquare,
    Paperclip,
    Clock,
    AlertCircle,
    CalendarDays
} from 'lucide-react';
import { Task } from '@/app/types/Task';
import { getPriorityStyles } from '@/public/Priority';
import { themeCategoryOptions } from '@/public/Category';

interface TaskCardProps {
    task: Task;
    isDragging: boolean;
    onDragStart: (e: React.DragEvent, taskId: string) => void;
    onClick: (task: Task) => void;
}

export default function TaskCard({ task, isDragging, onDragStart, onClick }: TaskCardProps) {

    // Logica helper per colore data
    const getDateInfo = (dateObj: Date | string, priority: string) => {
        const dueDate = new Date(dateObj);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const due = new Date(dueDate);
        due.setHours(0, 0, 0, 0);

        if (due < today) return { color: 'text-red-600 font-bold', icon: AlertCircle };
        if (due.getTime() === today.getTime()) return { color: 'text-amber-600 font-bold', icon: CalendarDays };
        if (priority === 'Urgente') return { color: 'text-orange-500 font-bold', icon: AlertCircle };
        return { color: 'text-slate-400', icon: Clock };
    };

    const { color: dateColor, icon: DateIcon } = getDateInfo(task.dueDate, task.priority);

    return (
        <div
            draggable
            onDragStart={(e) => onDragStart(e, task._id!)}
            onClick={() => onClick(task)}
            className={`
                group bg-white p-4 rounded-xl shadow-sm border border-slate-100 cursor-pointer hover:shadow-md transition-all relative
                active:scale-[0.98] 
                ${isDragging ? 'opacity-40 ring-2 ring-blue-400 ring-dashed grayscale' : ''}
            `}
        >
            {/* Header: Priorità e Menu */}
            <div className="flex justify-between items-start mb-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${getPriorityStyles(task.priority)}`}>
                    {task.priority}
                </span>
                <button
                    onClick={(e) => e.stopPropagation()}
                    className="text-slate-300 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <MoreHorizontal className="w-4 h-4" />
                </button>
            </div>

            {/* Titolo e Descrizione */}
            <h4 className="text-sm font-bold text-slate-800 leading-snug mb-1">
                {task.title}
            </h4>
            {task.description && (
                <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                    {task.description}
                </p>
            )}

            {/* Lista Categorie (Array) */}
            <div className="flex flex-wrap gap-1 mb-3">
                {task.categories.map((cat) => (
                    <span
                        key={cat.id}
                        className={`inline-block px-2 py-0.5 text-[10px] font-medium rounded border border-slate-200 ${themeCategoryOptions.find(opt => opt.value === cat.color)?.class}`}
                    >
                        {cat.name}
                    </span>
                ))}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-slate-50 pt-3 mt-2">
                <div className={`flex items-center gap-1.5 text-xs font-medium ${dateColor}`}>
                    <DateIcon className="w-3.5 h-3.5" />
                    <span>
                        {task.dueDate instanceof Date
                            ? task.dueDate.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' })
                            : task.dueDate}
                    </span>
                </div>

                <div className="flex items-center gap-3 text-slate-400">
                    {(task.comments > 0) && (
                        <div className="flex items-center gap-1 text-xs">
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>{task.comments}</span>
                        </div>
                    )}
                    {(task.attachments > 0) && (
                        <div className="flex items-center gap-1 text-xs">
                            <Paperclip className="w-3.5 h-3.5" />
                            <span>{task.attachments}</span>
                        </div>
                    )}
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 text-[9px] text-white flex items-center justify-center font-bold">
                        M
                    </div>
                </div>
            </div>
        </div>
    );
}