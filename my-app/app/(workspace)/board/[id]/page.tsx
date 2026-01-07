'use client';

import React, { useState, useMemo, useEffect, use } from 'react';
import { Task, ColumnId, ColumnData } from '@/public/Task';
import { getPriorityStyles } from '@/public/Priority';
import { themeCategoryOptions } from '@/public/Category';
import { initialTasks, initialBoards } from '@/public/datas';
import { getBoardFromId } from '@/public/Board';
import {
    Plus,
    Search,
    Filter,
    MoreHorizontal,
    MessageSquare,
    Paperclip,
    Clock,
    AlertCircle
} from 'lucide-react';



const columnsConfig: ColumnData[] = [
    { id: 'todo', title: 'Da Fare', color: 'bg-blue-500/50' },
    { id: 'inprogress', title: 'In Corso', color: 'bg-green-500/50 ' },
    { id: 'done', title: 'Completato', color: 'bg-orange-500/50 ' },
];


export default function BoardPage({ params }: { params: Promise<{ id: string }> }) {

    const { id } = use(params);

    const [tasks, setTasks] = useState<Task[]>([]);
    const [boardTitle, setBoardTitle] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

    const board = getBoardFromId(initialBoards, id); // Ottieni i dati della bacheca in base all'ID

    useEffect(() => {
        const initialData = initialTasks[id] || [];
        setTasks(initialData);
        setBoardTitle(board ? board.title : 'Board Non Trovata');
    }, [id]);

    const filteredTasks = useMemo(() => {
        return tasks.filter(t =>
            t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.category.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [tasks, searchQuery]);

    const handleDragStart = (e: React.DragEvent, taskId: string) => {
        setDraggedTaskId(taskId);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent, targetColumn: ColumnId) => {
        e.preventDefault();
        if (!draggedTaskId) return;

        setTasks(prev => prev.map(task => {
            if (task.id === draggedTaskId) {
                return { ...task, columnId: targetColumn };
            }
            return task;
        }));
        setDraggedTaskId(null);
    };

    return (
        <div className="h-full flex flex-col p-6 lg:p-8 bg-slate-50 overflow-hidden">

            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 flex-none">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{boardTitle}</h1>
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-600 text-xs font-semibold">
                Privata
             </span>
                    </div>
                    <p className="text-slate-500 mt-1 text-sm">Gestisci le attività trascinandole tra le colonne.</p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Ricerca */}
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Cerca task..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                        />
                    </div>

                    <button className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition-colors">
                        <Filter className="w-5 h-5" />
                    </button>

                    <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20">
                        <Plus className="w-4 h-4" />
                        <span className="hidden sm:inline">Nuovo Task</span>
                    </button>
                </div>
            </div>

            {/* KANBAN */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden">
                {/* MODIFICA 1: Aggiunto 'w-full' e mantenuto min-w per mobile */}
                <div className="flex h-full gap-4 min-w-[900px] w-full">
                    {columnsConfig.map((col) => {
                        const colTasks = filteredTasks.filter(t => t.columnId === col.id);

                        return (
                            <div
                                key={col.id}
                                className="flex-1 flex flex-col min-w-[280px] h-full"
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, col.id)}
                            >
                                <div className="flex items-center justify-between mb-4 px-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wide">{col.title}</h3>
                                        <span className="bg-slate-200 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full">
                         {colTasks.length}
                       </span>
                                    </div>
                                    <div className={`h-1.5 w-1.5 rounded-full ${col.color}`}></div>
                                </div>

                                <div className={`flex-1 ${col.color} rounded-2xl border border-slate-200/60 p-3 overflow-y-auto space-y-3 custom-scrollbar`}>
                                    {colTasks.length === 0 ? (
                                        <div className="h-24 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-400 text-xs italic">
                                            Nessun task qui
                                        </div>
                                    ) : (
                                        colTasks.map(task => (
                                            <div
                                                key={task.id}
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, task.id)}
                                                className={`
                               group bg-white p-4 rounded-xl shadow-sm border border-slate-100 cursor-grab active:cursor-grabbing hover:shadow-md transition-all relative
                               ${draggedTaskId === task.id ? 'opacity-40 ring-2 ring-blue-400 ring-dashed grayscale' : ''}
                             `}
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                 <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${getPriorityStyles(task.priority)}`}>
                                    {task.priority}
                                 </span>
                                                    <button className="text-slate-300 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <MoreHorizontal className="w-4 h-4" />
                                                    </button>
                                                </div>

                                                <h4 className="text-sm font-bold text-slate-800 leading-snug mb-1">
                                                    {task.title}
                                                </h4>
                                                {task.description && (
                                                    <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                                                        {task.description}
                                                    </p>
                                                )}

                                                <div className="mb-3">
                                 <span className={`inline-block px-2 py-0.5 text-[10px] font-medium rounded border border-slate-200 ${themeCategoryOptions.find(cat => cat.value === task.category.color)?.class}`}>
                                    {task.category.name}
                                 </span>
                                                </div>

                                                <div className="flex items-center justify-between border-t border-slate-50 pt-3 mt-2">
                                                    <div className={`flex items-center gap-1.5 text-xs font-medium ${task.priority === 'Urgente' ? 'text-red-500' : 'text-slate-400'}`}>
                                                        {task.priority === 'Urgente' ? <AlertCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                                                        <span>{task.dueDate}</span>
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
                                        ))
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}