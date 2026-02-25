/**
 * @fileoverview Dialog modale per creazione e modifica di un task.
 *
 * Gestisce:
 * - Form per dati task (titolo, descrizione, priorità, categorie, scadenza)
 * - Upload e gestione allegati (salvati solo al submit)
 * - Sezione commenti (solo in modalità edit)
 * - Conferma eliminazione con overlay
 *
 * @module components/KanbanBoard/TaskDialog
 */

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    X,
    Trash2,
    Save,
    Calendar,
    Tag,
    AlertCircle,
    AlignLeft,
    Layout,
    Check,
    Paperclip,
    UploadCloud,
    FileText,
    MessageSquare,
    Send,
    Columns,
    Loader2,
    AlertTriangle,
} from 'lucide-react';

import { Task, ColumnId } from '@/items/Task';
import { PriorityLevel, getPriorityStyles } from '@/items/Priority';
import { Category, themeCategoryOptions } from '@/items/Category';
import { TaskModel, TaskComment, TaskAttachment } from '@/models/Task';
import { useAuth } from '@/app/context/AuthContext';

/**
 * Props del componente TaskDialog.
 */
interface TaskDialogProps {
    isOpen: boolean;
    onClose: () => void;
    mode: 'create' | 'edit';
    task: Task | null;
    boardCategories: Category[];
    boardId?: string;
    columnId?: ColumnId;
    onSave: (task: Task) => void;
    onDelete?: (taskId: string) => void;
}

/**
 * Livelli di priorità disponibili.
 */
const PRIORITY_LEVELS: readonly PriorityLevel[] = ['Bassa', 'Media', 'Alta', 'Urgente'];

/**
 * Opzioni per la selezione della colonna.
 */
const COLUMN_OPTIONS: readonly { id: ColumnId; label: string }[] = [
    { id: 'todo', label: 'Da Fare' },
    { id: 'inprogress', label: 'In Corso' },
    { id: 'done', label: 'Completato' },
];

/**
 * Stato del form.
 */
interface FormState {
    title: string;
    description: string;
    priority: PriorityLevel;
    selectedCategoryIds: string[];
    dueDate: string;
    targetColumn: ColumnId;
}

/**
 * File in attesa di upload (non ancora salvato nel DB).
 */
interface PendingFile {
    id: string;
    file: File;
    name: string;
    size: number;
}

/**
 * Commento in attesa di salvataggio.
 */
interface PendingComment {
    id: string;
    text: string;
    createdAt: Date;
}

/**
 * Crea lo stato iniziale del form.
 */
function createInitialFormState(
    mode: 'create' | 'edit',
    task: Task | null,
    columnId?: ColumnId
): FormState {
    if (mode === 'edit' && task) {
        return {
            title: task.title,
            description: task.description ?? '',
            priority: task.priority,
            selectedCategoryIds: task.categories.map(c => c.id.toString()),
            dueDate: task.dueDate
                ? new Date(task.dueDate).toISOString().split('T')[0]
                : '',
            targetColumn: task.columnId,
        };
    }

    return {
        title: '',
        description: '',
        priority: 'Media',
        selectedCategoryIds: [],
        dueDate: '',
        targetColumn: columnId ?? 'todo',
    };
}

/**
 * Formatta la dimensione di un file in KB.
 */
function formatFileSize(bytes: number): string {
    return `${(bytes / 1024).toFixed(1)} KB`;
}

/**
 * Genera un ID univoco temporaneo.
 */
function generateTempId(): string {
    return `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Dialog modale per creazione/modifica task.
 */
export default function TaskDialog({
                                       isOpen,
                                       onClose,
                                       mode,
                                       task,
                                       boardCategories,
                                       boardId,
                                       columnId,
                                       onSave,
                                       onDelete,
                                   }: TaskDialogProps) {
    const { user } = useAuth();
    const isEditMode = mode === 'edit';


    const [formState, setFormState] = useState<FormState>(() =>
        createInitialFormState(mode, task, columnId)
    );

    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Commenti già salvati nel DB
    const [savedComments, setSavedComments] = useState<TaskComment[]>([]);
    // Commenti in attesa di salvataggio
    const [pendingComments, setPendingComments] = useState<PendingComment[]>([]);
    const [newComment, setNewComment] = useState('');

    // Allegati già salvati nel DB
    const [savedAttachments, setSavedAttachments] = useState<TaskAttachment[]>([]);
    // File in attesa di upload
    const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
    // Allegati da eliminare al salvataggio
    const [attachmentsToDelete, setAttachmentsToDelete] = useState<{ id: number; path: string }[]>([]);

    const fileInputRef = useRef<HTMLInputElement>(null);

    /**
     * Carica commenti e allegati esistenti per un task.
     */
    const loadTaskExtras = useCallback(async (taskId: string) => {
        const [taskComments, taskAttachments] = await Promise.all([
            TaskModel.getComments(taskId),
            TaskModel.getAttachments(taskId),
        ]);

        setSavedComments(taskComments);
        setSavedAttachments(taskAttachments);
    }, []);

    /**
     * Inizializza il form quando il dialog si apre.
     */
    useEffect(() => {
        if (!isOpen) return;

        // Reset stati
        setIsSaving(false);
        setIsDeleting(false);
        setShowDeleteConfirm(false);
        setPendingComments([]);
        setPendingFiles([]);
        setAttachmentsToDelete([]);
        setNewComment('');

        setFormState(createInitialFormState(mode, task, columnId));

        if (isEditMode && task) {
            loadTaskExtras(task.id);
        } else {
            setSavedComments([]);
            setSavedAttachments([]);
        }
    }, [isOpen, mode, task, columnId, isEditMode, loadTaskExtras]);

    /**
     * Aggiorna un campo del form.
     */
    const updateFormField = useCallback(<K extends keyof FormState>(
        field: K,
        value: FormState[K]
    ) => {
        setFormState(prev => ({ ...prev, [field]: value }));
    }, []);

    /**
     * Toggle selezione categoria.
     */
    const toggleCategory = useCallback((categoryId: string) => {
        setFormState(prev => ({
            ...prev,
            selectedCategoryIds: prev.selectedCategoryIds.includes(categoryId)
                ? prev.selectedCategoryIds.filter(id => id !== categoryId)
                : [...prev.selectedCategoryIds, categoryId],
        }));
    }, []);

    /**
     * Aggiunge un file alla lista di pending (non ancora uploadato).
     */
    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const pendingFile: PendingFile = {
            id: generateTempId(),
            file: file,
            name: file.name,
            size: file.size,
        };

        setPendingFiles(prev => [...prev, pendingFile]);

        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, []);

    /**
     * Rimuove un file pending (non ancora salvato).
     */
    const handleRemovePendingFile = useCallback((fileId: string) => {
        setPendingFiles(prev => prev.filter(f => f.id !== fileId));
    }, []);

    /**
     * Segna un allegato esistente per l'eliminazione.
     */
    const handleMarkAttachmentForDeletion = useCallback((fileId: number, filePath: string) => {
        setAttachmentsToDelete(prev => [...prev, { id: fileId, path: filePath }]);
        setSavedAttachments(prev => prev.filter(a => a.id !== fileId));
    }, []);

    /**
     * Aggiunge un commento alla lista pending.
     */
    const handleAddPendingComment = useCallback(() => {
        if (!newComment.trim()) return;

        const pendingComment: PendingComment = {
            id: generateTempId(),
            text: newComment.trim(),
            createdAt: new Date(),
        };

        setPendingComments(prev => [...prev, pendingComment]);
        setNewComment('');
    }, [newComment]);

    /**
     * Costruisce il payload per create/update.
     */
    const buildTaskPayload = useCallback((assigneeIds?: string[]) => ({
        title: formState.title,
        description: formState.description,
        priority: formState.priority,
        dueDate: formState.dueDate ? new Date(formState.dueDate) : new Date(),
        assigneeIds,
        categoryIds: formState.selectedCategoryIds,
        columnId: formState.targetColumn,
    }), [formState]);

    /**
     * Salva tutti i pending (commenti e file) nel DB.
     */
    const savePendingItems = useCallback(async (taskId: string) => {
        // Upload tutti i file pending
        const uploadPromises = pendingFiles.map(pf =>
            TaskModel.uploadAttachment(taskId, pf.file)
        );

        // Salva tutti i commenti pending
        const commentPromises = pendingComments.map(pc =>
            TaskModel.addComment(taskId, pc.text)
        );

        // Elimina gli allegati marcati per l'eliminazione
        const deletePromises = attachmentsToDelete.map(a =>
            TaskModel.deleteAttachment(a.id, a.path)
        );

        await Promise.all([...uploadPromises, ...commentPromises, ...deletePromises]);
    }, [pendingFiles, pendingComments, attachmentsToDelete]);

    /**
     * Aggiorna un task esistente.
     */
    const updateExistingTask = useCallback(async (): Promise<Task | null> => {
        if (!task) return null;

        const payload = buildTaskPayload(undefined);
        await TaskModel.updateTask(task.id, payload);

        // Salva commenti e allegati pending
        await savePendingItems(task.id);

        // Conta allegati finali
        const finalAttachmentsCount = savedAttachments.length + pendingFiles.length;
        const finalCommentsCount = savedComments.length + pendingComments.length;

        return {
            ...task,
            ...payload,
            assignees: task.assignees,
            categories: boardCategories.filter(c =>
                formState.selectedCategoryIds.includes(c.id.toString())
            ),
            comments: finalCommentsCount,
            attachments: finalAttachmentsCount,
        };
    }, [task, buildTaskPayload, savePendingItems, boardCategories, formState.selectedCategoryIds, savedAttachments.length, pendingFiles.length, savedComments.length, pendingComments.length]);

    /**
     * Crea un nuovo task.
     */
    const createNewTask = useCallback(async (): Promise<Task | null> => {
        if (!boardId || !user) return null;

        const payload = buildTaskPayload([user.id]);
        const created = await TaskModel.createTask(boardId, {
            ...payload,
            assigneeIds: payload.assigneeIds ?? [],
        });

        const taskId = String(created.id);

        // Salva commenti e allegati pending
        await savePendingItems(taskId);

        return {
            id: taskId,
            title: created.title,
            description: created.description,
            priority: created.priority as PriorityLevel,
            columnId: created.column_id as ColumnId,
            dueDate: new Date(created.due_date),
            categories: boardCategories.filter(c =>
                formState.selectedCategoryIds.includes(c.id.toString())
            ),
            assignees: [{
                id: user.id,
                name: user.name ?? '',
                surname: user.surname ?? '',
                avatar_url: user.avatar_url ?? '',
                email: user.email ?? '',
            }],
            comments: pendingComments.length,
            attachments: pendingFiles.length,
        };
    }, [boardId, user, buildTaskPayload, savePendingItems, boardCategories, formState.selectedCategoryIds, pendingComments.length, pendingFiles.length]);

    /**
     * Salva il task (crea o aggiorna).
     */
    const handleSave = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formState.title.trim()) return;

        setIsSaving(true);

        try {
            const savedTask = isEditMode
                ? await updateExistingTask()
                : await createNewTask();

            if (savedTask) {
                onSave(savedTask);
            }

            onClose();
        } catch (error) {
            console.error('Errore salvataggio task:', error);
            alert('Errore durante il salvataggio.');
        } finally {
            setIsSaving(false);
        }
    }, [formState.title, isEditMode, updateExistingTask, createNewTask, onSave, onClose]);

    /**
     * Richiede conferma eliminazione.
     */
    const requestDelete = useCallback(() => {
        setShowDeleteConfirm(true);
    }, []);

    /**
     * Conferma e esegue eliminazione.
     */
    const confirmDelete = useCallback(async () => {
        if (!isEditMode || !onDelete || !task) return;

        setIsDeleting(true);

        try {
            await onDelete(task.id);
            onClose();
        } catch (error) {
            console.error('Errore eliminazione:', error);
            setIsDeleting(false);
        }
    }, [isEditMode, onDelete, task, onClose]);

    // ═══════════════════════════════════════════════════════════
    // EARLY RETURN DOPO TUTTI GLI HOOKS
    // ═══════════════════════════════════════════════════════════

    if (!isOpen) return null;

    // Combina allegati salvati e pending per la visualizzazione
    const allAttachments: DisplayAttachment[] = [
        ...savedAttachments.map(a => ({
            id: a.id.toString(),
            name: a.name,
            size: a.file_size,
            publicUrl: a.publicUrl,
            isPending: false,
            dbId: a.id,
            filePath: a.file_path,
        })),
        ...pendingFiles.map(pf => ({
            id: pf.id,
            name: pf.name,
            size: pf.size,
            publicUrl: undefined,
            isPending: true,
        })),
    ];

    // Combina commenti salvati e pending per la visualizzazione
    const allComments: DisplayComment[] = [
        ...savedComments.map(c => ({
            id: c.id.toString(),
            text: c.text,
            createdAt: c.created_at,
            author: c.author,
            isPending: false,
        })),
        ...pendingComments.map(pc => ({
            id: pc.id,
            text: pc.text,
            createdAt: pc.createdAt.toISOString(),
            author: user ? {
                name: user.name ?? 'Tu',
                avatar_url: user.avatar_url ?? '',
            } : { name: 'Tu', avatar_url: '' },
            isPending: true,
        })),
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-5xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col h-[90vh]">

                {/* Overlay conferma eliminazione */}
                {showDeleteConfirm && (
                    <DeleteConfirmOverlay
                        isDeleting={isDeleting}
                        onCancel={() => setShowDeleteConfirm(false)}
                        onConfirm={confirmDelete}
                    />
                )}

                {/* Header */}
                <DialogHeader
                    isEditMode={isEditMode}
                    taskId={task?.id}
                    isSaving={isSaving}
                    hasPendingChanges={pendingFiles.length > 0 || pendingComments.length > 0 || attachmentsToDelete.length > 0}
                    onDelete={isEditMode && onDelete && task ? requestDelete : undefined}
                    onClose={onClose}
                />

                {/* Body */}
                <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
                    {/* Colonna sinistra: Form */}
                    <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar border-b lg:border-b-0 lg:border-r border-slate-100">
                        <TaskForm
                            formState={formState}
                            isEditMode={isEditMode}
                            isSaving={isSaving}
                            boardCategories={boardCategories}
                            attachments={allAttachments}
                            fileInputRef={fileInputRef}
                            onUpdateField={updateFormField}
                            onToggleCategory={toggleCategory}
                            onFileSelect={handleFileSelect}
                            onRemovePendingFile={handleRemovePendingFile}
                            onDeleteSavedAttachment={handleMarkAttachmentForDeletion}
                            onSubmit={handleSave}
                        />
                    </div>

                    {/* Colonna destra: Commenti */}
                    <CommentsSection
                        comments={allComments}
                        newComment={newComment}
                        isSaving={isSaving}
                        onNewCommentChange={setNewComment}
                        onAddComment={handleAddPendingComment}
                    />
                </div>

                {/* Footer */}
                <DialogFooter
                    isEditMode={isEditMode}
                    isSaving={isSaving}
                    isValid={!!formState.title.trim()}
                    hasPendingChanges={pendingFiles.length > 0 || pendingComments.length > 0 || attachmentsToDelete.length > 0}
                    onClose={onClose}
                />
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════
// TIPI PER VISUALIZZAZIONE
// ═══════════════════════════════════════════════════════════════════

/**
 * Allegato per la visualizzazione (può essere salvato o pending).
 */
interface DisplayAttachment {
    id: string;
    name: string;
    size: number;
    publicUrl?: string;
    isPending: boolean;
    dbId?: number;
    filePath?: string;
}

/**
 * Commento per la visualizzazione (può essere salvato o pending).
 */
interface DisplayComment {
    id: string;
    text: string;
    createdAt: string;
    author: {
        name: string;
        avatar_url: string;
    };
    isPending: boolean;
}

// ═══════════════════════════════════════════════════════════════════
// COMPONENTI INTERNI
// ═══════════════════════════════════════════════════════════════════

/**
 * Overlay per conferma eliminazione.
 */
function DeleteConfirmOverlay({
                                  isDeleting,
                                  onCancel,
                                  onConfirm,
                              }: {
    isDeleting: boolean;
    onCancel: () => void;
    onConfirm: () => void;
}) {
    return (
        <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-200">
            <div className="bg-red-50 p-4 rounded-full mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
                Eliminare questo task?
            </h3>
            <p className="text-slate-500 text-center max-w-xs mb-8">
                L&apos;azione è irreversibile. Tutti i commenti e gli allegati verranno rimossi.
            </p>
            <div className="flex gap-4">
                <button
                    onClick={onCancel}
                    disabled={isDeleting}
                    className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
                >
                    Annulla
                </button>
                <button
                    onClick={onConfirm}
                    disabled={isDeleting}
                    className="px-6 py-2.5 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20 flex items-center gap-2"
                >
                    {isDeleting ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Eliminazione...
                        </>
                    ) : (
                        <>
                            <Trash2 className="w-4 h-4" />
                            Elimina definitivamente
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}

/**
 * Header del dialog.
 */
function DialogHeader({
                          isEditMode,
                          taskId,
                          isSaving,
                          hasPendingChanges,
                          onDelete,
                          onClose,
                      }: {
    isEditMode: boolean;
    taskId?: string;
    isSaving: boolean;
    hasPendingChanges: boolean;
    onDelete?: () => void;
    onClose: () => void;
}) {
    return (
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white z-10">
            <div className="flex items-center gap-2 text-slate-500">
                <Layout className="w-5 h-5" />
                <span className="text-sm font-medium">
                    {isEditMode ? `Modifica Task / ${taskId}` : 'Crea Nuovo Task'}
                </span>
                {hasPendingChanges && (
                    <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                        Modifiche non salvate
                    </span>
                )}
            </div>
            <div className="flex items-center gap-2">
                {onDelete && (
                    <button
                        onClick={onDelete}
                        disabled={isSaving}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                        title="Elimina Task"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                )}
                <button
                    onClick={onClose}
                    disabled={isSaving}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}

/**
 * Footer del dialog.
 */
function DialogFooter({
                          isEditMode,
                          isSaving,
                          isValid,
                          hasPendingChanges,
                          onClose,
                      }: {
    isEditMode: boolean;
    isSaving: boolean;
    isValid: boolean;
    hasPendingChanges: boolean;
    onClose: () => void;
}) {
    return (
        <div className="px-6 py-4 border-t border-slate-100 bg-white flex justify-between items-center z-10">
            <div className="text-xs text-slate-400">
                {hasPendingChanges && (
                    <span className="flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        I file e commenti verranno salvati al click su &quot;Salva&quot;
                    </span>
                )}
            </div>
            <div className="flex gap-3">
                <button
                    type="button"
                    onClick={onClose}
                    disabled={isSaving}
                    className="px-4 py-2 text-slate-600 text-sm font-medium hover:bg-slate-100 rounded-lg transition-colors"
                >
                    Annulla
                </button>
                <button
                    type="submit"
                    form="task-form"
                    disabled={!isValid || isSaving}
                    className="px-6 py-2 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg shadow-slate-900/10 disabled:opacity-50"
                >
                    {isSaving ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Salvataggio...
                        </>
                    ) : (
                        <>
                            <Save className="w-4 h-4" />
                            {isEditMode ? 'Salva Modifiche' : 'Crea Task'}
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}

/**
 * Props del form principale.
 */
interface TaskFormProps {
    formState: FormState;
    isEditMode: boolean;
    isSaving: boolean;
    boardCategories: Category[];
    attachments: DisplayAttachment[];
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    onUpdateField: <K extends keyof FormState>(field: K, value: FormState[K]) => void;
    onToggleCategory: (categoryId: string) => void;
    onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onRemovePendingFile: (fileId: string) => void;
    onDeleteSavedAttachment: (fileId: number, filePath: string) => void;
    onSubmit: (e: React.FormEvent) => void;
}

/**
 * Form principale del task.
 */
function TaskForm({
                      formState,
                      isEditMode,
                      isSaving,
                      boardCategories,
                      attachments,
                      fileInputRef,
                      onUpdateField,
                      onToggleCategory,
                      onFileSelect,
                      onRemovePendingFile,
                      onDeleteSavedAttachment,
                      onSubmit,
                  }: TaskFormProps) {
    return (
        <form id="task-form" onSubmit={onSubmit} className="space-y-8">
            {/* Titolo */}
            <input
                type="text"
                required
                value={formState.title}
                onChange={(e) => onUpdateField('title', e.target.value)}
                disabled={isSaving}
                autoFocus
                className="w-full text-2xl font-bold text-slate-900 placeholder:text-slate-300 border-none focus:ring-0 focus:outline-none p-0 bg-transparent"
                placeholder={isEditMode ? 'Titolo del task' : 'Cosa devi fare?'}
            />

            {/* Metadati Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Priorità */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" /> Priorità
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {PRIORITY_LEVELS.map((p) => (
                            <button
                                key={p}
                                type="button"
                                onClick={() => onUpdateField('priority', p)}
                                disabled={isSaving}
                                className={`
                                    px-3 py-1.5 rounded-lg text-xs font-bold border transition-all
                                    ${formState.priority === p
                                    ? `${getPriorityStyles(p)} ring-2 ring-offset-1 ring-slate-200`
                                    : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                                }
                                `}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Scadenza */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <Calendar className="w-4 h-4" /> Scadenza
                    </label>
                    <input
                        type="date"
                        value={formState.dueDate}
                        onChange={(e) => onUpdateField('dueDate', e.target.value)}
                        disabled={isSaving}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                </div>

                {/* Colonna (solo create) */}
                {!isEditMode && (
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                            <Columns className="w-4 h-4" /> Stato Iniziale
                        </label>
                        <select
                            value={formState.targetColumn}
                            onChange={(e) => onUpdateField('targetColumn', e.target.value as ColumnId)}
                            disabled={isSaving}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        >
                            {COLUMN_OPTIONS.map(opt => (
                                <option key={opt.id} value={opt.id}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {/* Categorie */}
            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Tag className="w-4 h-4" /> Categorie
                </label>
                <div className="flex flex-wrap gap-2">
                    {boardCategories.map((cat) => {
                        const isSelected = formState.selectedCategoryIds.includes(cat.id.toString());
                        const themeClass = themeCategoryOptions.find(opt => opt.value === cat.color)?.class ?? 'bg-slate-200';

                        return (
                            <button
                                key={cat.id}
                                type="button"
                                onClick={() => onToggleCategory(cat.id.toString())}
                                disabled={isSaving}
                                className={`
                                    px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5
                                    ${isSelected
                                    ? `${themeClass} border-transparent ring-2 ring-offset-1 ring-slate-200`
                                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                                }
                                `}
                            >
                                {cat.name}
                                {isSelected && <Check className="w-3 h-3" />}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Descrizione */}
            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <AlignLeft className="w-4 h-4" /> Descrizione
                </label>
                <textarea
                    rows={5}
                    value={formState.description}
                    onChange={(e) => onUpdateField('description', e.target.value)}
                    disabled={isSaving}
                    placeholder="Descrivi il task..."
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm text-slate-700 resize-none"
                />
            </div>

            {/* Allegati */}
            <AttachmentsSection
                attachments={attachments}
                isSaving={isSaving}
                fileInputRef={fileInputRef}
                onUploadClick={() => fileInputRef.current?.click()}
                onFileChange={onFileSelect}
                onRemovePending={onRemovePendingFile}
                onDeleteSaved={onDeleteSavedAttachment}
            />
        </form>
    );
}

/**
 * Sezione allegati.
 */
function AttachmentsSection({
                                attachments,
                                isSaving,
                                fileInputRef,
                                onUploadClick,
                                onFileChange,
                                onRemovePending,
                                onDeleteSaved,
                            }: {
    attachments: DisplayAttachment[];
    isSaving: boolean;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    onUploadClick: () => void;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onRemovePending: (fileId: string) => void;
    onDeleteSaved: (fileId: number, filePath: string) => void;
}) {
    const pendingCount = attachments.filter(a => a.isPending).length;

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Paperclip className="w-4 h-4" />
                    Allegati ({attachments.length})
                    {pendingCount > 0 && (
                        <span className="ml-1 px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-medium rounded">
                            {pendingCount} da salvare
                        </span>
                    )}
                </label>
                <button
                    type="button"
                    onClick={onUploadClick}
                    disabled={isSaving}
                    className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
                >
                    <UploadCloud className="w-3 h-3" />
                    Carica
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={onFileChange}
                />
            </div>

            {attachments.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {attachments.map((file) => (
                        <div
                            key={file.id}
                            className={`
                                flex items-center gap-3 p-3 rounded-xl border transition-all group
                                ${file.isPending
                                ? 'bg-amber-50 border-amber-200'
                                : 'bg-slate-50 border-slate-200 hover:bg-white hover:shadow-sm'
                            }
                            `}
                        >
                            <div className={`
                                w-10 h-10 rounded-lg flex items-center justify-center shrink-0
                                ${file.isPending ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}
                            `}>
                                <FileText className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-700 truncate">
                                    {file.name}
                                </p>
                                <p className="text-xs text-slate-400 flex items-center gap-1">
                                    {formatFileSize(file.size)}
                                    {file.isPending && (
                                        <span className="text-amber-600 font-medium">
                                            • In attesa di salvataggio
                                        </span>
                                    )}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                {file.publicUrl && !file.isPending && (
                                    <a
                                        href={file.publicUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="Scarica"
                                    >
                                        <UploadCloud className="w-4 h-4 rotate-180" />
                                    </a>
                                )}
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (file.isPending) {
                                            onRemovePending(file.id);
                                        } else if (file.dbId && file.filePath) {
                                            onDeleteSaved(file.dbId, file.filePath);
                                        }
                                    }}
                                    disabled={isSaving}
                                    className="p-1.5 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all disabled:cursor-not-allowed"
                                    title={file.isPending ? 'Rimuovi' : 'Elimina'}
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-xl">
                    <p className="text-slate-400 text-sm">Nessun file allegato</p>
                </div>
            )}
        </div>
    );
}

/**
 * Sezione commenti.
 */
function CommentsSection({
                             comments,
                             newComment,
                             isSaving,
                             onNewCommentChange,
                             onAddComment,
                         }: {
    comments: DisplayComment[];
    newComment: string;
    isSaving: boolean;
    onNewCommentChange: (value: string) => void;
    onAddComment: () => void;
}) {
    const pendingCount = comments.filter(c => c.isPending).length;

    return (
        <div className="w-full lg:w-1/3 bg-slate-50 flex flex-col h-full border-l border-slate-200">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 bg-slate-50/80 backdrop-blur-sm sticky top-0">
                <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Commenti ({comments.length})
                    {pendingCount > 0 && (
                        <span className="ml-1 px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-medium rounded">
                            {pendingCount} da salvare
                        </span>
                    )}
                </h3>
            </div>

            {/* Lista commenti */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {comments.length === 0 ? (
                    <p className="text-center text-slate-400 text-xs py-10">
                        Nessun commento ancora. Scrivi qualcosa!
                    </p>
                ) : (
                    comments.map((comment) => (
                        <CommentItem key={comment.id} comment={comment} />
                    ))
                )}
            </div>

            {/* Input commento */}
            <div className="p-4 bg-white border-t border-slate-200">
                <div className="relative">
                    <input
                        type="text"
                        value={newComment}
                        onChange={(e) => onNewCommentChange(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && onAddComment()}
                        placeholder="Scrivi un commento..."
                        disabled={isSaving}
                        className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                    <button
                        type="button"
                        onClick={onAddComment}
                        disabled={!newComment.trim() || isSaving}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
                <p className="mt-2 text-[10px] text-slate-400">
                    I commenti verranno salvati quando clicchi &quot;Salva Modifiche&quot;
                </p>
            </div>
        </div>
    );
}

/**
 * Singolo commento.
 */
function CommentItem({ comment }: { comment: DisplayComment }) {
    return (
        <div className={`
            flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300
            ${comment.isPending ? 'opacity-70' : ''}
        `}>
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0 overflow-hidden">
                {comment.author.avatar_url ? (
                    <img
                        src={comment.author.avatar_url}
                        alt=""
                        className="w-full h-full object-cover"
                    />
                ) : (
                    comment.author.name.charAt(0)
                )}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-slate-800 truncate">
                        {comment.author.name}
                    </span>
                    <span className="text-[10px] text-slate-400">
                        {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                    {comment.isPending && (
                        <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-medium rounded">
                            Da salvare
                        </span>
                    )}
                </div>
                <div className={`
                    text-sm text-slate-600 p-3 rounded-r-xl rounded-bl-xl shadow-sm border
                    ${comment.isPending
                    ? 'bg-amber-50 border-amber-200'
                    : 'bg-white border-slate-200'
                }
                `}>
                    {comment.text}
                </div>
            </div>
        </div>
    );
}