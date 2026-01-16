'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import RegisterDialog from "@/app/components/auth/registerDialog";
import ForgotPasswordDialog from "@/app/components/auth/forgotPasswordDialog";
import { signInWithGitHub, signInWithGoogle } from '@/lib/auth';
// Importa la Server Action per il login
import { loginAction } from './actions';

export default function Login() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isGitHubLoading, setIsGitHubLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [isRegisterOpen, setIsRegisterOpen] = useState(false);
    const [isForgotOpen, setIsForgotOpen] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Chiama la Server Action invece della fetch client-side
            const result = await loginAction(email, password);

            if (!result.success) {
                throw new Error(result.error || 'Login fallito');
            }

            console.log('Login successful via Server Action');

            // Salva l'utente nel localStorage se ti serve ancora per la UI client-side,
            // ma l'autenticazione vera e propria ora è gestita dai cookie httpOnly.
            // Se "result.user" non è restituito dall'action, puoi rimuovere questa riga
            // o aggiornare l'action per restituire i dati utente non sensibili.
            // localStorage.setItem('user', JSON.stringify(result.user));

            // Reindirizza alla dashboard
            router.push('/dashboard');

            // Forza un refresh per assicurarsi che i Server Components riconoscano il nuovo cookie
            router.refresh();

        } catch (error) {
            console.error('Login error:', error);
            alert(error instanceof Error ? error.message : "Errore durante il login");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGitHubLogin = async () => {
        setIsGitHubLoading(true);
        try {
            const { error } = await signInWithGitHub();
            if (error) {
                console.error('GitHub login error:', error);
                alert('Errore durante il login con GitHub: ' + error.message);
            }
            // Il redirect avviene automaticamente
        } catch (error) {
            console.error('GitHub login error:', error);
            alert('Errore durante il login con GitHub');
        } finally {
            setIsGitHubLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setIsGoogleLoading(true);
        try {
            const { error } = await signInWithGoogle();
            if (error) {
                console.error('Google login error:', error);
                alert('Errore durante il login con Google: ' + error.message);
            }
            // Il redirect avviene automaticamente
        } catch (error) {
            console.error('Google login error:', error);
            alert('Errore durante il login con Google');
        } finally {
            setIsGoogleLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-gray-50">

            {/* SEZIONE SINISTRA - BRANDING (Visibile solo su schermi grandi) */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 overflow-hidden text-white flex-col justify-between p-12">
                {/* Background decorativo astratto */}
                <div className="absolute top-0 left-0 w-full h-full opacity-20 z-0">
                    <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-blue-500 blur-3xl"></div>
                    <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-green-500 blur-3xl"></div>
                </div>

                {/* Logo in alto a sinistra */}
                <div className="relative z-10 flex items-center gap-3">
                    <div className="flex gap-1 h-8">
                        <div className="w-2 bg-blue-500 rounded-sm"></div>
                        <div className="w-2 bg-green-500 rounded-sm"></div>
                        <div className="w-2 bg-orange-400 rounded-sm"></div>
                    </div>
                    <span className="text-2xl font-bold tracking-tight">TaskTrack</span>
                </div>

                {/* Testo centrale */}
                <div className="relative z-10 max-w-md">
                    <h2 className="text-4xl font-extrabold mb-6 leading-tight">
                        Gestisci il tuo tempo, <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">
                    supera i tuoi esami.
                </span>
                    </h2>
                    <p className="text-slate-300 text-lg">
                        La piattaforma all-in-one per studenti che vogliono trasformare il caos in produttività.
                    </p>
                </div>

                {/* Footer sezione */}
                <div className="relative z-10 text-sm text-slate-400">
                    © {new Date().getFullYear()} TaskTrack Project. All rights reserved.
                </div>
            </div>

            {/* SEZIONE DESTRA - FORM DI LOGIN */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 bg-white">
                <div className="w-full max-w-md space-y-8">

                    {/* Header Mobile (Logo visibile solo su mobile) */}
                    <div className="lg:hidden flex justify-center mb-6">
                        <div className="flex gap-1 h-8">
                            <div className="w-2 bg-blue-500 rounded-sm"></div>
                            <div className="w-2 bg-green-500 rounded-sm"></div>
                            <div className="w-2 bg-orange-400 rounded-sm"></div>
                        </div>
                    </div>

                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-gray-900">Bentornato! 👋</h1>
                        <p className="mt-2 text-gray-500">Inserisci le tue credenziali per accedere al Workspace.</p>
                    </div>

                    <form onSubmit={handleLogin} className="mt-8 space-y-6">

                        {/* Input Email */}
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
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors outline-none"
                                    placeholder="nome.cognome@studenti.it"
                                />
                            </div>
                        </div>

                        {/* Input Password */}
                        <div className="space-y-1">
                            <div className="flex items-center justify-between">
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                    Password
                                </label>
                                <div className="text-sm">
                                    <button
                                        type="button"
                                        onClick={() => setIsForgotOpen(true)}
                                        className="text-sm font-medium text-blue-600 hover:text-blue-500 hover:underline"
                                    >
                                        Hai dimenticato la password?
                                    </button>
                                </div>
                            </div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors outline-none"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
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

                        {/* Social Login / Divider */}
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">Oppure continua con</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {/* Google Button */}
                            <button
                                type="button"
                                onClick={handleGoogleLogin}
                                disabled={isGoogleLoading}
                                className="w-full inline-flex justify-center py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isGoogleLoading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <>
                                        <span className="sr-only">Sign in with Google</span>
                                        <svg className="h-5 w-5" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                                        </svg>
                                    </>
                                )}
                            </button>

                            {/* GitHub Button */}
                            <button
                                type="button"
                                onClick={handleGitHubLogin}
                                disabled={isGitHubLoading}
                                className="w-full inline-flex justify-center py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isGitHubLoading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <>
                                        <span className="sr-only">Sign in with GitHub</span>
                                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                            <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                                        </svg>
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Register Link */}
                        <div className="text-center mt-4">
                            <p className="text-sm text-gray-600">
                                Non hai ancora un account?{' '}
                                <button
                                    type="button"
                                    onClick={() => setIsRegisterOpen(true)}
                                    className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                                >Registrati ora</button>
                            </p>
                        </div>
                    </form>
                    <RegisterDialog
                        isOpen={isRegisterOpen}
                        onClose={() => setIsRegisterOpen(false)}
                        onRegisterSuccess={() => {
                            console.log("Utente registrato, ora puoi fare auto-login o mostrare un messaggio");
                        }}
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