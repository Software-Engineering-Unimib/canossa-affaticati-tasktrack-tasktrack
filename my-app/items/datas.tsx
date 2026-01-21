import { Board } from './Board';
import { Task } from './Task';
import { PriorityConfig } from './Priority';

// --- DATI PRIORITÀ ---
export const initialPriorities: PriorityConfig[] = [
    {
        id: 'Bassa',
        label: 'Bassa',
        description: 'Task non critici, scadenze flessibili.',
        colorClass: 'text-emerald-700 bg-emerald-100 border-emerald-200',
        bgClass: 'bg-emerald-50/50',
        reminders: [{ id: 'r1', value: 1, unit: 'days' }]
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

// --- DATI BACHECHE (BOARDS) ---
export const initialBoards: Board[] = [
    {
        id: '1',
        title: 'Università',
        description: 'Gestione esami, scadenze accademiche e materiale di studio.',
        icon: 'university',
        theme: 'blue',
        stats: { deadlines: 2, inProgress: 5, completed: 12 },
        guests: ["marco.rossi@studenti.it"],
        categories: [
            { id: 'cat_uni_1', name: 'Analisi', color: 'blue' },
            { id: 'cat_uni_2', name: 'Progettazione', color: 'purple' },
            { id: 'cat_uni_3', name: 'Burocrazia', color: 'slate' },
            { id: 'cat_uni_4', name: 'Esami', color: 'red' }
        ]
    },
    {
        id: '2',
        title: 'Personale & Hobby',
        description: 'Lista della spesa, obiettivi palestra e film da vedere.',
        icon: 'personal',
        theme: 'green',
        stats: { deadlines: 0, inProgress: 3, completed: 8 },
        guests: [],
        categories: [
            { id: 'cat_pers_1', name: 'Casa', color: 'green' },
            { id: 'cat_pers_2', name: 'Finanze', color: 'yellow' },
            { id: 'cat_pers_3', name: 'Sport', color: 'orange' }
        ]
    },
    {
        id: '3',
        title: 'Lavoro',
        description: 'Task lavorativi e meeting settimanali.',
        icon: 'work',
        theme: 'orange',
        stats: { deadlines: 1, inProgress: 4, completed: 20 },
        guests: ["collega@azienda.com"],
        categories: [
            { id: 'cat_work_1', name: 'Meeting', color: 'blue' },
            { id: 'cat_work_2', name: 'Sviluppo', color: 'yellow' },
            { id: 'cat_work_3', name: 'Admin', color: 'slate' }
        ]
    }
];

// --- DATI TASK ---
export const initialTasks: Record<string, Task[]> = {
    '1': [
        {
            id: 't-101',
            title: 'Studiare Capitoli 1-4 di Analisi',
            description: 'Fare esercizi a pagina 120 del libro di testo.',
            categories: [{ id: 'cat_uni_1', name: 'Analisi', color: 'blue' }],
            priority: 'Alta',
            columnId: 'todo',
            dueDate: new Date('2024-06-15'),
            comments: 2,
            attachments: 1,
            assignees: ['MR']
        },
        {
            id: 't-102',
            title: 'Iscrizione Appello sessione invernale',
            description: 'Scade a mezzanotte, ricordarsi lo SPID.',
            categories: [{ id: 'cat_uni_3', name: 'Burocrazia', color: 'slate' }],
            priority: 'Urgente',
            columnId: 'todo',
            dueDate: new Date('2024-06-10'),
            comments: 0,
            attachments: 0,
            assignees: []
        },
        {
            id: 't-103',
            title: 'Progetto di Gruppo (Java)',
            description: 'Implementare interfaccia grafica con Swing.',
            categories: [{ id: 'cat_uni_2', name: 'Progettazione', color: 'purple' }],
            priority: 'Media',
            columnId: 'inprogress',
            dueDate: new Date('2024-06-20'),
            comments: 5,
            attachments: 3,
            assignees: ['MR', 'LB']
        },
        {
            id: 't-104',
            title: 'Comprare libri semestre 2',
            description: '',
            categories: [{ id: 'cat_uni_3', name: 'Burocrazia', color: 'slate' }],
            priority: 'Bassa',
            columnId: 'done',
            dueDate: new Date('2024-06-01'),
            comments: 0,
            attachments: 0,
            assignees: ['MR']
        }
    ],

    '2': [
        {
            id: 't-201',
            title: 'Pagare affitto',
            description: 'Bonifico al proprietario.',
            categories: [{ id: 'cat_pers_2', name: 'Finanze', color: 'yellow' }],
            priority: 'Urgente',
            columnId: 'todo',
            dueDate: new Date('2024-06-05'),
            comments: 0,
            attachments: 1,
            assignees: ['MR']
        },
        {
            id: 't-202',
            title: 'Fare la spesa settimanale',
            description: 'Latte, uova, pane e verdure.',
            categories: [{ id: 'cat_pers_1', name: 'Casa', color: 'green' }],
            priority: 'Bassa',
            columnId: 'inprogress',
            dueDate: new Date('2024-06-06'),
            comments: 1,
            attachments: 0,
            assignees: ['MR']
        }
    ],

    '3': [
        {
            id: 't-301',
            title: 'Daily Scrum',
            description: 'Aggiornamento con il team.',
            categories: [{ id: 'cat_work_1', name: 'Meeting', color: 'blue' }],
            priority: 'Media',
            columnId: 'done',
            dueDate: new Date('2024-06-04'),
            comments: 0,
            attachments: 0,
            assignees: ['MR', 'Team']
        }
    ]
};