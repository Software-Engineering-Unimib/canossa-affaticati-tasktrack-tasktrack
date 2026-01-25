/**
 * @fileoverview Dialog di registrazione utente.
 *
 * Gestisce il flusso completo di registrazione con validazione.
 *
 * @module components/auth/registerDialog
 */

'use client';

import React, { useState, useCallback } from 'react';
import { X, Mail, Lock, Eye, EyeOff, User, Loader2, ArrowRight, CheckCircle } from 'lucide-react';
import Link from 'next/link';

/**
 * Props del componente.
 */
interface RegisterDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onRegisterSuccess?: () => void;
}

/**
 * Stato del form di registrazione.
 */
interface FormData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
}

/**
 * Stato iniziale del form.
 */
const INITIAL_FORM_DATA: FormData = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
};

/**
 * Lunghezza minima della password.
 */
const MIN_PASSWORD_LENGTH = 8;

/**
 * Messaggi di errore.
 */
const ERROR_MESSAGES = {
    PASSWORD_MISMATCH: 'Le password non coincidono.',
    PASSWORD_TOO_SHORT: `La password deve avere almeno ${MIN_PASSWORD_LENGTH} caratteri.`,
    GENERIC_ERROR: 'Si è verificato un errore. Riprova più tardi.',
} as const;

/**
 * Dialog di registrazione.
 */
export default function RegisterDialog({
                                           isOpen,
                                           onClose,
                                           onRegisterSuccess
                                       }: RegisterDialogProps): React.ReactElement | null {


    // Form state
    const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);

    // UI state
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    /**
     * Aggiorna un campo del form.
     */
    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
    }, []);

    /**
     * Valida il form.
     */
    const validateForm = useCallback((): string | null => {
        if (formData.password !== formData.confirmPassword) {
            return ERROR_MESSAGES.PASSWORD_MISMATCH;
        }
        if (formData.password.length < MIN_PASSWORD_LENGTH) {
            return ERROR_MESSAGES.PASSWORD_TOO_SHORT;
        }
        return null;
    }, [formData.password, formData.confirmPassword]);

    /**
     * Resetta il form e chiude il dialog.
     */
    const handleClose = useCallback(() => {
        setFormData(INITIAL_FORM_DATA);
        setIsSuccess(false);
        setError('');
        onClose();
    }, [onClose]);

    /**
     * Gestisce l'invio del form.
     */
    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        setIsLoading(true);

        try {
            // TODO: Implementare chiamata API reale
            await new Promise(resolve => setTimeout(resolve, 2000));

            setIsSuccess(true);
            onRegisterSuccess?.();

            // Auto-chiusura dopo successo
            setTimeout(() => {
                handleClose();
            }, 2000);
        } catch {
            setError(ERROR_MESSAGES.GENERIC_ERROR);
        } finally {
            setIsLoading(false);
        }
    }, [validateForm, onRegisterSuccess, handleClose]);

    /**
     * Toggle visibilità password.
     */
    const togglePasswordVisibility = useCallback(() => {
        setShowPassword(prev => !prev);
    }, []);

    /**
     * Toggle visibilità conferma password.
     */
    const toggleConfirmPasswordVisibility = useCallback(() => {
        setShowConfirmPassword(prev => !prev);
    }, []);

    // ═══════════════════════════════════════════════════════════
    // EARLY RETURN DOPO TUTTI GLI HOOKS
    // ═══════════════════════════════════════════════════════════

    if (!isOpen) return null;

    // Render success state
    if (isSuccess) {
        return <SuccessOverlay />;
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200 overflow-y-auto"
            role="dialog"
            aria-modal="true"
        >
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-auto animate-in zoom-in-95 duration-200 my-8">
                {/* Tasto chiudi */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors z-10"
                    aria-label="Chiudi"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="p-8 pt-10 pb-6">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-slate-900">
                            Crea il tuo account
                        </h2>
                        <p className="text-slate-500 mt-2 text-sm">
                            Inizia a gestire i tuoi esami con TaskTrack.
                        </p>
                    </div>

                    {/* Errore */}
                    {error && <ErrorAlert message={error} />}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Nome e Cognome */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <TextInput
                                name="firstName"
                                label="Nome"
                                placeholder="Mario"
                                value={formData.firstName}
                                onChange={handleChange}
                                icon={User}
                                required
                            />
                            <TextInput
                                name="lastName"
                                label="Cognome"
                                placeholder="Rossi"
                                value={formData.lastName}
                                onChange={handleChange}
                                icon={User}
                                required
                            />
                        </div>

                        {/* Email */}
                        <TextInput
                            name="email"
                            label="Email Istituzionale"
                            type="email"
                            placeholder="m.rossi@studenti.uni.it"
                            value={formData.email}
                            onChange={handleChange}
                            icon={Mail}
                            required
                        />

                        {/* Password */}
                        <PasswordInput
                            name="password"
                            label="Password"
                            placeholder="Almeno 8 caratteri"
                            value={formData.password}
                            onChange={handleChange}
                            showPassword={showPassword}
                            onToggle={togglePasswordVisibility}
                        />

                        {/* Conferma Password */}
                        <PasswordInput
                            name="confirmPassword"
                            label="Conferma Password"
                            placeholder="Ripeti la password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            showPassword={showConfirmPassword}
                            onToggle={toggleConfirmPasswordVisibility}
                        />

                        {/* Termini */}
                        <TermsCheckbox />

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-all disabled:opacity-70"
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

                    {/* Footer */}
                    <div className="text-center mt-6 text-sm text-slate-600">
                        Hai già un account?{' '}
                        <button
                            onClick={handleClose}
                            className="font-semibold text-blue-600 hover:text-blue-500 hover:underline"
                        >
                            Accedi invece
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════
// COMPONENTI INTERNI
// ═══════════════════════════════════════════════════════════════════

/**
 * Overlay di successo.
 */
function SuccessOverlay() {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 text-center animate-in zoom-in-95 duration-200 flex flex-col items-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600 animate-bounce" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                    Account Creato!
                </h2>
                <p className="text-slate-500 mb-6">
                    Ti abbiamo inviato una email di conferma.
                    <br />
                    Preparati ad organizzare il tuo studio.
                </p>
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
            </div>
        </div>
    );
}

/**
 * Alert di errore.
 */
function ErrorAlert({ message }: { message: string }) {
    return (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm font-medium text-center animate-in slide-in-from-top-2">
            {message}
        </div>
    );
}

/**
 * Input testuale con icona.
 */
function TextInput({
                       name,
                       label,
                       type = 'text',
                       placeholder,
                       value,
                       onChange,
                       icon: Icon,
                       required = false,
                   }: {
    name: string;
    label: string;
    type?: string;
    placeholder: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    icon: React.ElementType;
    required?: boolean;
}) {
    return (
        <div className="space-y-1">
            <label
                htmlFor={name}
                className="text-sm font-semibold text-slate-700 ml-1"
            >
                {label}
            </label>
            <div className="relative">
                <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                    id={name}
                    name={name}
                    type={type}
                    required={required}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                />
            </div>
        </div>
    );
}

/**
 * Input password con toggle visibilità.
 */
function PasswordInput({
                           name,
                           label,
                           placeholder,
                           value,
                           onChange,
                           showPassword,
                           onToggle,
                       }: {
    name: string;
    label: string;
    placeholder: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    showPassword: boolean;
    onToggle: () => void;
}) {
    return (
        <div className="space-y-1">
            <label
                htmlFor={name}
                className="text-sm font-semibold text-slate-700 ml-1"
            >
                {label}
            </label>
            <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                    id={name}
                    name={name}
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className="block w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                />
                <button
                    type="button"
                    onClick={onToggle}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                    aria-label={showPassword ? 'Nascondi password' : 'Mostra password'}
                >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
            </div>
        </div>
    );
}

/**
 * Checkbox termini e condizioni.
 */
function TermsCheckbox() {
    return (
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
                Accetto i{' '}
                <Link href="/terms" className="text-blue-600 hover:underline">
                    Termini di Servizio
                </Link>{' '}
                e la{' '}
                <Link href="/privacy" className="text-blue-600 hover:underline">
                    Privacy Policy
                </Link>
            </label>
        </div>
    );
}