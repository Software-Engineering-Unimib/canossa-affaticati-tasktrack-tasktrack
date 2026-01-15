'use client';

import { useState } from 'react';
import { fetchAllUsers } from '@/actions/getUsers';

export default function TestUsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGetUsers = async () => {
        setIsLoading(true);
        setError('');

        try {
            const result = await fetchAllUsers();

            if (result.success && result.data) {
                setUsers(result.data);
            } else {
                setError(result.error || 'Errore sconosciuto');
            }
        } catch (e) {
            setError('Errore di connessione');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 p-8 flex flex-col items-center">
            <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-3xl">

                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h1 className="text-2xl font-bold text-slate-800">Test Database Utenti</h1>
                    <button
                        onClick={handleGetUsers}
                        disabled={isLoading}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Caricamento...' : 'Verifica Connessione e Prendi Utenti'}
                    </button>
                </div>

                {error && (
                    <div className="p-4 bg-red-50 text-red-600 rounded-lg mb-4 border border-red-200">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    {users.length === 0 && !isLoading && !error && (
                        <p className="text-center text-slate-500 italic">
                            Nessun utente visualizzato. Clicca il pulsante per caricare.
                        </p>
                    )}

                    {users.map((user) => (
                        <div
                            key={user._id}
                            className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-4"
                        >
                            {/* Avatar Placeholder */}
                            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                                {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                            </div>

                            <div className="flex-1 overflow-hidden">
                                <p className="font-bold text-slate-800">{user.name}</p>
                                <p className="text-sm text-slate-500">{user.email}</p>
                                <p className="text-xs text-slate-400 font-mono mt-1">ID: {user._id}</p>
                            </div>

                            <div className="text-xs text-slate-400">
                                Registrato il: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Debug Raw Data (Opzionale, utile per sviluppatori) */}
                {users.length > 0 && (
                    <details className="mt-8">
                        <summary className="cursor-pointer text-xs text-slate-400 hover:text-slate-600">Vedi JSON Grezzo</summary>
                        <pre className="mt-2 p-4 bg-slate-900 text-green-400 rounded-lg overflow-auto text-xs max-h-60">
              {JSON.stringify(users, null, 2)}
            </pre>
                    </details>
                )}

            </div>
        </div>
    );
}