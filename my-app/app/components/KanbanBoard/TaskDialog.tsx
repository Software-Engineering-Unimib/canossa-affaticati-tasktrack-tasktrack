/**
 * @fileoverview Dialog modale per creazione e modifica di un task.
 *
 * Gestisce:
 * - Form per dati task (titolo, descrizione, priorità, categorie, scadenza)
 * - Upload e gestione allegati
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

    // ═══════════════════════════════════════════════════════════
    // TUTTI GLI HOOKS PRIMA DI QUALSIASI RETURN CONDIZIONALE
    // ═══════════════════════════════════════════════════════════

    const [formState, setFormState] = useState<FormState>(() =>
        createInitialFormState(mode, task, columnId)
    );

    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const [comments, setComments] = useState<TaskComment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [attachments, setAttachments] = useState<TaskAttachment[]>([]);

    const fileInputRef = useRef<HTMLInputElement>(null);

    /**
     * Carica commenti e allegati per un task.
     */
    const loadTaskExtras = useCallback(async (taskId: string) => {
        const [taskComments, taskAttachments] = await Promise.all([
            TaskModel.getComments(taskId),
            TaskModel.getAttachments(taskId),
        ]);

        setComments(taskComments);
        setAttachments(taskAttachments);
    }, []);

    /**
     * Inizializza il form quando il dialog si apre.
     */
    useEffect(() => {
        if (!isOpen) return;

        setIsSaving(false);
        setIsDeleting(false);
        setShowDeleteConfirm(false);

        setFormState(createInitialFormState(mode, task, columnId));

        if (isEditMode && task) {
            loadTaskExtras(task.id);
        } else {
            setComments([]);
            setAttachments([]);
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
     * Aggiorna un task esistente.
     */
    const updateExistingTask = useCallback(async (): Promise<Task | null> => {
        if (!task) return null;

        const payload = buildTaskPayload(undefined);
        await TaskModel.updateTask(task.id, payload);

        return {
            ...task,
            ...payload,
            assignees: task.assignees,
            categories: boardCategories.filter(c =>
                formState.selectedCategoryIds.includes(c.id.toString())
            ),
            comments: comments.length,
            attachments: attachments.length,
        };
    }, [task, buildTaskPayload, boardCategories, formState.selectedCategoryIds, comments.length, attachments.length]);

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

        return {
            id: String(created.id),
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
            comments: 0,
            attachments: 0,
        };
    }, [boardId, user, buildTaskPayload, boardCategories, formState.selectedCategoryIds]);

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

    /**
     * Invia un nuovo commento.
     */
    const handleSendComment = useCallback(async () => {
        if (!newComment.trim()) return;

        if (!isEditMode || !task) {
            alert('Salva prima il task per aggiungere commenti.');
            return;
        }

        try {
            const added = await TaskModel.addComment(task.id, newComment);
            setComments(prev => [...prev, added]);
            setNewComment('');
        } catch (error) {
            console.error('Errore invio commento:', error);
        }
    }, [newComment, isEditMode, task]);

    /**
     * Gestisce upload di un file.
     */
    const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!isEditMode || !task) {
            alert('Salva prima il task per allegare file.');
            return;
        }

        try {
            await TaskModel.uploadAttachment(task.id, file);
            const updated = await TaskModel.getAttachments(task.id);
            setAttachments(updated);
        } catch (error) {
            console.error('Errore upload:', error);
            alert('Errore durante il caricamento.');
        }

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, [isEditMode, task]);

    /**
     * Elimina un allegato.
     */
    const handleDeleteAttachment = useCallback(async (fileId: number, filePath: string) => {
        if (!confirm('Eliminare questo allegato?')) return;

        try {
            await TaskModel.deleteAttachment(fileId, filePath);
            setAttachments(prev => prev.filter(a => a.id !== fileId));
        } catch (error) {
            console.error('Errore eliminazione allegato:', error);
        }
    }, []);

    // ══════════════════════════��════════════════════════════════
    // EARLY RETURN DOPO TUTTI GLI HOOKS
    // ═══════════════════════════════════════════════════════════

    if (!isOpen) return null;

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
                            attachments={attachments}
                            fileInputRef={fileInputRef}
                            onUpdateField={updateFormField}
                            onToggleCategory={toggleCategory}
                            onFileUpload={handleFileUpload}
                            onDeleteAttachment={handleDeleteAttachment}
                            onSubmit={handleSave}
                        />
                    </div>

                    {/* Colonna destra: Commenti */}
                    <CommentsSection
                        isEditMode={isEditMode}
                        comments={comments}
                        newComment={newComment}
                        isSaving={isSaving}
                        onNewCommentChange={setNewComment}
                        onSendComment={handleSendComment}
                    />
                </div>

                {/* Footer */}
                <DialogFooter
                    isEditMode={isEditMode}
                    isSaving={isSaving}
                    isValid={!!formState.title.trim()}
                    onClose={onClose}
                />
            </div>
        </div>
    );
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
                          onDelete,
                          onClose,
                      }: {
    isEditMode: boolean;
    taskId?: string;
    isSaving: boolean;
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
                          onClose,
                      }: {
    isEditMode: boolean;
    isSaving: boolean;
    isValid: boolean;
    onClose: () => void;
}) {
    return (
        <div className="px-6 py-4 border-t border-slate-100 bg-white flex justify-end gap-3 z-10">
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
    attachments: TaskAttachment[];
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    onUpdateField: <K extends keyof FormState>(field: K, value: FormState[K]) => void;
    onToggleCategory: (categoryId: string) => void;
    onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onDeleteAttachment: (fileId: number, filePath: string) => void;
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
                      onFileUpload,
                      onDeleteAttachment,
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
                onFileChange={onFileUpload}
                onDelete={onDeleteAttachment}
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
                                onDelete,
                            }: {
    attachments: TaskAttachment[];
    isSaving: boolean;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    onUploadClick: () => void;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onDelete: (fileId: number, filePath: string) => void;
}) {
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Paperclip className="w-4 h-4" /> Allegati ({attachments.length})
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
                            className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:shadow-sm transition-all group"
                        >
                            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                                <FileText className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-700 truncate">
                                    {file.name}
                                </p>
                                <p className="text-xs text-slate-400">
                                    {formatFileSize(file.file_size)}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                {file.publicUrl && (
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
                                    onClick={() => onDelete(file.id, file.file_path)}
                                    disabled={isSaving}
                                    className="p-1.5 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all disabled:cursor-not-allowed"
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
                             isEditMode,
                             comments,
                             newComment,
                             isSaving,
                             onNewCommentChange,
                             onSendComment,
                         }: {
    isEditMode: boolean;
    comments: TaskComment[];
    newComment: string;
    isSaving: boolean;
    onNewCommentChange: (value: string) => void;
    onSendComment: () => void;
}) {
    return (
        <div className="w-full lg:w-1/3 bg-slate-50 flex flex-col h-full border-l border-slate-200">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 bg-slate-50/80 backdrop-blur-sm sticky top-0">
                <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" /> Attività & Commenti
                </h3>
            </div>

            {/* Lista commenti */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {!isEditMode ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center p-6">
                        <MessageSquare className="w-10 h-10 mb-2 opacity-20" />
                        <p className="text-xs">
                            Potrai aggiungere commenti dopo aver creato il task.
                        </p>
                    </div>
                ) : comments.length === 0 ? (
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
            {isEditMode && (
                <div className="p-4 bg-white border-t border-slate-200">
                    <div className="relative">
                        <input
                            type="text"
                            value={newComment}
                            onChange={(e) => onNewCommentChange(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && onSendComment()}
                            placeholder="Scrivi un commento..."
                            disabled={isSaving}
                            className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                        <button
                            onClick={onSendComment}
                            disabled={!newComment.trim() || isSaving}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

/**
 * Singolo commento.
 */
function CommentItem({ comment }: { comment: TaskComment }) {
    return (
        <div className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
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
                        {new Date(comment.created_at).toLocaleDateString()}
                    </span>
                </div>
                <div className="text-sm text-slate-600 bg-white p-3 rounded-r-xl rounded-bl-xl shadow-sm border border-slate-200">
                    {comment.text}
                </div>
            </div>
        </div>
    );
}