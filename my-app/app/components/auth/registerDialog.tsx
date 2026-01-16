'use client';

import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, Eye, EyeOff, User, Loader2, ArrowRight, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface RegisterDialogProps {
    isOpen: boolean;
    onClose: () => void;
    // Callback opzionale se vuoi fare qualcosa dopo il successo (es. redirect o mostrare un altro avviso)
    onRegisterSuccess?: () => void;
}

export default function RegisterDialog({ isOpen, onClose, onRegisterSuccess }: RegisterDialogProps) {
    // Stati del Form
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    // Stati di UI
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isSuccess, setIsSuccess] = useState(false); // Per mostrare lo stato di successo

    const resetForm = () => {
        setFormData({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' });
        setIsSuccess(false);
        setError('');
    };

    // Resetta il form quando il dialog viene chiuso
    useEffect(() => {
        if (!isOpen) {
            resetForm();
        }
    }, [isOpen]);

    // Se chiuso, non renderizzare
    if (!isOpen) return null;

    // Helper per aggiornare i campi
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError(''); // Pulisci errori mentre l'utente scrive
    };

    // Handler di sottomissione
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validazione Base
        if (formData.password !== formData.confirmPassword) {
            setError('Le password non coincidono.');
            return;
        }
        if (formData.password.length < 6) {
            setError('La password deve avere almeno 6 caratteri.');
            return;
        }
        // Qui potresti aggiungere regex per validare l'email studentesca

        setIsLoading(true);

        try {
            // 1. Registrazione con Supabase Auth (Gestisce le email e la sicurezza)
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        name: formData.firstName,
                        surname: formData.lastName,
                    },
                },
            });

            if (authError) {
                throw new Error(authError.message);
            }

            // Successo!
            setIsSuccess(true);
            if (onRegisterSuccess) onRegisterSuccess();

            // Chiudi automaticamente dopo un breve delay per mostrare il successo
            setTimeout(() => {
                onClose();
                resetForm();
            }, 3000);

        } catch (err) {
            console.error(err);
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Si è verificato un errore. Riprova più tardi.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // --- CONTENUTO DEL DIALOG ---
    // Stato di SUCCESSO
    if (isSuccess) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 text-center animate-in zoom-in-95 duration-200 flex flex-col items-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle className="w-8 h-8 text-green-600 animate-bounce" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Account Creato!</h2>
                    <p className="text-slate-500 mb-6">
                        Ti abbiamo inviato una email di conferma. <br/> Preparati ad organizzare il tuo studio.
                    </p>
                    <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                </div>
            </div>
        );
    }

    // Stato normale (FORM)
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200 overflow-y-auto">

            {/* Container Dialog */}
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-auto animate-in zoom-in-95 duration-200 my-8">

                {/* Tasto Chiudi */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors z-10"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="p-8 pt-10 pb-6">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-slate-900">Crea il tuo account</h2>
                        <p className="text-slate-500 mt-2 text-sm">
                            Inizia a gestire i tuoi esami con TaskTrack.
                        </p>
                    </div>

                    {/* Messaggio di Errore */}
                    {error && (
                        <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm font-medium text-center animate-in slide-in-from-top-2">
                            {error}
                        </div>
                    )}

                    {/* FORM */}
                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* Nome e Cognome (Griglia su desktop) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-slate-700 ml-1">Nome</label>
                                <div className="relative"> 
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                    <input
                                        name="firstName"
                                        type="text"
                                        required
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        placeholder="Mario"
                                        className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    />
                                </div>
                            </div>
                                        
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-slate-700 ml-1">Cognome</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                    <input
                                        name="lastName"
                                        type="text"
                                        required
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        placeholder="Rossi"
                                        className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-slate-700 ml-1">Email Istituzionale</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="m.rossi@studenti.uni.it"
                                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-slate-700 ml-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <input
                                    autoComplete="new-password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Almeno 8 caratteri"
                                    className="block w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Conferma Password */}
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-slate-700 ml-1">Conferma Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <input
                                    autoComplete="new-password"
                                    name="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    required
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Ripeti la password"
                                    className="block w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                                >
                                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Termini e Condizioni (Opzionale) */}
                        <div className="flex items-start">
                            <div className="flex items-center h-5">
                                <input
                                    id="terms"
                                    type="checkbox"
                                    required
                                    className="w-4 h-4 border border-slate-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300 text-blue-600"
                                />
                            </div>
                            <label htmlFor="terms" className="ml-2 text-xs text-slate-500">
                                Accetto i <Link href="/terms" className="text-blue-600 hover:underline">Termini di Servizio</Link> e la <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>.
                            </label>
                        </div>


                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-2 shadow-lg shadow-slate-900/20"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Registrati ora
                                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Footer Login Link */}
                    <div className="text-center mt-6 text-sm text-slate-600">
                        Hai già un account?{' '}
                        <button onClick={onClose} className="font-semibold text-blue-600 hover:text-blue-500 hover:underline">
                            Accedi invece
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}