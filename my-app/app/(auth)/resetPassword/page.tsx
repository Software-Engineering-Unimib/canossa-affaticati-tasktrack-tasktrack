'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { KeyRound, Eye, EyeOff, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export default function UpdatePasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (password.length < 6) {
      setMessage({ type: 'error', text: 'La password deve essere di almeno 6 caratteri.' });
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        throw error;
      }

      setMessage({ type: 'success', text: 'Password aggiornata con successo! Reindirizzamento...' });
      
      // Dopo 2 secondi portiamo l'utente alla dashboard o al login
      setTimeout(() => {
        router.push('/dashboard'); // O dove vuoi tu
      }, 2000);

    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Errore durante l\'aggiornamento.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        
        <div className="p-8">
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center">
              <KeyRound className="w-7 h-7 text-blue-600" />
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-900">Nuova Password</h1>
            <p className="text-slate-500 mt-2 text-sm">
              Inserisci la tua nuova password per completare il reset.
            </p>
          </div>

          {/* Messaggi di Errore o Successo */}
          {message && (
            <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 text-sm ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-700 border border-green-100' 
                : 'bg-red-50 text-red-700 border border-red-100'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 shrink-0" />
              )}
              <span className="font-medium mt-0.5">{message.text}</span>
            </div>
          )}

          <form onSubmit={handleUpdatePassword} className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 ml-1">
                Nuova Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-4 pr-12 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 placeholder:text-slate-400"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              <p className="text-xs text-slate-400 ml-1">
                Minimo 6 caratteri
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || message?.type === 'success'}
              className="w-full py-3 px-4 flex justify-center items-center bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-slate-900/10"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Aggiornamento...
                </>
              ) : (
                'Imposta Password'
              )}
            </button>
          </form>
        </div>
        
      </div>
    </div>
  );
}