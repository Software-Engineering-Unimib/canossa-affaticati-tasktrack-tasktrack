/**
 * @fileoverview Dialog di conferma logout.
 *
 * Mostra un prompt modale per confermare la disconnessione dell'utente.
 *
 * @module components/auth/LogoutDialog
 */

'use client';

import React from 'react';
import { LogOut } from 'lucide-react';

/**
 * Props del componente.
 */
interface LogoutDialogProps {
    /** Indica se il dialog è visibile */
    isOpen: boolean;
    /** Callback per chiudere il dialog */
    onClose: () => void;
    /** Callback per confermare il logout */
    onConfirm: () => void;
}

/**
 * Dialog di conferma logout.
 *
 * Pattern: Controlled Component
 * Lo stato di apertura è gestito dal componente padre.
 */
export default function LogoutDialog({
                                         isOpen,
                                         onClose,
                                         onConfirm
                                     }: LogoutDialogProps): React.ReactElement | null {
    if (!isOpen) return null;

    /**
     * Gestisce la conferma del logout.
     */
    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200"
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-dialog-title"
        >
            <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 text-center">
                    {/* Icona */}
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <LogOut className="w-6 h-6 text-red-600" aria-hidden="true" />
                    </div>

                    {/* Titolo */}
                    <h3
                        id="logout-dialog-title"
                        className="text-lg font-semibold text-gray-900 mb-2"
                    >
                        Conferma Logout
                    </h3>

                    {/* Descrizione */}
                    <p className="text-gray-500 text-sm mb-6">
                        Sei sicuro di voler uscire dal tuo account?
                    </p>

                    {/* Azioni */}
                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            Annulla
                        </button>
                        <button
                            onClick={handleConfirm}
                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                        >
                            Esci
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}