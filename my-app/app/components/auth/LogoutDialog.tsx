'use client';

import React from 'react';
import { LogOut, X } from 'lucide-react';

interface LogoutDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export default function LogoutDialog({ isOpen, onClose, onConfirm }: LogoutDialogProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
                    <div className="flex items-center gap-2 text-slate-800">
                        <div className="p-2 bg-red-100 rounded-lg text-red-600">
                            <LogOut className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-lg">Conferma Logout</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    <p className="text-slate-600 leading-relaxed">
                        Sei sicuro di voler uscire dal tuo account? <br/>
                        Dovrai effettuare nuovamente il login per accedere alle tue bacheche.
                    </p>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-slate-600 text-sm font-medium hover:bg-slate-200 rounded-lg transition-colors"
                    >
                        Annulla
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-6 py-2 bg-red-600 text-white text-sm font-bold rounded-lg hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 flex items-center gap-2"
                    >
                        <LogOut className="w-4 h-4" />
                        Disconnettiti
                    </button>
                </div>

            </div>
        </div>
    );
}