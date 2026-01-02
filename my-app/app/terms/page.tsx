'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ScrollText } from 'lucide-react';

export default function TermsPage() {
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
                        <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                            <ScrollText className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">Termini di Servizio</h1>
                            <p className="text-slate-500 mt-1">Ultimo aggiornamento: {new Date().toLocaleDateString('it-IT')}</p>
                        </div>
                    </div>

                    <div className="prose prose-slate max-w-none text-slate-600 space-y-8">

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-3">1. Accettazione dei Termini</h2>
                            <p>
                                Accedendo e utilizzando TaskTrack ("il Servizio"), accetti di essere vincolato dai seguenti Termini e Condizioni.
                                Se non accetti questi termini, ti preghiamo di non utilizzare il nostro servizio. TaskTrack è progettato per aiutare
                                studenti e professionisti a gestire le proprie attività accademiche e lavorative.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-3">2. Account Utente</h2>
                            <p>
                                Per utilizzare alcune funzionalità del Servizio, devi registrare un account. Sei responsabile di mantenere la
                                confidenzialità delle tue credenziali di accesso e sei pienamente responsabile di tutte le attività che si verificano
                                sotto il tuo account. Ci riserviamo il diritto di sospendere o terminare account che violano le nostre policy o utilizzano
                                dati falsi.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-3">3. Uso Consentito</h2>
                            <p>
                                Accetti di utilizzare il Servizio solo per scopi legali e in conformità con questi Termini. Non devi:
                            </p>
                            <ul className="list-disc pl-5 space-y-1 mt-2">
                                <li>Utilizzare il servizio per scopi fraudolenti o illegali.</li>
                                <li>Tentare di interferire con la sicurezza o l'integrità del sistema.</li>
                                <li>Copiare, modificare o distribuire parti del nostro software senza autorizzazione.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-3">4. Proprietà Intellettuale</h2>
                            <p>
                                Il Servizio e i suoi contenuti originali (escluso il contenuto fornito dagli utenti), le caratteristiche e le funzionalità
                                sono e rimarranno di proprietà esclusiva di TaskTrack e dei suoi licenziatari.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-3">5. Limitazione di Responsabilità</h2>
                            <p>
                                In nessun caso TaskTrack sarà responsabile per danni indiretti, incidentali, speciali, consequenziali o punitivi,
                                inclusi, senza limitazione, perdita di profitti, dati, uso o altre perdite intangibili, derivanti dal tuo accesso
                                o utilizzo o dall'impossibilità di accedere o utilizzare il Servizio.
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