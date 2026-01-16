'use client';

import React from 'react';
import { LogOut } from 'lucide-react';

interface LogoutDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export default function LogoutDialog({ isOpen, onClose, onConfirm }: LogoutDialogProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 text-center">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <LogOut className="w-6 h-6 text-red-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Conferma Logout</h3>
                    <p className="text-gray-500 text-sm mb-6">
                        Sei sicuro di voler uscire dal tuo account?
                    </p>

                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            Annulla
                        </button>
                        <button
                            onClick={() => {
                                onConfirm(); // Chiama la funzione di logout reale
                                onClose();
                            }}
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