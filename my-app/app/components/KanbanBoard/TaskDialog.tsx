'use client';

import React, { useState, useEffect, useRef } from 'react';
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
    MessageSquare,
    Send,
    FileText,
    UploadCloud,
    Columns
} from 'lucide-react';
import { Task, ColumnId } from '@/items/Task';
import { PriorityLevel, getPriorityStyles } from '@/items/Priority';
import { Category, themeCategoryOptions } from '@/items/Category';

// --- TIPI LOCALI ---
interface Attachment {
    id: string;
    name: string;
    size: string;
    type: string;
}

interface Comment {
    id: string;
    author: string;
    text: string;
    date: Date;
    initials: string;
}

// --- PROPS UNIFICATE ---
interface TaskDialogProps {
    isOpen: boolean;
    mode: 'create' | 'edit';
    task?: Task | null; // Richiesto se mode === 'edit'
    initialColumnId?: ColumnId; // Utile per mode === 'create'
    boardCategories: Category[];
    onClose: () => void;
    onSave: (task: Task) => void;
    onDelete?: (taskId: string) => void; // Richiesto se mode === 'edit'
}

const allPriorities: PriorityLevel[] = ['Bassa', 'Media', 'Alta', 'Urgente'];

const columnOptions: { id: ColumnId; label: string }[] = [
    { id: 'todo', label: 'Da Fare' },
    { id: 'inprogress', label: 'In Corso' },
    { id: 'done', label: 'Completato' },
];

export default function TaskDialog({
                                       isOpen,
                                       mode,
                                       task,
                                       initialColumnId = 'todo',
                                       boardCategories,
                                       onClose,
                                       onSave,
                                       onDelete
                                   }: TaskDialogProps) {

    // --- STATI FORM ---
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState<PriorityLevel>('Media');
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
    const [dueDate, setDueDate] = useState<string>('');
    const [targetColumn, setTargetColumn] = useState<ColumnId>('todo');

    // --- STATI ACCESSORI ---
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');

    const fileInputRef = useRef<HTMLInputElement>(null);

    // --- INIZIALIZZAZIONE ---
    useEffect(() => {
        if (!isOpen) return;

        if (mode === 'edit' && task) {
            // -- POPOLAMENTO PER EDIT --
            setTitle(task.title);
            setDescription(task.description || '');
            setPriority(task.priority);
            setSelectedCategoryIds(task.categories.map(c => c.id.toString()));
            setTargetColumn(task.columnId);

            const d = new Date(task.dueDate);
            setDueDate(!isNaN(d.getTime()) ? d.toISOString().split('T')[0] : '');

            // MOCK DATI PER EDIT (Simulazione dati esistenti)
            setComments([
                { id: 'c1', author: 'Marco Rossi', text: 'Ho iniziato a lavorare su questo.', date: new Date(Date.now() - 86400000), initials: 'MR' },
                { id: 'c2', author: 'Luca Bianchi', text: 'Ricordati di controllare i requisiti.', date: new Date(Date.now() - 3600000), initials: 'LB' }
            ]);

            // Mock allegati se il contatore nel task > 0
            if (task.attachments > 0) {
                setAttachments([{ id: 'f1', name: 'Documentazione.pdf', size: '2.4 MB', type: 'pdf' }]);
            } else {
                setAttachments([]);
            }

        } else {
            // -- RESET PER CREATE --
            setTitle('');
            setDescription('');
            setPriority('Media');
            setSelectedCategoryIds([]);
            setTargetColumn(initialColumnId); // Default colonna
            setDueDate('');
            setAttachments([]);
            setComments([]);
            setNewComment('');
        }
    }, [isOpen, mode, task, initialColumnId]);

    if (!isOpen) return null;

    // --- HANDLERS ---

    const toggleCategory = (catId: string) => {
        setSelectedCategoryIds(prev =>
            prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId]
        );
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const newFile = files[0];
            const attachment: Attachment = {
                id: `file-${Date.now()}`,
                name: newFile.name,
                size: `${(newFile.size / 1024 / 1024).toFixed(2)} MB`,
                type: newFile.name.split('.').pop() || 'file'
            };
            setAttachments([...attachments, attachment]);
        }
    };

    const handleDeleteAttachment = (fileId: string) => {
        setAttachments(prev => prev.filter(f => f.id !== fileId));
    };

    const handleSendComment = () => {
        if (!newComment.trim()) return;
        const comment: Comment = {
            id: `new-${Date.now()}`,
            author: 'Tu',
            text: newComment,
            date: new Date(),
            initials: 'TU'
        };
        setComments([...comments, comment]);
        setNewComment('');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const selectedCategories = boardCategories.filter(c => selectedCategoryIds.includes(c.id.toString()));

        let taskToSave: Task;

        if (mode === 'edit' && task) {
            // AGGIORNAMENTO
            taskToSave = {
                ...task,
                title,
                description,
                priority,
                categories: selectedCategories,
                dueDate: new Date(dueDate),
                // Nota: In Edit di solito non si cambia colonna dal dialog, ma se volessi potresti usare targetColumn
                // columnId: task.columnId,
                comments: comments.length,
                attachments: attachments.length
            };
        } else {
            // CREAZIONE
            taskToSave = {
                id: `t-${Date.now()}`,
                title,
                description,
                priority,
                categories: selectedCategories,
                columnId: targetColumn,
                dueDate: dueDate ? new Date(dueDate) : new Date(),
                comments: comments.length,
                attachments: attachments.length,
                assignees: []
            };
        }

        onSave(taskToSave);
        onClose();
    };

    // --- LOGICA UI CONDIZIONALE ---
    const isEdit = mode === 'edit';
    const dialogTitle = isEdit ? `Modifica Task / ${task?.id}` : 'Crea Nuovo Task';
    const submitLabel = isEdit ? 'Salva Modifiche' : 'Crea Task';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col h-[90vh]">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white z-10">
                    <div className="flex items-center gap-2 text-slate-500">
                        <Layout className="w-5 h-5" />
                        <span className="text-sm font-medium">{dialogTitle}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Mostra bottone Elimina solo in Edit Mode */}
                        {isEdit && onDelete && task && (
                            <button
                                onClick={() => { onDelete(task.id); onClose(); }}
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                title="Elimina Task"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        )}
                        <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Body a 2 Colonne */}
                <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">

                    {/* COLONNA SINISTRA: Form */}
                    <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar border-b lg:border-b-0 lg:border-r border-slate-100">
                        <form id="task-dialog-form" onSubmit={handleSubmit} className="space-y-8">

                            {/* Titolo */}
                            <input
                                type="text"
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full text-2xl font-bold text-slate-900 placeholder:text-slate-300 border-none focus:ring-0 focus:outline-none p-0 bg-transparent"
                                placeholder={isEdit ? "Titolo del task..." : "Cosa devi fare?"}
                                autoFocus={!isEdit}
                            />

                            {/* Griglia Metadati */}
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

                                {/* Colonna (Solo per Create Mode, o se vuoi abilitarlo anche in Edit) */}
                                {!isEdit && (
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                            <Columns className="w-4 h-4" /> Stato Iniziale
                                        </label>
                                        <select
                                            value={targetColumn}
                                            onChange={(e) => setTargetColumn(e.target.value as ColumnId)}
                                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        >
                                            {columnOptions.map(opt => (
                                                <option key={opt.id} value={opt.id}>{opt.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {/* Scadenza */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                        <Calendar className="w-4 h-4" /> Scadenza
                                    </label>
                                    <input
                                        type="date"
                                        value={dueDate}
                                        onChange={(e) => setDueDate(e.target.value)}
                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    />
                                </div>

                                {/* Categorie */}
                                <div className="space-y-2 col-span-1 sm:col-span-2">
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
                                    placeholder={isEdit ? "Aggiungi dettagli..." : "Descrivi il task..."}
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
                                        className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium"
                                    >
                                        <UploadCloud className="w-3 h-3" />
                                        Carica file
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
                                                    <p className="text-xs text-slate-400">{file.size} • {file.type.toUpperCase()}</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteAttachment(file.id)}
                                                    className="p-1.5 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
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
                            {comments.length === 0 ? (
                                <p className="text-center text-slate-400 text-xs py-10">
                                    {isEdit ? "Nessun commento ancora." : "Nessun commento."} <br/>
                                    {isEdit ? "Scrivi qualcosa!" : "Aggiungine uno prima di creare il task."}
                                </p>
                            ) : (
                                comments.map((comment) => (
                                    <div key={comment.id} className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
                                            {comment.initials}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-sm font-bold text-slate-800">{comment.author}</span>
                                                <span className="text-[10px] text-slate-400">
                                                    {comment.date.toLocaleDateString()} {comment.date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
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

                        {/* Input Area */}
                        <div className="p-4 bg-white border-t border-slate-200">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendComment()}
                                    placeholder={isEdit ? "Scrivi un commento..." : "Aggiungi un commento..."}
                                    className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                />
                                <button
                                    onClick={handleSendComment}
                                    disabled={!newComment.trim()}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-100 bg-white flex justify-end gap-3 z-10">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-slate-600 text-sm font-medium hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        Annulla
                    </button>
                    <button
                        type="submit"
                        form="task-dialog-form"
                        disabled={!title.trim()}
                        className="px-6 py-2 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg shadow-slate-900/10 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Save className="w-4 h-4" />
                        {submitLabel}
                    </button>
                </div>

            </div>
        </div>
    );
}