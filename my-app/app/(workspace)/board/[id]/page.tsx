/**
 * @fileoverview Pagina Kanban Board per la gestione dei task.
 *
 * Funzionalità:
 * - Visualizzazione task in colonne (todo, inprogress, done)
 * - Drag & drop tra colonne
 * - Filtraggio per priorità e categoria
 * - Creazione/modifica/eliminazione task
 *
 * @module pages/board/[id]
 */

'use client';

import React, { useState, useMemo, useEffect, useCallback, use } from 'react';
import { Plus, Search, Filter, Check, Loader2 } from 'lucide-react';

import { Task, ColumnId, ColumnData, DEFAULT_COLUMNS } from '@/items/Task';
import { PriorityLevel } from '@/items/Priority';
import { BoardModel, TaskModel } from '@/models';
import { Board } from '@/items/Board';

import TaskCard from '@/app/components/KanbanBoard/TaskCard';
import TaskDialog from '@/app/components/KanbanBoard/TaskDialog';
import { useAuth } from '@/app/context/AuthContext';

/**
 * Configurazione delle colonne Kanban.
 */
const COLUMNS_CONFIG: readonly ColumnData[] = [
    { id: 'todo', title: 'Da Fare', color: 'bg-blue-500/50' },
    { id: 'inprogress', title: 'In Corso', color: 'bg-green-500/50' },
    { id: 'done', title: 'Completato', color: 'bg-orange-500/50' },
];

/**
 * Livelli di priorità disponibili per il filtro.
 */
const PRIORITY_LEVELS: readonly PriorityLevel[] = ['Bassa', 'Media', 'Alta', 'Urgente'];

/**
 * Mappa per l'ordinamento delle priorità (0 = massima).
 */
const PRIORITY_ORDER: Record<PriorityLevel, number> = {
    Urgente: 0,
    Alta: 1,
    Media: 2,
    Bassa: 3,
};

/**
 * Stato del dialog task.
 */
interface TaskDialogState {
    isOpen: boolean;
    mode: 'create' | 'edit';
    task: Task | null;
    columnId: ColumnId;
}

/**
 * Stato iniziale del dialog.
 */
const INITIAL_DIALOG_STATE: TaskDialogState = {
    isOpen: false,
    mode: 'create',
    task: null,
    columnId: 'todo',
};

/**
 * Props della pagina.
 */
interface BoardPageProps {
    params: Promise<{ id: string }>;
}

/**
 * Pagina Kanban Board.
 */
export default function BoardPage({ params }: BoardPageProps) {
    // Unwrap params (Next.js 15)
    const { id: boardId } = use(params);
    const { user } = useAuth();

    // ═══════════════════════════════════════════════════════════
    // STATO DATI
    // ═══════════════════════════════════════════════════════════

    const [tasks, setTasks] = useState<Task[]>([]);
    const [board, setBoard] = useState<Board | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // ═══════════════════════════════════════════════════════════
    // STATO UI
    // ════════════════��══════════════════════════════════════════

    const [searchQuery, setSearchQuery] = useState('');
    const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // ═══════════════════════════════════════════════════════════
    // STATO FILTRI
    // ═══════════════════════════════════════════════════════════

    const [selectedPriorities, setSelectedPriorities] = useState<PriorityLevel[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

    // ═══════════════════════════════════════════════════════════
    // STATO DIALOG
    // ═══════════════════════════════════════════════════════════

    const [dialogState, setDialogState] = useState<TaskDialogState>(INITIAL_DIALOG_STATE);

    // ═══════════════════════════════════════════════════════════
    // CARICAMENTO DATI
    // ═══════════════════════════════════════════════════════════

    /**
     * Carica board e task dal server.
     */
    const loadData = useCallback(async () => {
        if (!user || !boardId) return;

        try {
            const boardData = await BoardModel.getBoardById(boardId);
            setBoard(boardData);

            if (boardData) {
                const tasksData = await TaskModel.getTasksByBoardId(boardId);
                setTasks(tasksData);
            }
        } catch (error) {
            console.error('Errore caricamento board:', error);
        } finally {
            setIsLoading(false);
        }
    }, [boardId, user]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // ═══════════════════════════════════════════════════════════
    // FILTRAGGIO E ORDINAMENTO
    // ═══════════════════════════════════════════════════════════

    /**
     * Task filtrati per ricerca, priorità e categoria.
     */
    const filteredTasks = useMemo(() => {
        return tasks.filter(task => {
            // Filtro testuale
            const matchesSearch =
                task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                task.categories.some(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

            // Filtro priorità
            const matchesPriority =
                selectedPriorities.length === 0 ||
                selectedPriorities.includes(task.priority);

            // Filtro categoria
            const matchesCategory =
                selectedCategories.length === 0 ||
                task.categories.some(c => selectedCategories.includes(c.id.toString()));

            return matchesSearch && matchesPriority && matchesCategory;
        });
    }, [tasks, searchQuery, selectedPriorities, selectedCategories]);

    /**
     * Ordina i task per priorità (desc) e data (asc).
     */
    const sortTasks = useCallback((tasksToSort: Task[]): Task[] => {
        return [...tasksToSort].sort((a, b) => {
            const priorityA = PRIORITY_ORDER[a.priority] ?? 99;
            const priorityB = PRIORITY_ORDER[b.priority] ?? 99;

            if (priorityA !== priorityB) {
                return priorityA - priorityB;
            }

            const dateA = new Date(a.dueDate).getTime();
            const dateB = new Date(b.dueDate).getTime();
            return dateA - dateB;
        });
    }, []);

    /**
     * Ottiene i task filtrati e ordinati per una colonna.
     */
    const getColumnTasks = useCallback((columnId: ColumnId): Task[] => {
        const columnTasks = filteredTasks.filter(t => t.columnId === columnId);
        return sortTasks(columnTasks);
    }, [filteredTasks, sortTasks]);

    // ═══════════════════════════════════════════════════════════
    // HANDLERS FILTRI
    // ═══════════════════════════════════════════════════════════

    const togglePriority = useCallback((priority: PriorityLevel) => {
        setSelectedPriorities(prev =>
            prev.includes(priority)
                ? prev.filter(p => p !== priority)
                : [...prev, priority]
        );
    }, []);

    const toggleCategory = useCallback((categoryId: string) => {
        setSelectedCategories(prev =>
            prev.includes(categoryId)
                ? prev.filter(c => c !== categoryId)
                : [...prev, categoryId]
        );
    }, []);

    const clearFilters = useCallback(() => {
        setSelectedPriorities([]);
        setSelectedCategories([]);
        setSearchQuery('');
        setIsFilterOpen(false);
    }, []);

    const activeFiltersCount = selectedPriorities.length + selectedCategories.length;

    // ═══════════════════════════════════════════════════════════
    // HANDLERS DRAG & DROP
    // ═══════════════════════════════════════════════════════════

    const handleDragStart = useCallback((e: React.DragEvent, taskId: string) => {
        setDraggedTaskId(taskId);
        e.dataTransfer.effectAllowed = 'move';
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
    }, []);

    const handleDrop = useCallback(async (e: React.DragEvent, targetColumn: ColumnId) => {
        e.preventDefault();

        if (!draggedTaskId) return;

        // Update ottimistico
        setTasks(prev => prev.map(task =>
            task.id === draggedTaskId
                ? { ...task, columnId: targetColumn }
                : task
        ));

        // Update backend
        try {
            await TaskModel.updateTaskColumn(draggedTaskId, targetColumn);
        } catch (error) {
            console.error('Errore spostamento task:', error);
            loadData(); // Revert
        }

        setDraggedTaskId(null);
    }, [draggedTaskId, loadData]);

    // ═══════════════════════════════════════════════════════════
    // HANDLERS DIALOG
    // ═══════════════════════════════════════════════════════════

    const openCreateDialog = useCallback((columnId: ColumnId = 'todo') => {
        setDialogState({
            isOpen: true,
            mode: 'create',
            task: null,
            columnId,
        });
    }, []);

    const openEditDialog = useCallback((task: Task) => {
        setDialogState({
            isOpen: true,
            mode: 'edit',
            task,
            columnId: task.columnId,
        });
    }, []);

    const closeDialog = useCallback(() => {
        setDialogState(INITIAL_DIALOG_STATE);
    }, []);

    const handleSaveTask = useCallback(() => {
        loadData();
    }, [loadData]);

    const handleDeleteTask = useCallback(async (taskId: string) => {
        try {
            await TaskModel.deleteTask(taskId);
            setTasks(prev => prev.filter(t => t.id !== taskId));
        } catch (error) {
            console.error('Errore eliminazione task:', error);
        }
    }, []);

    // ═══════════════════════════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════════════════════════

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!board) {
        return (
            <div className="p-10 text-center text-slate-500">
                Bacheca non trovata.
            </div>
        );
    }

    return (
        <div
            className="h-full flex flex-col p-6 lg:p-8 bg-slate-50 overflow-hidden"
            onClick={() => setIsFilterOpen(false)}
        >
            {/* Header */}
            <BoardHeader
                title={board.title}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                activeFiltersCount={activeFiltersCount}
                isFilterOpen={isFilterOpen}
                onFilterToggle={() => setIsFilterOpen(prev => !prev)}
                onCreateClick={() => openCreateDialog('todo')}
            />

            {/* Filter Dropdown */}
            {isFilterOpen && (
                <FilterDropdown
                    priorities={PRIORITY_LEVELS}
                    selectedPriorities={selectedPriorities}
                    categories={board.categories}
                    selectedCategories={selectedCategories}
                    hasFilters={activeFiltersCount > 0 || !!searchQuery}
                    onTogglePriority={togglePriority}
                    onToggleCategory={toggleCategory}
                    onClear={clearFilters}
                />
            )}

            {/* Kanban Columns */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden mt-6">
                <div className="flex h-full gap-4 min-w-[900px] w-full">
                    {COLUMNS_CONFIG.map(column => (
                        <KanbanColumn
                            key={column.id}
                            column={column}
                            tasks={getColumnTasks(column.id)}
                            draggedTaskId={draggedTaskId}
                            hasFilters={filteredTasks.length === 0 && tasks.length > 0}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                            onDragStart={handleDragStart}
                            onTaskClick={openEditDialog}
                            onAddClick={openCreateDialog}
                        />
                    ))}
                </div>
            </div>

            {/* Task Dialog */}
            <TaskDialog
                isOpen={dialogState.isOpen}
                mode={dialogState.mode}
                task={dialogState.task}
                boardCategories={board.categories}
                boardId={boardId}
                columnId={dialogState.columnId}
                onClose={closeDialog}
                onSave={handleSaveTask}
                onDelete={handleDeleteTask}
            />
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════
// COMPONENTI INTERNI
// ═══════════════════════════════════════════════════════════════════

/**
 * Header della board con ricerca e azioni.
 */
function BoardHeader({
                         title,
                         searchQuery,
                         onSearchChange,
                         activeFiltersCount,
                         isFilterOpen,
                         onFilterToggle,
                         onCreateClick,
                     }: {
    title: string;
    searchQuery: string;
    onSearchChange: (value: string) => void;
    activeFiltersCount: number;
    isFilterOpen: boolean;
    onFilterToggle: () => void;
    onCreateClick: () => void;
}) {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 flex-none relative z-20">
            <div>
                <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                        {title}
                    </h1>
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-600 text-xs font-semibold">
                        Privata
                    </span>
                </div>
                <p className="text-slate-500 mt-1 text-sm">
                    Gestisci le attività trascinandole tra le colonne.
                </p>
            </div>

            <div className="flex items-center gap-3">
                {/* Search */}
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Cerca task..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                    />
                </div>

                {/* Filter Button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onFilterToggle();
                    }}
                    className={`
                        p-2 border rounded-xl transition-colors relative flex items-center justify-center
                        ${activeFiltersCount > 0 || isFilterOpen
                        ? 'bg-blue-50 border-blue-200 text-blue-600'
                        : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'
                    }
                    `}
                    aria-label="Filtri"
                >
                    <Filter className="w-5 h-5" />
                    {activeFiltersCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] text-white font-bold">
                            {activeFiltersCount}
                        </span>
                    )}
                </button>

                {/* Create Button */}
                <button
                    onClick={onCreateClick}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20"
                >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Nuovo Task</span>
                </button>
            </div>
        </div>
    );
}

/**
 * Dropdown filtri.
 */
function FilterDropdown({
                            priorities,
                            selectedPriorities,
                            categories,
                            selectedCategories,
                            hasFilters,
                            onTogglePriority,
                            onToggleCategory,
                            onClear,
                        }: {
    priorities: readonly PriorityLevel[];
    selectedPriorities: PriorityLevel[];
    categories: { id: string; name: string }[];
    selectedCategories: string[];
    hasFilters: boolean;
    onTogglePriority: (priority: PriorityLevel) => void;
    onToggleCategory: (categoryId: string) => void;
    onClear: () => void;
}) {
    return (
        <div
            className="absolute right-6 top-24 w-72 bg-white rounded-xl shadow-xl border border-slate-100 p-4 z-50 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
        >
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-50">
                <h3 className="font-bold text-sm text-slate-800">Filtra per</h3>
                {hasFilters && (
                    <button
                        onClick={onClear}
                        className="text-xs text-red-500 hover:text-red-700 font-medium"
                    >
                        Resetta tutto
                    </button>
                )}
            </div>

            {/* Priorità */}
            <div className="mb-4">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                    Priorità
                </label>
                <div className="space-y-2">
                    {priorities.map((priority) => (
                        <FilterCheckbox
                            key={priority}
                            label={priority}
                            checked={selectedPriorities.includes(priority)}
                            onChange={() => onTogglePriority(priority)}
                        />
                    ))}
                </div>
            </div>

            {/* Categorie */}
            {categories.length > 0 && (
                <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                        Categorie
                    </label>
                    <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                        {categories.map((cat) => (
                            <FilterCheckbox
                                key={cat.id}
                                label={cat.name}
                                checked={selectedCategories.includes(cat.id.toString())}
                                onChange={() => onToggleCategory(cat.id.toString())}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

/**
 * Checkbox per i filtri.
 */
function FilterCheckbox({
                            label,
                            checked,
                            onChange,
                        }: {
    label: string;
    checked: boolean;
    onChange: () => void;
}) {
    return (
        <label className="flex items-center gap-2 cursor-pointer group">
            <div className={`
                w-4 h-4 rounded border flex items-center justify-center transition-colors
                ${checked
                ? 'bg-blue-600 border-blue-600'
                : 'border-slate-300 bg-white group-hover:border-blue-400'
            }
            `}>
                {checked && <Check className="w-3 h-3 text-white" />}
            </div>
            <input
                type="checkbox"
                className="hidden"
                checked={checked}
                onChange={onChange}
            />
            <span className="text-sm text-slate-700 truncate">{label}</span>
        </label>
    );
}

/**
 * Colonna Kanban.
 */
function KanbanColumn({
                          column,
                          tasks,
                          draggedTaskId,
                          hasFilters,
                          onDragOver,
                          onDrop,
                          onDragStart,
                          onTaskClick,
                          onAddClick,
                      }: {
    column: ColumnData;
    tasks: Task[];
    draggedTaskId: string | null;
    hasFilters: boolean;
    onDragOver: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent, columnId: ColumnId) => void;
    onDragStart: (e: React.DragEvent, taskId: string) => void;
    onTaskClick: (task: Task) => void;
    onAddClick: (columnId: ColumnId) => void;
}) {
    return (
        <div
            className="flex-1 flex flex-col min-w-[280px] h-full"
            onDragOver={onDragOver}
            onDrop={(e) => onDrop(e, column.id)}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wide">
                        {column.title}
                    </h3>
                    <span className="bg-slate-200 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full">
                        {tasks.length}
                    </span>
                </div>
                <div className={`h-1.5 w-1.5 rounded-full ${column.color}`} />
            </div>

            {/* Task List */}
            <div className={`flex-1 ${column.color} rounded-2xl border border-slate-200/60 p-3 overflow-y-auto space-y-3 custom-scrollbar`}>
                {tasks.length === 0 ? (
                    <div className="h-24 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-400 text-xs italic">
                        {hasFilters ? 'Nessun risultato dai filtri' : 'Nessun task qui'}
                    </div>
                ) : (
                    tasks.map(task => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            isDragging={draggedTaskId === task.id}
                            onDragStart={onDragStart}
                            onClick={onTaskClick}
                        />
                    ))
                )}

                {/* Add Button */}
                <button
                    onClick={() => onAddClick(column.id)}
                    className="w-full py-2 mt-2 border border-dashed border-slate-300 text-slate-400 rounded-xl hover:bg-white hover:text-blue-600 hover:border-blue-300 transition-colors text-xs font-medium flex items-center justify-center gap-1"
                >
                    <Plus className="w-3 h-3" /> Aggiungi
                </button>
            </div>
        </div>
    );
}