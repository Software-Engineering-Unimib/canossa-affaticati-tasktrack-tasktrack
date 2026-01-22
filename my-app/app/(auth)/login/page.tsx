/**
 * @fileoverview Pagina di login dell'applicazione.
 *
 * Fornisce:
 * - Form login con email/password
 * - Placeholder per social login
 * - Link a registrazione e recupero password
 *
 * @module pages/login
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
    Mail,
    Lock,
    Eye,
    EyeOff,
    ArrowRight,
    Loader2,
    AlertCircle
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import RegisterDialog from '@/app/components/auth/registerDialog';
import ForgotPasswordDialog from '@/app/components/auth/forgotPasswordDialog';

/**
 * Messaggi di errore localizzati.
 */
const ERROR_MESSAGES: Record<string, string> = {
    'Invalid login credentials': 'Credenziali non valide',
};

/**
 * Traduce un messaggio di errore Supabase.
 */
function translateError(message: string): string {
    return ERROR_MESSAGES[message] ?? message;
}

/**
 * Pagina di login.
 */
export default function LoginPage() {
    const router = useRouter();

    // Form state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // UI state
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Dialog state
    const [isRegisterOpen, setIsRegisterOpen] = useState(false);
    const [isForgotOpen, setIsForgotOpen] = useState(false);

    /**
     * Reset campi al mount.
     */
    useEffect(() => {
        setEmail('');
        setPassword('');
    }, []);

    /**
     * Gestisce il login.
     */
    const handleLogin = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const { error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) {
                throw new Error(translateError(authError.message));
            }

            // Aggiorna la vista server e naviga
            router.refresh();
            router.push('/dashboard');
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Errore durante il login';
            setError(message);
            setIsLoading(false);
        }
    }, [email, password, router]);

    /**
     * Placeholder per social login.
     */
    const handleSocialLogin = useCallback(() => {
        alert('Funzionalità Social Login in arrivo presto!');
    }, []);

    /**
     * Callback successo registrazione.
     */
    const handleRegisterSuccess = useCallback(() => {
        setError(null);
        alert('Registrazione avvenuta! Controlla la tua email.');
    }, []);

    return (
        <div className="min-h-screen flex bg-gray-50">
            {/* Sezione sinistra - Branding */}
            <BrandingSection />

            {/* Sezione destra - Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 bg-white">
                <div className="w-full max-w-md space-y-8">
                    {/* Logo mobile */}
                    <MobileLogo />

                    {/* Header */}
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-gray-900">
                            Bentornato! 👋
                        </h1>
                        <p className="mt-2 text-gray-500">
                            Inserisci le tue credenziali per accedere al Workspace.
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleLogin} className="mt-8 space-y-6" autoComplete="off">
                        {/* Email */}
                        <EmailInput
                            value={email}
                            onChange={setEmail}
                            disabled={isLoading}
                        />

                        {/* Password */}
                        <PasswordInput
                            value={password}
                            onChange={setPassword}
                            showPassword={showPassword}
                            onToggleShow={() => setShowPassword(prev => !prev)}
                            onForgotClick={() => setIsForgotOpen(true)}
                            disabled={isLoading}
                        />

                        {/* Errore */}
                        {error && <ErrorMessage message={error} />}

                        {/* Submit */}
                        <SubmitButton isLoading={isLoading} />

                        {/* Social login */}
                        <SocialLoginSection onSocialClick={handleSocialLogin} />

                        {/* Link registrazione */}
                        <div className="text-center mt-4">
                            <p className="text-sm text-gray-600">
                                Non hai ancora un account?{' '}
                                <button
                                    type="button"
                                    onClick={() => setIsRegisterOpen(true)}
                                    className="font-semibold text-blue-600 hover:text-blue-500 hover:underline"
                                >
                                    Registrati ora
                                </button>
                            </p>
                        </div>
                    </form>

                    {/* Dialogs */}
                    <RegisterDialog
                        isOpen={isRegisterOpen}
                        onClose={() => setIsRegisterOpen(false)}
                        onRegisterSuccess={handleRegisterSuccess}
                    />
                    <ForgotPasswordDialog
                        isOpen={isForgotOpen}
                        onClose={() => setIsForgotOpen(false)}
                    />
                </div>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════
// COMPONENTI INTERNI
// ═══════════════════════════════════════════════════════════════════

/**
 * Sezione branding (sinistra).
 */
function BrandingSection() {
    return (
        <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 overflow-hidden text-white flex-col justify-between p-12">
            {/* Background decorativo */}
            <div className="absolute top-0 left-0 w-full h-full opacity-20 z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-blue-500 blur-3xl" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-green-500 blur-3xl" />
            </div>

            {/* Logo */}
            <div className="relative z-10 flex items-center gap-3">
                <div className="flex gap-1 h-8">
                    <div className="w-2 bg-blue-500 rounded-sm" />
                    <div className="w-2 bg-green-500 rounded-sm" />
                    <div className="w-2 bg-orange-400 rounded-sm" />
                </div>
                <span className="text-2xl font-bold tracking-tight">TaskTrack</span>
            </div>

            {/* Headline */}
            <div className="relative z-10 max-w-md">
                <h2 className="text-4xl font-extrabold mb-6 leading-tight">
                    Gestisci il tuo tempo, <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">
                        supera i tuoi esami.
                    </span>
                </h2>
                <p className="text-slate-300 text-lg">
                    La piattaforma all-in-one per studenti che vogliono trasformare il caos in produttività.
                </p>
            </div>

            {/* Footer */}
            <div className="relative z-10 text-sm text-slate-400">
                © {new Date().getFullYear()} TaskTrack Project. All rights reserved.
            </div>
        </div>
    );
}

/**
 * Logo per mobile.
 */
function MobileLogo() {
    return (
        <div className="lg:hidden flex justify-center mb-6">
            <div className="flex gap-1 h-8">
                <div className="w-2 bg-blue-500 rounded-sm" />
                <div className="w-2 bg-green-500 rounded-sm" />
                <div className="w-2 bg-orange-400 rounded-sm" />
            </div>
        </div>
    );
}

/**
 * Input email.
 */
function EmailInput({
                        value,
                        onChange,
                        disabled,
                    }: {
    value: string;
    onChange: (value: string) => void;
    disabled: boolean;
}) {
    return (
        <div className="space-y-1">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Istituzionale
            </label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    disabled={disabled}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:opacity-50"
                    placeholder="nome.cognome@studenti.it"
                />
            </div>
        </div>
    );
}

/**
 * Input password.
 */
function PasswordInput({
                           value,
                           onChange,
                           showPassword,
                           onToggleShow,
                           onForgotClick,
                           disabled,
                       }: {
    value: string;
    onChange: (value: string) => void;
    showPassword: boolean;
    onToggleShow: () => void;
    onForgotClick: () => void;
    disabled: boolean;
}) {
    return (
        <div className="space-y-1">
            <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                </label>
                <button
                    type="button"
                    onClick={onForgotClick}
                    className="text-sm font-medium text-blue-600 hover:text-blue-500 hover:underline"
                >
                    Hai dimenticato la password?
                </button>
            </div>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    disabled={disabled}
                    className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:opacity-50"
                    placeholder="••••••••"
                />
                <button
                    type="button"
                    onClick={onToggleShow}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    aria-label={showPassword ? 'Nascondi password' : 'Mostra password'}
                >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
            </div>
        </div>
    );
}

/**
 * Messaggio di errore.
 */
function ErrorMessage({ message }: { message: string }) {
    return (
        <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg animate-in fade-in slide-in-from-top-1">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{message}</span>
        </div>
    );
}

/**
 * Pulsante submit.
 */
function SubmitButton({ isLoading }: { isLoading: boolean }) {
    return (
        <button
            type="submit"
            disabled={isLoading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-all disabled:opacity-70"
        >
            {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
                <>
                    Accedi al Workspace
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </>
            )}
        </button>
    );
}

/**
 * Sezione social login.
 */
function SocialLoginSection({ onSocialClick }: { onSocialClick: () => void }) {
    return (
        <>
            {/* Divider */}
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Oppure continua con</span>
                </div>
            </div>

            {/* Buttons */}
            <div className="grid grid-cols-2 gap-3">
                <SocialButton
                    onClick={onSocialClick}
                    icon={<GoogleIcon />}
                    label="Google"
                />
                <SocialButton
                    onClick={onSocialClick}
                    icon={<GitHubIcon />}
                    label="GitHub"
                />
            </div>
        </>
    );
}

/**
 * Pulsante social generico.
 */
function SocialButton({
                          onClick,
                          icon,
                          label,
                      }: {
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="w-full inline-flex justify-center py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
        >
            {icon}
            <span className="ml-2">{label}</span>
        </button>
    );
}

/**
 * Icona Google.
 */
function GoogleIcon() {
    return (
        <svg className="h-5 w-5" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
        </svg>
    );
}

/**
 * Icona GitHub.
 */
function GitHubIcon() {
    return (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path
                fillRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                clipRule="evenodd"
            />
        </svg>
    );
}