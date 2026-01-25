# 📋 TaskTrack

<div align="center">

![TaskTrack Logo](https://img.shields.io/badge/TaskTrack-Kanban%20Board-blue?style=for-the-badge&logo=trello&logoColor=white)

**Un'applicazione moderna per la gestione di task e progetti, pensata per studenti e professionisti.**

[![Next.js](https://img.shields.io/badge/Next.js-15.0-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.0-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

[Demo](#-demo) • [Funzionalità](#-funzionalità) • [Installazione](#-installazione) • [Utilizzo](#-guida-allutilizzo) • [Architettura](#-architettura)

</div>

---

## 📖 Introduzione

**TaskTrack** è un'applicazione web full-stack per la gestione di task e progetti, basata sul paradigma Kanban. Progettata con un'architettura moderna e scalabile, offre un'esperienza utente fluida e intuitiva per organizzare attività, collaborare con team e monitorare le scadenze.

### 🎯 Obiettivi del Progetto

- Fornire uno strumento semplice ma potente per la gestione delle attività
- Implementare best practices di ingegneria del software
- Dimostrare l'applicazione di Design Pattern e principi SOLID
- Offrire un'esperienza utente moderna e responsive

### 👥 Target Users

- **Studenti universitari**: gestione esami, progetti di gruppo, scadenze
- **Professionisti**: organizzazione task lavorativi, progetti personali
- **Team piccoli**: collaborazione su bacheche condivise

---

## ✨ Funzionalità

### 🏠 Dashboard

| Funzionalità | Descrizione |
|--------------|-------------|
| Vista panoramica | Visualizza tutte le bacheche attive |
| Statistiche rapide | Task completati, in corso, scadenze imminenti |
| Accesso rapido | Link diretti alle bacheche più utilizzate |
| Ricerca globale | Trova bacheche per nome |

### 📊 Kanban Board

| Funzionalità | Descrizione |
|--------------|-------------|
| Drag & Drop | Sposta i task tra le colonne trascinandoli |
| Tre colonne | "Da Fare", "In Corso", "Completato" |
| Ordinamento automatico | Task ordinati per priorità e scadenza |
| Filtri avanzati | Filtra per priorità, categoria |

### ✅ Gestione Task

| Funzionalità | Descrizione |
|--------------|-------------|
| Creazione rapida | Aggiungi task con titolo, descrizione, priorità |
| Priorità | 4 livelli: Bassa, Media, Alta, Urgente |
| Categorie | Etichette colorate personalizzabili |
| Scadenze | Data di scadenza con alert visivi (Not implemented yet) |
| Allegati | Upload e gestione file |
| Commenti | Discussioni sui singoli task |

### 🏷️ Categorie

| Funzionalità | Descrizione |
|--------------|-------------|
| Personalizzazione | Crea etichette con nome e colore |
| 9 colori disponibili | Blu, Verde, Giallo, Arancione, Rosso, Viola, Rosa, Ciano, Slate |
| Gestione per bacheca | Ogni bacheca ha le sue categorie |

### ⏰ Priorità e Notifiche

| Funzionalità | Descrizione |
|--------------|-------------|
| 4 livelli priorità | Bassa, Media, Alta, Urgente |
| Promemoria configurabili | Fino a 3 reminder per priorità |
| Unità di tempo | Ore, giorni, settimane |

### 🎯 Focus Mode

| Funzionalità | Descrizione |
|--------------|-------------|
| Timer a schermo intero | Modalità concentrazione senza distrazioni |
| Cronometro | Traccia il tempo dedicato al focus |
| Attivazione rapida | Toggle dalla sidebar |

### 👤 Profilo Utente

| Funzionalità | Descrizione |
|--------------|-------------|
| Autenticazione | Login/Registrazione sicuri |
| Avatar personalizzabile | Upload immagine profilo (Not implmented yet) |
| Gestione account | Modifica dati personali (Not implmented yet) |

---

## 🛠️ Stack Tecnologico

### Frontend

| Tecnologia | Versione | Utilizzo |
|------------|----------|----------|
| **Next.js** | 15.x | Framework React con App Router |
| **React** | 18.x | Libreria UI |
| **TypeScript** | 5.x | Type safety |
| **Tailwind CSS** | 3.x | Styling utility-first |
| **Lucide React** | latest | Icone |

### Backend & Database

| Tecnologia | Utilizzo |
|------------|----------|
| **Supabase** | Backend-as-a-Service |
| **PostgreSQL** | Database relazionale (via Supabase) |
| **Supabase Auth** | Autenticazione |
| **Supabase Storage** | Storage file (allegati, avatar) |

### Strumenti di Sviluppo

| Strumento | Utilizzo |
|-----------|----------|
| **ESLint** | Linting codice |
| **Prettier** | Formattazione codice |
| **Git** | Version control |
| **npm/yarn/pnpm** | Package manager |

---

## 📁 Struttura del Progetto

```
tasktrack/
├── my-app/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Route group autenticazione
│   │   │   ├── layout.tsx
│   │   │   └── login/
│   │   │       └── page.tsx
│   │   ├── (workspace)/              # Route group workspace (protetto)
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── board/
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── categories/
│   │   │   │   └── page.tsx
│   │   │   └── priorities/
│   │   │       └── page.tsx
│   │   ├── components/               # Componenti React
│   │   │   ├── auth/                 # Componenti autenticazione
│   │   │   │   ├── LogoutDialog.tsx
│   │   │   │   ├── forgotPasswordDialog.tsx
│   │   │   │   └── registerDialog.tsx
│   │   │   ├── Board/                # Componenti bacheca
│   │   │   │   ├── BoardCard.tsx
│   │   │   │   ├── CreateBoardDialog.tsx
│   │   │   │   └── EditBoardDialog.tsx
│   │   │   ├── KanbanBoard/          # Componenti Kanban
│   │   │   │   ├── TaskCard.tsx
│   │   │   │   └── TaskDialog.tsx
│   │   │   ├── categories/           # Componenti categorie
│   │   │   │   ├── CategoryCard.tsx
│   │   │   │   └── EditCategoryDialog.tsx
│   │   │   ├── focus/                # Componenti focus mode
│   │   │   │   └── FocusOverlay.tsx
│   │   │   ├── logo/                 # Componenti logo
│   │   │   │   ├── logoDesktop.tsx
│   │   │   │   └── logoMobile.tsx
│   │   │   └── sidebar/              # Componenti sidebar
│   │   │       ├── Sidebar.tsx
│   │   │       └── SidebarBoardItem.tsx
│   │   ├── context/                  # React Context
│   │   │   ├── AuthContext.tsx
│   │   │   ├── BoardsContext.tsx
│   │   │   └── FocusContext.tsx
│   │   ├── globals.css               # Stili globali
│   │   ├── layout.tsx                # Root layout
│   │   └── provider.tsx              # Provider composition
│   ├── items/                        # Entità e tipi di dominio
│   │   ├── Board.tsx
│   │   ├── BoardIcon.tsx
│   │   ├── Category.tsx
│   │   ├── Priority.tsx
│   │   └── Task.tsx
│   ├── lib/                          # Configurazione infrastruttura
│   │   └── supabase.ts
│   ├── models/                       # Repository layer
│   │   ├── Board.ts
│   │   ├── Category.ts
│   │   ├── Priority.ts
│   │   ├── Task.ts
│   │   ├── User.ts
│   │   └── index.ts
│   ├── middleware.ts                 # Middleware autenticazione
│   ├── next.config.js                # Configurazione Next.js
│   ├── tailwind.config.js            # Configurazione Tailwind
│   ├── tsconfig.json                 # Configurazione TypeScript
│   └── package.json                  # Dipendenze
├── README.md                         # Questo file
└── REPORT_INGEGNERIA_SOFTWARE.md     # Report tecnico
```

---

## 🚀 Installazione

### Prerequisiti

Assicurati di avere installato:

- **Node.js** >= 18.0.0
- **bun** >= 1.3.5
		(in alternativa npm >= 9.0.0, yarn >= 1.22.0, pnpm >= 8.0.0)
- **Git**
- Un account **Supabase** (gratuito)

### Step 1: Clona il Repository

```bash
# Inizializza la cartella
git init

# Clona il repository
git clone https://github.com/Software-Engineering-Unimib/canossa-affaticati-tasktrack-tasktrack

# Entra nella directory
cd .\canossa-affaticati-tasktrack-tasktrack\my-app
```

### Step 2: Installa le Dipendenze (Scarica BUN.SH)

```bash
# Con bun
bun install
bun add @supabase/ssr @supabase/supabase-js
```

### Step 3: Configura Supabase

#### 3.1 Crea un Progetto Supabase (Non abbiamo un dominio)

1. Vai su [supabase.com](https://supabase.com) e crea un account
2. Clicca su "New Project"
3. Scegli un nome e una password per il database
4. Seleziona la regione più vicina a te
5. Attendi la creazione del progetto (~2 minuti)

#### 3.2 Configura il Database

Vai nella sezione **SQL Editor** di Supabase ed esegui le seguenti query:

```sql
-- Tabella utenti (estende auth.users)
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT,
    name TEXT,
    surname TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabella bacheche
CREATE TABLE public.boards (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    icon TEXT DEFAULT 'personal',
    theme TEXT DEFAULT 'blue',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabella categorie
CREATE TABLE public.categories (
    id SERIAL PRIMARY KEY,
    board_id INTEGER REFERENCES public.boards(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT DEFAULT 'blue',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabella task
CREATE TABLE public.tasks (
    id SERIAL PRIMARY KEY,
    board_id INTEGER REFERENCES public.boards(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT DEFAULT 'Media',
    column_id TEXT DEFAULT 'todo',
    due_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabella relazione task-categorie
CREATE TABLE public.task_categories (
    task_id INTEGER REFERENCES public.tasks(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES public.categories(id) ON DELETE CASCADE,
    PRIMARY KEY (task_id, category_id)
);

-- Tabella commenti
CREATE TABLE public.task_comments (
    id SERIAL PRIMARY KEY,
    task_id INTEGER REFERENCES public.tasks(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabella allegati
CREATE TABLE public.task_attachments (
    id SERIAL PRIMARY KEY,
    task_id INTEGER REFERENCES public.tasks(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabella priorità
CREATE TABLE public.priorities (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    priority_level TEXT NOT NULL,
    label TEXT NOT NULL,
    description TEXT,
    color_class TEXT,
    bg_class TEXT
);

-- Tabella reminder
CREATE TABLE public.priority_reminders (
    id SERIAL PRIMARY KEY,
    priority_id INTEGER REFERENCES public.priorities(id) ON DELETE CASCADE,
    value INTEGER NOT NULL,
    unit TEXT NOT NULL
);

-- Abilita RLS (Row Level Security)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.priorities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.priority_reminders ENABLE ROW LEVEL SECURITY;

-- Policy per users
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Policy per boards
CREATE POLICY "Users can view own boards" ON public.boards
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create boards" ON public.boards
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own boards" ON public.boards
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own boards" ON public.boards
    FOR DELETE USING (auth.uid() = user_id);

-- Policy per tasks (tramite board)
CREATE POLICY "Users can view tasks of own boards" ON public.tasks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.boards 
            WHERE boards.id = tasks.board_id 
            AND boards.user_id = auth.uid()
        )
    );
CREATE POLICY "Users can create tasks in own boards" ON public.tasks
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.boards 
            WHERE boards.id = board_id 
            AND boards.user_id = auth.uid()
        )
    );
CREATE POLICY "Users can update tasks in own boards" ON public.tasks
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.boards 
            WHERE boards.id = tasks.board_id 
            AND boards.user_id = auth.uid()
        )
    );
CREATE POLICY "Users can delete tasks in own boards" ON public.tasks
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.boards 
            WHERE boards.id = tasks.board_id 
            AND boards.user_id = auth.uid()
        )
    );
```

#### 3.3 Configura Storage (per allegati e avatar)

1. Vai nella sezione **Storage** di Supabase
2. Crea due bucket:
   - `avatars` (pubblico)
   - `attachments` (privato)

#### 3.4 Ottieni le Credenziali API

1. Vai in **Settings** → **API**
2. Copia:
   - `Project URL`
   - `anon public` key

### Step 4: Configura le Variabili d'Ambiente

Crea un file `.env.local` nella cartella `my-app`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tuoprogetto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Opzionale: URL base dell'app
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 5: Avvia l'Applicazione

```bash
# Modalità sviluppo
bun run dev

L'applicazione sarà disponibile su [http://localhost:3000](http://localhost:3000)

### Step 6: Build per Produzione (Opzionale)

```bash
# Crea la build di produzione
bun run build

# Avvia in modalità produzione
bun run start
```

---

## 📱 Guida all'Utilizzo

### 🔐 Registrazione e Login

#### Creare un Account

1. Apri l'applicazione
2. Clicca su **"Registrati"**
3. Inserisci:
   - Nome e Cognome
   - Email istituzionale
   - Password (minimo 8 caratteri)
4. Accetta i termini di servizio
5. Clicca **"Registrati ora"**
6. Controlla la tua email per confermare l'account

#### Accedere

1. Inserisci email e password
2. Clicca **"Accedi"**

#### Password Dimenticata

1. Clicca **"Password dimenticata?"**
2. Inserisci la tua email
3. Clicca **"Invia link di reset"**
4. Controlla la tua email e segui le istruzioni

---

### 🏠 Dashboard

La dashboard è la tua pagina principale dopo il login.

#### Panoramica

```
┌─────────────────────────────────────────────────────────────┐
│  🏠 Dashboard                                    [+ Nuova]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ 📚 Tesi     │  │ 💼 Lavoro   │  │ 🏋️ Fitness │         │
│  │             │  │             │  │             │         │
│  │ 3 scadenze  │  │ 0 scadenze  │  │ 1 scadenza  │         │
│  │ 5/12 task   │  │ 8/10 task   │  │ 2/5 task    │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Creare una Nuova Bacheca

1. Clicca il pulsante **"+ Nuova Bacheca"**
2. Compila il form:
   - **Nome**: es. "Progetto Tesi"
   - **Descrizione**: (opzionale) breve descrizione
   - **Categoria**: scegli un'icona (Studio, Lavoro, Personale...)
   - **Colore**: seleziona un tema colore
   - **Collaboratori**: (opzionale) invita altri utenti via email
3. Clicca **"Crea Bacheca"**

#### Modificare una Bacheca

1. Passa il mouse sulla card della bacheca
2. Clicca l'icona **⋮** (tre puntini)
3. Modifica i campi desiderati
4. Clicca **"Salva Modifiche"**

#### Eliminare una Bacheca

1. Apri la modifica della bacheca
2. Clicca **"Elimina"** in basso a sinistra
3. Conferma cliccando **"Sì, elimina"**

---

### 📊 Kanban Board

La board Kanban è il cuore dell'applicazione.

#### Layout

```
┌─────────────────────────────────────────────────────────────┐
│  📚 Tesi Magistrale                    [🔍 Cerca] [⚙️] [+]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  DA FARE (3)       IN CORSO (2)       COMPLETATO (5)       │
│  ┌───────────┐     ┌───────────┐     ┌───────────┐         │
│  │ 🔴 Task 1 │     │ 🟡 Task 4 │     │ ✅ Task 6 │         │
│  │ Urgente   │     │ Media     │     │ Fatto     │         │
│  └───────────┘     └───────────┘     └───────────┘         │
│  ┌───────────┐     ┌───────────┐     ┌───────────┐         │
│  │ 🟠 Task 2 │     │ 🟢 Task 5 │     │ ✅ Task 7 │         │
│  │ Alta      │     │ Bassa     │     │ Fatto     │         │
│  └───────────┘     └───────────┘     └───────────┘         │
│  ┌───────────┐                       ...                   │
│  │ 🟡 Task 3 │                                             │
│  │ Media     │                                             │
│  └───────────┘                                             │
│                                                             │
│  [+ Aggiungi]       [+ Aggiungi]       [+ Aggiungi]        │
└─────────────────────────────────────────────────────────────┘
```

#### Creare un Task

**Metodo 1: Pulsante globale**
1. Clicca **"+ Nuovo Task"** in alto a destra
2. Compila il form
3. Seleziona la colonna di destinazione
4. Clicca **"Crea Task"**

**Metodo 2: Aggiungi in colonna**
1. Clicca **"+ Aggiungi"** in fondo alla colonna desiderata
2. Il task verrà creato direttamente in quella colonna

#### Spostare un Task (Drag & Drop)

1. Clicca e tieni premuto su un task
2. Trascinalo nella colonna desiderata
3. Rilascia per confermare

#### Modificare un Task

1. Clicca sul task per aprire il dialog di modifica
2. Modifica:
   - Titolo e descrizione
   - Priorità (Bassa, Media, Alta, Urgente)
   - Data di scadenza
   - Categorie
3. Clicca **"Salva Modifiche"**

#### Aggiungere Allegati

1. Apri il task in modifica
2. Nella sezione **Allegati**, clicca **"Carica"**
3. Seleziona il file dal tuo computer
4. Il file verrà caricato automaticamente

#### Aggiungere Commenti

1. Apri il task in modifica
2. Nella colonna destra **"Commenti"**
3. Scrivi il messaggio
4. Premi **Invio** o clicca l'icona **→**

#### Filtrare i Task

1. Clicca l'icona **Filtro** 🔧 accanto alla barra di ricerca
2. Seleziona:
   - **Priorità**: una o più priorità
   - **Categorie**: una o più categorie
3. I task verranno filtrati in tempo reale
4. Clicca **"Resetta tutto"** per rimuovere i filtri

#### Cercare Task

1. Usa la barra di ricerca in alto
2. Digita il testo da cercare
3. I risultati si aggiornano in tempo reale

---

### 🏷️ Gestione Categorie

Le categorie (etichette) ti aiutano a organizzare i task.

#### Accedere alla Gestione Categorie

1. Clicca **"Categorie"** nella sidebar
2. Visualizzi tutte le bacheche con le relative categorie

#### Creare una Categoria

1. Clicca sulla bacheca desiderata
2. Si apre il pannello di gestione
3. Clicca **"+ Nuova Categoria"**
4. Inserisci:
   - **Nome**: es. "Bug", "Feature", "Documentazione"
   - **Colore**: scegli tra i 9 disponibili
5. Clicca **"Salva Modifiche"**

#### Modificare una Categoria

1. Clicca sulla categoria nella lista
2. Modifica nome o colore
3. Clicca **"Salva Modifiche"**

#### Eliminare una Categoria

1. Seleziona la categoria
2. Clicca l'icona **🗑️** nell'header
3. Conferma l'eliminazione

---

### ⏰ Gestione Priorità e Notifiche

Configura quando ricevere promemoria per ogni livello di priorità.

#### Accedere alle Impostazioni Priorità

1. Clicca **"Priorità"** nella sidebar

#### Configurare i Promemoria

Ogni priorità può avere fino a **3 promemoria**.

1. Trova la card della priorità (es. "Urgente")
2. Clicca **"+ Aggiungi Promemoria"**
3. Imposta:
   - **Valore**: numero (es. 2)
   - **Unità**: ore, giorni, settimane
4. Esempio: "2 giorni prima" per task urgenti
5. Clicca **"Salva Modifiche"** in alto a destra

#### Esempio di Configurazione

| Priorità | Promemoria |
|----------|------------|
| Urgente | 1 ora prima, 6 ore prima, 1 giorno prima |
| Alta | 1 giorno prima, 3 giorni prima |
| Media | 1 settimana prima |
| Bassa | Nessuno |

---

### 🎯 Focus Mode

La modalità focus ti aiuta a concentrarti senza distrazioni.

#### Attivare il Focus Mode

1. Nella sidebar, trova l'icona **👁️ Focus**
2. Clicca per attivare
3. Lo schermo diventa viola con un timer

#### Durante il Focus Mode

- Il timer conta i secondi/minuti/ore di concentrazione
- L'interfaccia è minimale per ridurre le distrazioni
- Citazione motivazionale in basso

#### Terminare la Sessione

1. Clicca **"Termina Sessione"**
2. Torni alla vista normale

---

### 👤 Profilo Utente

#### Logout

1. Clicca sull'icona **Logout** nella sidebar
2. Conferma cliccando **"Esci"**

---

## 🏗️ Architettura

### Layer Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                       │
│  Pages (app/*) │ Layouts │ Components (components/*)        │
├─────────────────────────────────────────────────────────────┤
│                      STATE MANAGEMENT                        │
│  AuthContext │ BoardsContext │ FocusContext                 │
├─────────────────────────────────────────────────────────────┤
│                      BUSINESS LOGIC                          │
│  UserModel │ BoardModel │ TaskModel │ CategoryModel         │
├─────────────────────────────────────────────────────────────┤
│                      DOMAIN LAYER                            │
│  items/* (Entities, Types, Interfaces)                      │
├─────────────────────────────────────────────────────────────┤
│                   INFRASTRUCTURE LAYER                       │
│  lib/supabase.ts (Database Client)                          │
└─────────────────────────────────────────────────────────────┘
```

### Design Pattern Utilizzati

| Pattern | Utilizzo | File |
|---------|----------|------|
| **Singleton** | Client Supabase unico | `lib/supabase.ts` |
| **Repository** | Accesso dati astratto | `models/*.ts` |
| **Factory** | Creazione oggetti dominio | `models/*.ts` |
| **Observer** | Stato reattivo | `context/*.tsx` |
| **Strategy** | Stili dinamici | `items/Priority.tsx` |
| **Composite** | Provider composition | `app/provider.tsx` |

Per maggiori dettagli, consulta il [Report di Ingegneria del Software](./REPORT_INGEGNERIA_SOFTWARE.md).

---

## 🔧 Configurazione Avanzata

### Variabili d'Ambiente

| Variabile | Obbligatoria | Descrizione |
|-----------|--------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | URL del progetto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Chiave pubblica Supabase |
| `NEXT_PUBLIC_APP_URL` | ❌ | URL base dell'app (default: localhost:3000) |

### Personalizzazione Temi

I colori dei temi sono definiti in `items/Board.tsx`:

```typescript
export const themeBoardOptions = [
    { value: 'blue', label: 'Blu', class: 'bg-blue-500' },
    { value: 'green', label: 'Verde', class: 'bg-green-500' },
    // Aggiungi nuovi temi qui
];
```

### Aggiungere Nuove Icone

Le icone sono definite in `items/BoardIcon.tsx`:

```typescript
export const BoardIcons: Record<Icon, React.ElementType> = {
    personal: User,
    study: GraduationCap,
    // Aggiungi nuove icone qui
};
```

---

## 🐛 Troubleshooting

### Errori Comuni

#### "Invalid API key"

```
Causa: Chiave Supabase non valida o mancante
Soluzione: Verifica NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local
```

#### "Network error"

```
Causa: URL Supabase errato o progetto non attivo
Soluzione: Verifica NEXT_PUBLIC_SUPABASE_URL e lo stato del progetto
```

#### "RLS policy violation"

```
Causa: Mancano le policy di sicurezza
Soluzione: Esegui le query SQL per le policy (vedi Installazione Step 3.2)
```

#### Build fallisce con errori TypeScript

```bash
# Verifica i tipi
bun run type-check

# Aggiorna le dipendenze
bun update
```

---

## 📄 Licenza

Questo progetto è rilasciato sotto licenza **MIT**.

```
MIT License

Copyright (c) 2026 TaskTrack

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 👥 Autori

- **Canossa** - Sviluppo Frontend, PM, Backend Director
- **Affaticati** - Sviluppo Frontend, Auth, DB, Tester

---

## 🙏 Ringraziamenti

- [Next.js](https://nextjs.org/) per il framework
- [Supabase](https://supabase.com/) per il backend
- [Tailwind CSS](https://tailwindcss.com/) per lo styling
- [Lucide](https://lucide.dev/) per le icone
- [Vercel](https://vercel.com/) per l'hosting

---

<div align="center">

**[⬆ Torna all'inizio](#-tasktrack)**

Made with ❤️ for Software Engineering @ Unimib

</div>
