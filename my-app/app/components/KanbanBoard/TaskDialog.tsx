'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
    X, Trash2, Save, Calendar, Tag, AlertCircle, AlignLeft, Layout,
    Check, Paperclip, UploadCloud, FileText, MessageSquare, Send, Columns,
    Loader2, AlertTriangle
} from 'lucide-react';

import { Task, ColumnId } from '@/items/Task';
import { PriorityLevel, getPriorityStyles } from '@/items/Priority';
import { Category, themeCategoryOptions } from '@/items/Category';
import { TaskModel, TaskComment, TaskAttachment } from '@/models/Task';
import { useAuth } from '@/app/context/AuthContext';

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

const allPriorities: PriorityLevel[] = ['Bassa', 'Media', 'Alta', 'Urgente'];
const columnOptions: { id: ColumnId; label: string }[] = [
    { id: 'todo', label: 'Da Fare' },
    { id: 'inprogress', label: 'In Corso' },
    { id: 'done', label: 'Completato' },
];

export default function TaskDialog({
                                       isOpen, onClose, mode, task, boardCategories, boardId, columnId, onSave, onDelete
                                   }: TaskDialogProps) {
    const { user } = useAuth();
    const isEdit = mode === 'edit';

    // --- STATI FORM ---
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState<PriorityLevel>('Media');
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
    const [dueDate, setDueDate] = useState<string>('');
    const [targetColumn, setTargetColumn] = useState<ColumnId>('todo');

    // --- STATI UI ---
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // --- STATI DATA EXTRA ---
    const [comments, setComments] = useState<TaskComment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [attachments, setAttachments] = useState<TaskAttachment[]>([]);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // --- INIT ---
    useEffect(() => {
        if (isOpen) {
            setIsSaving(false);
            setIsDeleting(false);
            setShowDeleteConfirm(false);

            if (isEdit && task) {
                // EDIT MODE
                setTitle(task.title);
                setDescription(task.description || '');
                setPriority(task.priority);
                setSelectedCategoryIds(task.categories.map(c => c.id.toString()));
                setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
                setTargetColumn(task.columnId);

                loadExtraData(task.id);
            } else {
                // CREATE MODE
                setTitle('');
                setDescription('');
                setPriority('Media');
                setSelectedCategoryIds([]);
                setDueDate('');
                setTargetColumn(columnId || 'todo');
                setComments([]);
                setAttachments([]);
            }
        }
    }, [isOpen, task, mode, columnId, isEdit]);

    const loadExtraData = async (taskId: string) => {
        const c = await TaskModel.getComments(taskId);
        setComments(c);

        const a = await TaskModel.getAttachments(taskId);
        setAttachments(a);
    };

    // --- HANDLERS ---

    const toggleCategory = (catId: string) => {
        setSelectedCategoryIds(prev =>
            prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId]
        );
    };

    const requestDelete = () => {
        setShowDeleteConfirm(true);
    };

    const confirmDeleteTask = async () => {
        if (!isEdit || !onDelete || !task) return;

        setIsDeleting(true);
        try {
            await onDelete(task.id);
            onClose();
        } catch (error) {
            console.error(error);
            setIsDeleting(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        setIsSaving(true);

        try {
            // Assegniamo l'utente corrente come assignee SOLO in creazione
            // In modifica passiamo undefined per non sovrascrivere gli esistenti
            const currentAssigneeIds = (!isEdit && user) ? [user.id] : undefined;

            const taskDataPayload = {
                title,
                description,
                priority,
                dueDate: dueDate ? new Date(dueDate) : new Date(),
                assigneeIds: currentAssigneeIds,
                categoryIds: selectedCategoryIds,
                columnId: targetColumn
            };

            let savedTask: Task | null = null;

            if (isEdit && task) {
                // UPDATE
                await TaskModel.updateTask(task.id, taskDataPayload);
                savedTask = {
                    ...task,
                    ...taskDataPayload,
                    // In update, assigneeIds è undefined nel payload, quindi manteniamo quelli vecchi del task
                    assignees: task.assignees,
                    categories: boardCategories.filter(c => selectedCategoryIds.includes(c.id.toString())),
                    comments: comments.length,
                    attachments: attachments.length
                };
            } else if (boardId) {
                // CREATE
                // Qui TypeScript potrebbe lamentarsi se assigneeIds è opzionale nel payload ma obbligatorio in create.
                // Forziamo l'array vuoto se undefined (anche se sopra abbiamo gestito la logica).
                const createPayload = {
                    ...taskDataPayload,
                    assigneeIds: currentAssigneeIds || []
                };

                const created = await TaskModel.createTask(boardId, createPayload);

                savedTask = {
                    id: String(created.id),
                    title: created.title,
                    description: created.description,
                    priority: created.priority as PriorityLevel,
                    columnId: created.column_id as ColumnId,
                    dueDate: new Date(created.due_date),
                    categories: boardCategories.filter(c => selectedCategoryIds.includes(c.id.toString())),
                    // Popoliamo ottimisticamente l'assignee per vederlo subito nella card
                    assignees: user ? [{
                        id: user.id,
                        name: user.name || '',
                        surname: user.surname || '',
                        avatar_url: user.avatar_url || '',
                        email: user.email || ''
                    }] : [],
                    comments: 0,
                    attachments: 0,
                };
            }

            if (savedTask) onSave(savedTask);
            onClose();
        } catch (error) {
            console.error("Salvataggio fallito", error);
            alert("Errore salvataggio.");
        } finally {
            setIsSaving(false);
        }
    };

    // --- COMMENTI ---
    const handleSendComment = async () => {
        if (!newComment.trim()) return;
        if (isEdit && task) {
            const added = await TaskModel.addComment(task.id, newComment);
            setComments([...comments, added]);
        } else {
            alert("Devi prima creare il task per commentare.");
        }
        setNewComment('');
    };

    // --- ALLEGATI ---
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const file = files[0];
            if (isEdit && task) {
                try {
                    const uploaded = await TaskModel.uploadAttachment(task.id, file);
                    const newAttachments = await TaskModel.getAttachments(task.id);
                    setAttachments(newAttachments);
                } catch (e) {
                    console.error(e);
                    alert("Errore upload");
                }
            } else {
                alert("Devi prima creare il task per allegare file.");
            }
        }
    };

    const handleDeleteAttachment = async (fileId: number, path: string) => {
        if(!confirm("Sei sicuro di voler eliminare questo allegato?")) return;

        if (isEdit && task) {
            await TaskModel.deleteAttachment(fileId, path);
            setAttachments(prev => prev.filter(a => a.id !== fileId));
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-5xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col h-[90vh]">

                {/* --- OVERLAY CONFERMA ELIMINAZIONE TASK --- */}
                {showDeleteConfirm && (
                    <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-200">
                        <div className="bg-red-50 p-4 rounded-full mb-4">
                            <AlertTriangle className="w-8 h-8 text-red-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Eliminare questo task?</h3>
                        <p className="text-slate-500 text-center max-w-xs mb-8">
                            L&apos;azione è irreversibile. Tutti i commenti e gli allegati verranno rimossi permanentemente.
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
                                disabled={isDeleting}
                            >
                                Annulla
                            </button>
                            <button
                                onClick={confirmDeleteTask}
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
                )}

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white z-10">
                    <div className="flex items-center gap-2 text-slate-500">
                        <Layout className="w-5 h-5" />
                        <span className="text-sm font-medium">
                            {isEdit ? `Modifica Task / ${task?.id}` : 'Crea Nuovo Task'}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        {isEdit && onDelete && task && (
                            <button
                                onClick={requestDelete}
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                title="Elimina Task"
                                disabled={isSaving}
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

                {/* Body: Layout a 2 Colonne */}
                <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">

                    {/* COLONNA SINISTRA: Form Dati */}
                    <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar border-b lg:border-b-0 lg:border-r border-slate-100">
                        <form id="task-form" onSubmit={handleSave} className="space-y-8">

                            {/* Titolo */}
                            <input
                                type="text"
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full text-2xl font-bold text-slate-900 placeholder:text-slate-300 border-none focus:ring-0 focus:outline-none p-0 bg-transparent"
                                placeholder={isEdit ? "Titolo del task" : "Cosa devi fare?"}
                                autoFocus
                                disabled={isSaving}
                            />

                            {/* Metadati */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {/* Priorità */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4" /> Priorità
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {allPriorities.map((p) => (
                                            <button
                                                key={p}
                                                type="button"
                                                onClick={() => setPriority(p)}
                                                disabled={isSaving}
                                                className={`
                                                    px-3 py-1.5 rounded-lg text-xs font-bold border transition-all
                                                    ${priority === p
                                                    ? getPriorityStyles(p) + ' ring-2 ring-offset-1 ring-slate-200'
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
                                        value={dueDate}
                                        onChange={(e) => setDueDate(e.target.value)}
                                        disabled={isSaving}
                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    />
                                </div>

                                {/* Colonna (Solo Create) */}
                                {!isEdit && (
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                            <Columns className="w-4 h-4" /> Stato Iniziale
                                        </label>
                                        <select
                                            value={targetColumn}
                                            onChange={(e) => setTargetColumn(e.target.value as ColumnId)}
                                            disabled={isSaving}
                                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        >
                                            {columnOptions.map(opt => (
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
                                        const isSelected = selectedCategoryIds.includes(cat.id.toString());
                                        const themeClass = themeCategoryOptions.find(opt => opt.value === cat.color)?.class || 'bg-slate-200';

                                        return (
                                            <button
                                                key={cat.id}
                                                type="button"
                                                onClick={() => toggleCategory(cat.id.toString())}
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
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    disabled={isSaving}
                                    placeholder="Descrivi il task..."
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm text-slate-700 resize-none bg-slate-50/50 focus:bg-white"
                                />
                            </div>

                            {/* Allegati */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                        <Paperclip className="w-4 h-4" /> Allegati ({attachments.length})
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
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
                                        onChange={handleFileUpload}
                                    />
                                </div>

                                {attachments.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {attachments.map((file) => (
                                            <div key={file.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:shadow-sm transition-all group">
                                                <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                                                    <FileText className="w-5 h-5" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-slate-700 truncate">{file.name}</p>
                                                    <p className="text-xs text-slate-400">{(file.file_size / 1024).toFixed(1)} KB</p>
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
                                                        onClick={() => handleDeleteAttachment(file.id, file.file_path)}
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
                        </form>
                    </div>

                    {/* COLONNA DESTRA: Commenti */}
                    <div className="w-full lg:w-1/3 bg-slate-50 flex flex-col h-full border-l border-slate-200">
                        <div className="p-4 border-b border-slate-200 bg-slate-50/80 backdrop-blur-sm sticky top-0">
                            <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                <MessageSquare className="w-4 h-4" /> Attività & Commenti
                            </h3>
                        </div>

                        {/* Lista Commenti */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                            {!isEdit ? (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center p-6">
                                    <MessageSquare className="w-10 h-10 mb-2 opacity-20" />
                                    <p className="text-xs">
                                        Potrai aggiungere commenti e file dopo aver creato il task.
                                    </p>
                                </div>
                            ) : comments.length === 0 ? (
                                <p className="text-center text-slate-400 text-xs py-10">
                                    Nessun commento ancora. Scrivi qualcosa!
                                </p>
                            ) : (
                                comments.map((comment) => (
                                    <div key={comment.id} className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0 overflow-hidden">
                                            {comment.author.avatar_url ? (
                                                <img src={comment.author.avatar_url} alt="Av" className="w-full h-full object-cover" />
                                            ) : (
                                                comment.author.name.charAt(0)
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-sm font-bold text-slate-800 truncate">{comment.author.name}</span>
                                                <span className="text-[10px] text-slate-400">
                                                    {new Date(comment.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <div className="text-sm text-slate-600 bg-white p-3 rounded-r-xl rounded-bl-xl shadow-sm border border-slate-200">
                                                {comment.text}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Input Commento (Solo in Edit) */}
                        {isEdit && (
                            <div className="p-4 bg-white border-t border-slate-200">
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSendComment()}
                                        placeholder="Scrivi un commento..."
                                        disabled={isSaving}
                                        className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    />
                                    <button
                                        onClick={handleSendComment}
                                        disabled={!newComment.trim() || isSaving}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
                                    >
                                        <Send className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
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
                        disabled={!title.trim() || isSaving}
                        className="px-6 py-2 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg shadow-slate-900/10 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Salvataggio...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                {isEdit ? 'Salva Modifiche' : 'Crea Task'}
                            </>
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
}