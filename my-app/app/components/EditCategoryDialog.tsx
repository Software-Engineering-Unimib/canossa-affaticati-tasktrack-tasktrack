'use client';

import React, { useState, useEffect } from 'react';
import { X, Check, Loader2, Save } from 'lucide-react';

interface CategoryStats {
  total: number;
  completed: number;
}

interface Category {
  id: string;
  name: string;
  color: string;
  description: string;
  stats: CategoryStats;
}

interface EditCategoryDialogProps {
  isOpen: boolean;
  initialData: Category | null;
  onClose: () => void;
  onUpdate: (updatedData: Category) => void;
  onDelete: (id: string) => void;
}

// Configurazione colori per il selettore
const colorOptions: { value: string; label: string; class: string }[] = [
  { value: 'bg-red-500', label: 'Rosso', class: 'bg-red-500' },
  { value: 'bg-blue-500', label: 'Blu', class: 'bg-blue-500' },
  { value: 'bg-green-500', label: 'Verde', class: 'bg-green-500' },
  { value: 'bg-yellow-500', label: 'Giallo', class: 'bg-yellow-500' },
  { value: 'bg-purple-500', label: 'Viola', class: 'bg-purple-500' },
  { value: 'bg-pink-500', label: 'Rosa', class: 'bg-pink-500' },
  { value: 'bg-orange-500', label: 'Arancione', class: 'bg-orange-500' },
  { value: 'bg-teal-500', label: 'Teal', class: 'bg-teal-500' },
];

export default function EditCategoryDialog({
  isOpen,
  initialData,
  onClose,
  onUpdate,
  onDelete,
}: EditCategoryDialogProps) {
  // Stati del Form
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState('bg-red-500');

  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  // Controlla se ci sono modifiche rispetto ai dati iniziali
  const hasChanges = initialData && (
    name !== initialData.name.trim() || 
    description !== (initialData.description || '') ||
    selectedColor !== initialData.color
  );

  // --- EFFETTO DI SINCRONIZZAZIONE ---
  useEffect(() => {
    if (isOpen && initialData) {
      setName(initialData.name);
      setDescription(initialData.description || '');
      setSelectedColor(initialData.color);
      setShowDeleteConfirm(false);
    }
  }, [isOpen, initialData]);

  if (!isOpen || !initialData) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simula una chiamata API
    await new Promise(resolve => setTimeout(resolve, 1000));

    const updatedCategory: Category = {
      ...initialData,
      name: name.trim(),
      description: description.trim(),
      color: selectedColor,
    };

    onUpdate(updatedCategory);
    setIsLoading(false);
    onClose();
  };

  const handleDeleteClick = () => {
    onDelete(initialData.id);
    setShowDeleteConfirm(false);
    onClose();
  };

  const handleCancelClick = () => {
    if (hasChanges) {
      setShowDiscardConfirm(true);
    } else {
      onClose();
    }
  };

  const handleDiscardChanges = () => {
    setShowDiscardConfirm(false);
    onClose();
  };

  return (
    // Overlay Sfondo Scuro
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">

      {/* Contenitore Dialog */}
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">Modifica Categoria</h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">

          {/* 1. Nome e Descrizione */}
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-1">
                Nome Categoria <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Es. Lavoro, Università..."
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
              />
            </div>

            <div>
              <label htmlFor="desc" className="block text-sm font-semibold text-slate-700 mb-1">
                Descrizione <span className="text-slate-400 font-normal">(Opzionale)</span>
              </label>
              <textarea
                id="desc"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A cosa serve questa categoria?"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm resize-none"
              />
            </div>
          </div>

          {/* 2. Colore */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              Scegli un colore
            </label>
            <div className="flex gap-3 flex-wrap">
              {colorOptions.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setSelectedColor(color.value)}
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-105 focus:outline-none ring-2 ring-offset-2
                    ${color.class}
                    ${selectedColor === color.value ? 'ring-slate-400 scale-110 shadow-md' : 'ring-transparent'}
                  `}
                  title={color.label}
                >
                  {selectedColor === color.value && (
                    <Check className="w-5 h-5 text-white stroke-[3]" />
                  )}
                </button>
              ))}
            </div>
          </div>
handleCancelClick
          {/* Footer Bottoni */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-50">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="px-5 py-2.5 text-red-600 text-sm font-medium hover:bg-red-50 rounded-xl transition-colors"
            >
              Elimina
            </button>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleCancelClick}
                className="px-5 py-2.5 text-slate-600 text-sm font-medium hover:bg-slate-50 rounded-xl transition-colors"
              >
                Annulla
              </button>
              <button
                type="submit"
                disabled={isLoading || !name}
                className="px-6 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Save className="w-4 h-4" />
                            )}
                            <span>Salva Modifiche</span>
              </button>
            </div>
          </div>

        </form>
      </div>

      {/* Dialog di conferma eliminazione */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Eliminare categoria?</h3>
            <p className="text-slate-600 mb-6">
              Questa azione è irreversibile. Sei sicuro di voler eliminare la categoria "<strong>{initialData.name}</strong>"?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2.5 text-slate-600 text-sm font-medium hover:bg-slate-50 rounded-xl transition-colors"
              >
                Annulla
              </button>
              <button
                onClick={handleDeleteClick}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition-colors"
              >
                Elimina
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dialog di conferma scarto modifiche */}
      {showDiscardConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Scartare modifiche?</h3>
            <p className="text-slate-600 mb-6">
              Le modifiche andranno perse. Sei sicuro di voler continuare?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDiscardConfirm(false)}
                className="flex-1 px-4 py-2.5 text-slate-600 text-sm font-medium hover:bg-slate-50 rounded-xl transition-colors"
              >
                Continua
              </button>
              <button
                onClick={handleDiscardChanges}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition-colors"
              >
                Scarta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
