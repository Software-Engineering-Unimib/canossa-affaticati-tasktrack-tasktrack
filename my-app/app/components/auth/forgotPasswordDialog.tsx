/**
 * @fileoverview Dialog per il recupero password.
 *
 * Gestisce il flusso:
 * 1. Form inserimento email
 * 2. Stato di successo con conferma invio
 *
 * @module components/auth/forgotPasswordDialog
 */

'use client';

import React, { useState, useCallback } from 'react';
import { X, Mail, ArrowLeft, KeyRound, Loader2, CheckCircle } from 'lucide-react';

/**
 * Props del componente.
 */
interface ForgotPasswordDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

/**
 * Stato del dialog.
 */
type DialogState = 'form' | 'success';

/**
 * Dialog per il recupero password.
 */
export default function ForgotPasswordDialog({
                                                 isOpen,
                                                 onClose
                                             }: ForgotPasswordDialogProps): React.ReactElement | null {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [state, setState] = useState<DialogState>('form');

    if (!isOpen) return null;

    /**
     * Gestisce l'invio del form.
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // TODO: Implementare chiamata API reale
        await new Promise(resolve => setTimeout(resolve, 1500));

        setState('success');
        setIsLoading(false);
    };

    /**
     * Resetta lo stato e chiude il dialog.
     */
    const handleClose = useCallback(() => {
        setEmail('');
        setState('form');
        onClose();
    }, [onClose]);

    /**
     * Torna al form per correggere l'email.
     */
    const handleRetry = useCallback(() => {
        setState('form');
    }, []);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200"
            role="dialog"
            aria-modal="true"
        >
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-auto animate-in zoom-in-95 duration-200 overflow-hidden">
                {/* Tasto chiudi */}
                <CloseButton onClick={handleClose} />

                {/* Contenuto */}
                {state === 'form' ? (
                    <FormState
                        email={email}
                        isLoading={isLoading}
                        onEmailChange={setEmail}
                        onSubmit={handleSubmit}
                        onBack={onClose}
                    />
                ) : (
                    <SuccessState
                        email={email}
                        onClose={handleClose}
                        onRetry={handleRetry}
                    />
                )}
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════
// COMPONENTI INTERNI
// ═══════════════════════════════════════════════════════════════════

/**
 * Pulsante di chiusura.
 */
function CloseButton({ onClick }: { onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors z-10"
            aria-label="Chiudi"
        >
            <X className="w-5 h-5" />
        </button>
    );
}

/**
 * Stato form di inserimento email.
 */
function FormState({
                       email,
                       isLoading,
                       onEmailChange,
                       onSubmit,
                       onBack,
                   }: {
    email: string;
    isLoading: boolean;
    onEmailChange: (value: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    onBack: () => void;
}) {
    return (
        <div className="p-8">
            {/* Icona */}
            <div className="flex justify-center mb-6">
                <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center">
                    <KeyRound className="w-7 h-7 text-blue-600" />
                </div>
            </div>

            {/* Header */}
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-900">
                    Password dimenticata?
                </h2>
                <p className="text-slate-500 mt-2 text-sm">
                    Nessun problema. Inserisci la tua email e ti invieremo le istruzioni per reimpostarla.
                </p>
            </div>

            {/* Form */}
            <form onSubmit={onSubmit} className="space-y-6">
                <div className="space-y-1.5">
                    <label
                        htmlFor="forgot-email"
                        className="text-sm font-semibold text-slate-700 ml-1"
                    >
                        Email
                    </label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <input
                            id="forgot-email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => onEmailChange(e.target.value)}
                            placeholder="nome@studenti.it"
                            disabled={isLoading}
                            className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm disabled:opacity-50"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading || !email}
                    className="w-full py-3 px-4 flex justify-center items-center bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-all disabled:opacity-50"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                            Invio in corso...
                        </>
                    ) : (
                        'Invia link di reset'
                    )}
                </button>
            </form>

            {/* Link torna indietro */}
            <div className="mt-6 text-center">
                <button
                    onClick={onBack}
                    className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Torna al login
                </button>
            </div>
        </div>
    );
}

/**
 * Stato di successo.
 */
function SuccessState({
                          email,
                          onClose,
                          onRetry,
                      }: {
    email: string;
    onClose: () => void;
    onRetry: () => void;
}) {
    return (
        <div className="p-8 text-center animate-in slide-in-from-right-4 duration-300">
            {/* Icona */}
            <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
            </div>

            {/* Testo */}
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Controlla la tua posta
            </h2>
            <p className="text-slate-500 mb-8 text-sm leading-relaxed">
                Abbiamo inviato un link per reimpostare la password a{' '}
                <br />
                <span className="font-semibold text-slate-900">{email}</span>
            </p>

            {/* Azioni */}
            <div className="space-y-3">
                <button
                    onClick={onClose}
                    className="w-full py-3 px-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all"
                >
                    Torna al Login
                </button>

                <button
                    onClick={onRetry}
                    className="text-sm text-slate-500 hover:text-blue-600 font-medium transition-colors"
                >
                    Non hai ricevuto l'email? Riprova
                </button>
            </div>
        </div>
    );
}