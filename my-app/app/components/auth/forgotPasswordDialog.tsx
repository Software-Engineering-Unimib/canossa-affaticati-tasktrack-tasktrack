'use client';

import React, { useState } from 'react';
import { X, Mail, ArrowLeft, KeyRound, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase'; 

interface ForgotPasswordDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ForgotPasswordDialog({ isOpen, onClose }: ForgotPasswordDialogProps) {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage(null);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/resetPassword`,
            });

            if (error) {
                setErrorMessage(error.message);
            } else {
                setIsSent(true);
            }
        } catch (err) {
            setErrorMessage("Si è verificato un errore imprevisto.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        setEmail('');
        setIsSent(false);
        setErrorMessage(null);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-auto animate-in zoom-in-95 duration-200 overflow-hidden">

                <button
                    onClick={handleReset}
                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors z-10"
                >
                    <X className="w-5 h-5" />
                </button>

                {!isSent ? (
                    <div className="p-8">
                        <div className="flex justify-center mb-6">
                            <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center">
                                <KeyRound className="w-7 h-7 text-blue-600" />
                            </div>
                        </div>

                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-slate-900">Password dimenticata?</h2>
                            <p className="text-slate-500 mt-2 text-sm">
                                Inserisci la tua email e ti invieremo le istruzioni per reimpostarla.
                            </p>
                        </div>

                        {/* --- MOSTRA ERRORI SE PRESENTI --- */}
                        {errorMessage && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 text-sm text-red-600">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                <span>{errorMessage}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700 ml-1">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="nome@studenti.it"
                                        className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 placeholder:text-slate-400"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading || !email}
                                className="w-full py-3 px-4 flex justify-center items-center bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-slate-900/10"
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

                        <div className="mt-6 text-center">
                            <button
                                onClick={onClose}
                                className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Torna al login
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="p-8 text-center animate-in slide-in-from-right-4 duration-300">
                        <div className="flex justify-center mb-6">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-8 h-8 text-green-600" />
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Controlla la tua posta</h2>
                        <p className="text-slate-500 mb-8 text-sm leading-relaxed">
                            Abbiamo inviato un link per reimpostare la password a <br/>
                            <span className="font-semibold text-slate-900">{email}</span>
                        </p>

                        <div className="space-y-3">
                            <button
                                onClick={onClose}
                                className="w-full py-3 px-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all"
                            >
                                Torna al Login
                            </button>

                            <button
                                onClick={() => setIsSent(false)}
                                className="text-sm text-slate-500 hover:text-blue-600 font-medium transition-colors"
                            >
                                Non hai ricevuto l'email? Riprova
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}