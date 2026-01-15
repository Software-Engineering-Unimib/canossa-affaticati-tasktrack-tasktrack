'use client';

import React, { useState, useMemo, useEffect, use } from 'react';
import {
    Plus,
    Search,
    Filter,
    Check
} from 'lucide-react';

// Importazione Tipi e Dati
import { Task, ColumnId, ColumnData } from '@/app/types/Task';
import { PriorityLevel } from '@/public/Priority';
import { initialBoards } from '@/public/datas';
import { getBoardFromId } from '@/public/Board';

// Importazione Componenti Custom
import TaskCard from '@/app/components/KanbanBoard/TaskCard';
import EditTaskDialog from '@/app/components/KanbanBoard/EditTaskDialog';
import CreateTaskDialog from '@/app/components/KanbanBoard/CreateTaskDialog';

// Configurazione Colonne Kanban
const columnsConfig: ColumnData[] = [
    { id: 'todo', title: 'Da Fare', color: 'bg-blue-500/50' },
    { id: 'inprogress', title: 'In Corso', color: 'bg-green-500/50 ' },
    { id: 'done', title: 'Completato', color: 'bg-orange-500/50 ' },
];

const allPriorities: PriorityLevel[] = ['Bassa', 'Media', 'Alta', 'Urgente'];

// Mappa per l'ordinamento: 0 è la priorità massima
const priorityOrder: Record<string, number> = {
    'Urgente': 0,
    'Alta': 1,
    'Media': 2,
    'Bassa': 3
};

export default function BoardPage({ params }: { params: Promise<{ id: string }> }) {

    // 1. Spacchettamento ID (Next.js 15)
    const { id } = use(params);

    // --- STATI DATI ---
    const [tasks, setTasks] = useState<Task[]>([]);
    const [boardTitle, setBoardTitle] = useState('');

    // --- STATI UI & INTERAZIONE ---
    const [searchQuery, setSearchQuery] = useState('');
    const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // --- STATI FILTRI ---
    const [selectedPriorities, setSelectedPriorities] = useState<PriorityLevel[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

    // --- STATI MODIFICA/CREAZIONE TASK ---
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [isEditTaskOpen, setIsEditTaskOpen] = useState(false);
    const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);

    // Recupero info board corrente
    const board = getBoardFromId(initialBoards, id);

    // Caricamento Dati Iniziali
    useEffect(() => {
    setBoardTitle(board ? board.title : 'Board Non Trovata');
    
    const fetchTasks = async () => {
        try {
            const response = await fetch(`/api/boards/${id}/tasks`);
            const data = await response.json();

            // Controllo di sicurezza: se data è un array, lo imposti. 
            // Altrimenti imposti un array vuoto per evitare il crash di .filter()
            if (Array.isArray(data)) {
                setTasks(data);
            } else {
                console.error("I dati ricevuti non sono un array:", data);
                setTasks([]); 
            }
        } catch (error) {
            console.error("Errore nel recupero dei task:", error);
            setTasks([]);
        }
    };

    fetchTasks();
}, [id, board]);

    // --- LOGICA FILTRAGGIO ---
    const filteredTasks = useMemo(() => {
        return tasks.filter(t => {
            // 1. Filtro Testuale (Titolo o Nome di UNA delle categorie)
            const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                t.categories.some(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

            // 2. Filtro Priorità
            const matchesPriority = selectedPriorities.length === 0 || selectedPriorities.includes(t.priority);

            // 3. Filtro Categoria (ID) - Verifica se il task ha almeno una delle categorie selezionate
            const matchesCategory = selectedCategories.length === 0 ||
                t.categories.some(c => selectedCategories.includes(c.id.toString()));

            return matchesSearch && matchesPriority && matchesCategory;
        });
    }, [tasks, searchQuery, selectedPriorities, selectedCategories]);

    // --- HANDLERS FILTRI ---
    const togglePriority = (priority: PriorityLevel) => {
        setSelectedPriorities(prev =>
            prev.includes(priority) ? prev.filter(p => p !== priority) : [...prev, priority]
        );
    };

    const toggleCategory = (catId: string) => {
        setSelectedCategories(prev =>
            prev.includes(catId) ? prev.filter(c => c !== catId) : [...prev, catId]
        );
    };

    const clearFilters = () => {
        setSelectedPriorities([]);
        setSelectedCategories([]);
        setSearchQuery('');
        setIsFilterOpen(false);
    };

    // --- HANDLERS DRAG & DROP ---
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
            if (task._id === draggedTaskId) {
                return { ...task, columnId: targetColumn };
            }
            return task;
        }));
        setDraggedTaskId(null);
    };

    // --- HANDLERS GESTIONE TASK ---

    // Apertura Modifica
    const handleTaskClick = (task: Task) => {
        setEditingTask(task);
        setIsEditTaskOpen(true);
    };

    // Salvataggio Modifica
    const handleSaveTask = (updatedTask: Task) => {
        setTasks(prev => prev.map(t => t._id === updatedTask._id ? updatedTask : t));
    };

    // Eliminazione
    const handleDeleteTask = (taskId: string) => {
        setTasks(prev => prev.filter(t => t._id !== taskId));
    };

    // Creazione Nuovo Task
    const handleCreateTask = (newTask: Task) => {
        setTasks(prev => [newTask, ...prev]);
    };

    // Conta filtri attivi per badge UI
    const activeFiltersCount = selectedPriorities.length + selectedCategories.length;

    return (
        <div
            className="h-full flex flex-col p-6 lg:p-8 bg-slate-50 overflow-hidden"
            onClick={() => setIsFilterOpen(false)} // Chiude menu filtri cliccando fuori
        >

            {/* HEADER BOARD */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 flex-none relative z-20">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{boardTitle}</h1>
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-600 text-xs font-semibold">
                            Privata
                        </span>
                    </div>
                    <p className="text-slate-500 mt-1 text-sm">Gestisci le attività trascinandole tra le colonne.</p>
                </div>

                <div className="flex items-center gap-3 relative">
                    {/* Barra Ricerca */}
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

                    {/* Tasto Filtro & Dropdown */}
                    <div className="relative">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsFilterOpen(!isFilterOpen);
                            }}
                            className={`p-2 border rounded-xl transition-colors relative flex items-center justify-center
                                ${activeFiltersCount > 0 || isFilterOpen ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'}
                            `}
                        >
                            <Filter className="w-5 h-5" />
                            {activeFiltersCount > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] text-white font-bold">
                                    {activeFiltersCount}
                                </span>
                            )}
                        </button>

                        {isFilterOpen && (
                            <div
                                className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-100 p-4 z-50 animate-in fade-in zoom-in-95 duration-200"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-50">
                                    <h3 className="font-bold text-sm text-slate-800">Filtra per</h3>
                                    {(activeFiltersCount > 0 || searchQuery) && (
                                        <button
                                            onClick={clearFilters}
                                            className="text-xs text-red-500 hover:text-red-700 font-medium"
                                        >
                                            Resetta tutto
                                        </button>
                                    )}
                                </div>

                                {/* Sezione Priorità */}
                                <div className="mb-4">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Priorità</label>
                                    <div className="space-y-2">
                                        {allPriorities.map((p) => (
                                            <label key={p} className="flex items-center gap-2 cursor-pointer group">
                                                <div className={`
                                                    w-4 h-4 rounded border flex items-center justify-center transition-colors
                                                    ${selectedPriorities.includes(p) ? 'bg-blue-600 border-blue-600' : 'border-slate-300 bg-white group-hover:border-blue-400'}
                                                `}>
                                                    {selectedPriorities.includes(p) && <Check className="w-3 h-3 text-white" />}
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    className="hidden"
                                                    checked={selectedPriorities.includes(p)}
                                                    onChange={() => togglePriority(p)}
                                                />
                                                <span className="text-sm text-slate-700">{p}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Sezione Categorie */}
                                {board && board.categories.length > 0 && (
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Categorie</label>
                                        <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                                            {board.categories.map((cat) => (
                                                <label key={cat.id} className="flex items-center gap-2 cursor-pointer group">
                                                    <div className={`
                                                        w-4 h-4 rounded border flex items-center justify-center transition-colors
                                                        ${selectedCategories.includes(cat.id.toString()) ? 'bg-blue-600 border-blue-600' : 'border-slate-300 bg-white group-hover:border-blue-400'}
                                                    `}>
                                                        {selectedCategories.includes(cat.id.toString()) && <Check className="w-3 h-3 text-white" />}
                                                    </div>
                                                    <input
                                                        type="checkbox"
                                                        className="hidden"
                                                        checked={selectedCategories.includes(cat.id.toString())}
                                                        onChange={() => toggleCategory(cat.id.toString())}
                                                    />
                                                    <span className="text-sm text-slate-700 truncate">{cat.name}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Bottone Nuovo Task */}
                    <button
                        onClick={() => setIsCreateTaskOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20"
                    >
                        <Plus className="w-4 h-4" />
                        <span className="hidden sm:inline">Nuovo Task</span>
                    </button>
                </div>
            </div>

            {/* AREA KANBAN */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden">
                <div className="flex h-full gap-4 min-w-[900px] w-full">
                    {columnsConfig.map((col) => {
                        // 1. Filtra per colonna
                        const colTasks = filteredTasks.filter(t => t.columnId === col.id);

                        // 2. Ordina: Priorità (Desc) -> Data Scadenza (Asc)
                        const sortedColTasks = colTasks.sort((a, b) => {
                            const valA = priorityOrder[a.priority] ?? 99;
                            const valB = priorityOrder[b.priority] ?? 99;

                            if (valA !== valB) {
                                return valA - valB;
                            }

                            // Gestisce date sia come oggetti Date che come stringhe
                            const dateA = a.dueDate instanceof Date ? a.dueDate.getTime() : new Date(a.dueDate).getTime();
                            const dateB = b.dueDate instanceof Date ? b.dueDate.getTime() : new Date(b.dueDate).getTime();

                            return dateA - dateB;
                        });

                        return (
                            <div
                                key={col.id}
                                className="flex-1 flex flex-col min-w-[280px] h-full"
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, col.id)}
                            >
                                {/* Header Colonna */}
                                <div className="flex items-center justify-between mb-4 px-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wide">{col.title}</h3>
                                        <span className="bg-slate-200 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full">
                                            {sortedColTasks.length}
                                        </span>
                                    </div>
                                    <div className={`h-1.5 w-1.5 rounded-full ${col.color}`}></div>
                                </div>

                                {/* Lista Task Droppable */}
                                <div className={`flex-1 ${col.color} rounded-2xl border border-slate-200/60 p-3 overflow-y-auto space-y-3 custom-scrollbar`}>
                                    {sortedColTasks.length === 0 ? (
                                        <div className="h-24 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-400 text-xs italic">
                                            {filteredTasks.length === 0 && tasks.length > 0 ? "Nessun risultato dai filtri" : "Nessun task qui"}
                                        </div>
                                    ) : (
                                        sortedColTasks.map(task => (
                                            <TaskCard
                                                key={task._id}
                                                task={task}
                                                isDragging={draggedTaskId === task._id}
                                                onDragStart={handleDragStart}
                                                onClick={handleTaskClick}
                                            />
                                        ))
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* MODALE DI MODIFICA TASK */}
            <EditTaskDialog
                isOpen={isEditTaskOpen}
                task={editingTask}
                boardCategories={board ? board.categories : []}
                onClose={() => setIsEditTaskOpen(false)}
                onSave={handleSaveTask}
                onDelete={handleDeleteTask}
            />

            {/* MODALE DI CREAZIONE TASK */}
            <CreateTaskDialog
                isOpen={isCreateTaskOpen}
                boardId={id}
                boardCategories={board ? board.categories : []}
                onClose={() => setIsCreateTaskOpen(false)}
                onCreate={handleCreateTask}
            />

        </div>
    );
}