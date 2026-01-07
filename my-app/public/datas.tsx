import {Board} from "@/public/Board";
import {Task} from "@/public/Task";
import {PriorityConfig} from "./Priority";

export const initialBoards: Board[] = [
    {
        id: 1,
        title: "Università",
        description: "Gestione esami, scadenze accademiche e materiale di studio.",
        category: "university",
        theme: "blue",
        stats: { deadlines: 2, inProgress: 5, completed: 12 },
        guests: ["marco.rossi@studenti.it"]
    },
    {
        id: 2,
        title: "Personale & Hobby",
        description: "Lista della spesa, obiettivi palestra e film da vedere.",
        category: "personal",
        theme: "green",
        stats: { deadlines: 0, inProgress: 3, completed: 8 },
        guests: []
    },
    {
        id: 3,
        title: "Progetto di Tesi",
        description: "Ricerca bibliografica e stesura capitoli.",
        category: "other",
        theme: "purple",
        stats: { deadlines: 1, inProgress: 4, completed: 15 },
        guests: ["prof.verdi@uni.it"]
    },
    {
        id: 4,
        title: "Progetto di Tesi",
        description: "Ricerca bibliografica e stesura capitoli.",
        category: "other",
        theme: "orange",
        stats: { deadlines: 1, inProgress: 4, completed: 15 },
        guests: ["prof.verdi@uni.it"]
    },
    {
        id: 5,
        title: "Università",
        description: "Gestione esami, scadenze accademiche e materiale di studio.",
        category: "university",
        theme: "blue",
        stats: { deadlines: 2, inProgress: 5, completed: 12 },
        guests: ["marco.rossi@studenti.it"]
    },
    {
        id: 6,
        title: "Personale & Hobby",
        description: "Lista della spesa, obiettivi palestra e film da vedere.",
        category: "personal",
        theme: "green",
        stats: { deadlines: 0, inProgress: 3, completed: 8 },
        guests: []
    },
    {
        id: 7,
        title: "Progetto di Tesi",
        description: "Ricerca bibliografica e stesura capitoli.",
        category: "other",
        theme: "purple",
        stats: { deadlines: 1, inProgress: 4, completed: 15 },
        guests: ["prof.verdi@uni.it"]
    },
    {
        id: 8,
        title: "Progetto di Tesi",
        description: "Ricerca bibliografica e stesura capitoli.",
        category: "other",
        theme: "orange",
        stats: { deadlines: 1, inProgress: 4, completed: 15 },
        guests: ["prof.verdi@uni.it"]
    },
    {
        id: 9,
        title: "Università",
        description: "Gestione esami, scadenze accademiche e materiale di studio.",
        category: "university",
        theme: "blue",
        stats: { deadlines: 2, inProgress: 5, completed: 12 },
        guests: ["marco.rossi@studenti.it"]
    },
    {
        id: 10,
        title: "Personale & Hobby",
        description: "Lista della spesa, obiettivi palestra e film da vedere.",
        category: "personal",
        theme: "green",
        stats: { deadlines: 0, inProgress: 3, completed: 8 },
        guests: []
    },
    {
        id: 11,
        title: "Progetto di Tesi",
        description: "Ricerca bibliografica e stesura capitoli.",
        category: "other",
        theme: "purple",
        stats: { deadlines: 1, inProgress: 4, completed: 15 },
        guests: ["prof.verdi@uni.it"]
    },
    {
        id: 12,
        title: "Progetto di Tesi",
        description: "Ricerca bibliografica e stesura capitoli.",
        category: "other",
        theme: "orange",
        stats: { deadlines: 1, inProgress: 4, completed: 15 },
        guests: ["prof.verdi@uni.it"]
    },
    {
        id: 13,
        title: "Università",
        description: "Gestione esami, scadenze accademiche e materiale di studio.",
        category: "university",
        theme: "blue",
        stats: { deadlines: 2, inProgress: 5, completed: 12 },
        guests: ["marco.rossi@studenti.it"]
    },
    {
        id: 14,
        title: "Personale & Hobby",
        description: "Lista della spesa, obiettivi palestra e film da vedere.",
        category: "personal",
        theme: "green",
        stats: { deadlines: 0, inProgress: 3, completed: 8 },
        guests: []
    },
    {
        id: 15,
        title: "Progetto di Tesi",
        description: "Ricerca bibliografica e stesura capitoli.",
        category: "other",
        theme: "purple",
        stats: { deadlines: 1, inProgress: 4, completed: 15 },
        guests: ["prof.verdi@uni.it"]
    },
    {
        id: 16,
        title: "Progetto di Tesi",
        description: "Ricerca bibliografica e stesura capitoli.",
        category: "other",
        theme: "orange",
        stats: { deadlines: 1, inProgress: 4, completed: 15 },
        guests: ["prof.verdi@uni.it"]
    },

];

export const initialTasks: Record<string, Task[]> = {
    '1': [
        {
            id: 't-101',
            title: 'Studiare Capitoli 1-4 di Analisi',
            description: 'Fare esercizi a pagina 120.',
            category: { id: 'c-1', name: 'AAAAAAAAAA', color: 'orange' },
            priority: 'Alta',
            columnId: 'todo',
            dueDate: 'Domani',
            comments: 2,
            attachments: 1
        },
        {
            id: 't-102',
            title: 'Iscrizione Appello sessione invernale',
            category: { id: 'c-6', name: 'BBBBBBBB', color: 'orange' },
            priority: 'Urgente',
            columnId: 'todo',
            dueDate: 'Oggi',
            comments: 0,
            attachments: 0
        },
        {
            id: 't-103',
            title: 'Progetto di Gruppo (Java)',
            description: 'Implementare interfaccia grafica.',
            category: { id: 'c-2', name: 'CCCCCCCC', color: 'blue' },
            priority: 'Media',
            columnId: 'inprogress',
            dueDate: 'Ven 14',
            comments: 5,
            attachments: 3
        },
        {
            id: 't-104',
            title: 'Comprare libri semestre 2',
            category: { id: 'c-3', name: 'DDDDDDDD', color: 'green' },
            priority: 'Bassa',
            columnId: 'done',
            dueDate: 'Ieri',
            comments: 0,
            attachments: 0
        }
    ],
    '2': [
        {
            id: 't-201',
            title: 'Pagare affitto',
            category: { id: 'c-4', name: 'EEEEEEEE', color: 'green' },
            priority: 'Urgente',
            columnId: 'todo',
            dueDate: 'Oggi',
            comments: 0,
            attachments: 1
        },
        {
            id: 't-202',
            title: 'Fare la spesa settimanale',
            category: { id: 'c-5', name: 'FFFFFFFF', color: 'purple' },
            priority: 'Bassa',
            columnId: 'inprogress',
            dueDate: 'Domani',
            comments: 1,
            attachments: 0
        }
    ]
};

export const initialPriorities: PriorityConfig[] = [
    {
        id: 'Bassa',
        label: 'Bassa',
        description: 'Task non critici, scadenze flessibili.',
        colorClass: 'text-emerald-700 bg-emerald-100 border-emerald-200',
        bgClass: 'bg-emerald-50/50',
        reminders: [
            { id: 'r1', value: 1, unit: 'days' } // 1 giorno prima
        ]
    },
    {
        id: 'Media',
        label: 'Media',
        description: 'Attività standard da completare in settimana.',
        colorClass: 'text-amber-700 bg-amber-100 border-amber-200',
        bgClass: 'bg-amber-50/50',
        reminders: [
            { id: 'r2', value: 2, unit: 'hours' },
            { id: 'r3', value: 1, unit: 'days' }
        ]
    },
    {
        id: 'Alta',
        label: 'Alta',
        description: 'Task importanti che richiedono attenzione immediata.',
        colorClass: 'text-orange-700 bg-orange-100 border-orange-200',
        bgClass: 'bg-orange-50/50',
        reminders: [
            { id: 'r4', value: 30, unit: 'minutes' },
            { id: 'r5', value: 4, unit: 'hours' }
        ]
    },
    {
        id: 'Urgente',
        label: 'Urgente',
        description: 'Scadenze imminenti o blocchi critici.',
        colorClass: 'text-red-700 bg-red-100 border-red-200',
        bgClass: 'bg-red-50/50',
        reminders: [
            { id: 'r6', value: 15, unit: 'minutes' },
            { id: 'r7', value: 1, unit: 'hours' },
            { id: 'r8', value: 1, unit: 'days' }
        ]
    }
];
