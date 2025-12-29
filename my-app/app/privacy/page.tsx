'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-slate-50">

            {/* Navbar Semplificata */}
            <nav className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-xl text-slate-900">
                        <div className="flex gap-1 h-5">
                            <div className="w-1.5 bg-blue-500 rounded-sm"></div>
                            <div className="w-1.5 bg-green-500 rounded-sm"></div>
                            <div className="w-1.5 bg-orange-400 rounded-sm"></div>
                        </div>
                        TaskTrack
                    </div>
                    <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-blue-600 flex items-center gap-2 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        Torna al Login
                    </Link>
                </div>
            </nav>

            {/* Contenuto del Documento */}
            <main className="max-w-3xl mx-auto px-6 py-12">

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12">

                    <div className="flex items-center gap-4 mb-8 border-b border-slate-100 pb-8">
                        <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-600">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">Informativa sulla Privacy</h1>
                            <p className="text-slate-500 mt-1">Ultimo aggiornamento: {new Date().toLocaleDateString('it-IT')}</p>
                        </div>
                    </div>

                    <div className="prose prose-slate max-w-none text-slate-600 space-y-8">

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-3">1. Introduzione</h2>
                            <p>
                                TaskTrack si impegna a proteggere la tua privacy. Questa Informativa sulla Privacy spiega come raccogliamo, utilizziamo,
                                divulghiamo e proteggiamo le tue informazioni quando utilizzi la nostra applicazione web.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-3">2. Dati che Raccogliamo</h2>
                            <p>Possiamo raccogliere le seguenti categorie di dati:</p>
                            <ul className="list-disc pl-5 space-y-1 mt-2">
                                <li><strong>Dati Personali:</strong> Nome, cognome, indirizzo email forniti durante la registrazione.</li>
                                <li><strong>Dati di Utilizzo:</strong> Informazioni su come utilizzi l'applicazione (task creati, bacheche, tempo di utilizzo).</li>
                                <li><strong>Dati Tecnici:</strong> Indirizzo IP, tipo di browser e sistema operativo.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-3">3. Utilizzo dei Dati</h2>
                            <p>Utilizziamo i dati raccolti per:</p>
                            <ul className="list-disc pl-5 space-y-1 mt-2">
                                <li>Fornire e mantenere il nostro Servizio.</li>
                                <li>Notificarti cambiamenti nel nostro Servizio.</li>
                                <li>Consentirti di partecipare alle funzionalità interattive (es. condivisione bacheche).</li>
                                <li>Fornire assistenza clienti e supporto.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-3">4. Condivisione dei Dati</h2>
                            <p>
                                Non vendiamo i tuoi dati personali a terzi. Possiamo condividere i dati solo con fornitori di servizi terzi che ci aiutano
                                a gestire la nostra attività (es. hosting, servizi di email), obbligati a mantenere la riservatezza.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-3">5. Sicurezza dei Dati</h2>
                            <p>
                                La sicurezza dei tuoi dati è importante per noi, ma ricorda che nessun metodo di trasmissione su Internet o metodo di
                                archiviazione elettronica è sicuro al 100%. Ci sforziamo di utilizzare mezzi commercialmente accettabili per proteggere
                                i tuoi Dati Personali.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-3">6. I Tuoi Diritti</h2>
                            <p>
                                Hai il diritto di accedere, aggiornare o cancellare le informazioni che abbiamo su di te. Se desideri esercitare questo
                                diritto, ti preghiamo di contattarci all'indirizzo support@tasktrack.it.
                            </p>
                        </section>

                    </div>
                </div>

                <div className="text-center mt-8 text-sm text-slate-400">
                    © {new Date().getFullYear()} TaskTrack. Tutti i diritti riservati.
                </div>
            </main>
        </div>
    );
}