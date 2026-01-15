# AI Coding Assistant Instructions for TaskTrack

## Project Overview
TaskTrack is a Next.js 16 + React 19 task management application with Kanban board functionality, built with TypeScript, Tailwind CSS 4, and MongoDB for persistent storage.

## Architecture

### Tech Stack
- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS 4, clsx/tailwind-merge for conditional classes
- **Database**: MongoDB (Mongoose ODM)
- **Icons**: Lucide-react, HugeIcons
- **UI Pattern**: Path aliasing via `@/*` → `./` (defined in `tsconfig.json`)

### Directory Structure
```
app/
  ├── (auth)/           # Authentication routes (login, register)
  ├── (workspace)/      # Protected routes with Sidebar layout
  │   ├── board/[id]/   # Kanban board view (dynamic route)
  │   ├── dashboard/    # Overview/home page
  │   ├── categories/   # Category management
  │   └── priorities/   # Priority management
  ├── api/              # Route handlers (Next.js App Router)
  │   ├── boards/[boardId]/tasks/
  │   ├── tasks/
  │   └── utente/
  ├── components/       # React components (6 subdirectories below)
  ├── context/          # React Context (FocusContext for focus mode)
  └── types/            # TypeScript interfaces (task.tsx)
lib/
  ├── mongodb.ts        # MongoDB connection singleton
  └── utils.ts          # Utility functions (e.g., `cn()` for class merging)
models/
  ├── Task.ts           # Mongoose Task schema with timestamps
public/
  ├── datas.tsx         # Mock data (initialBoards)
  ├── Board.tsx         # Board utilities (getClassByTheme)
  ├── Category.tsx      # Category type definitions
  └── Priority.tsx      # Priority enum/type
```

## Key Components & Patterns

### Kanban Board Architecture
- **Columns**: Fixed columnId values (`'todo'`, `'inprogress'`, `'done'`) in Task schema
- **Workspace Layout** (`(workspace)/layout.tsx`): Wraps child pages with Sidebar, FocusProvider, and FocusOverlay
- **Sidebar** (`components/sidebar/Sidebar.tsx`): Client-only (`'use client'`), handles navigation, logout, focus mode toggle
- **Focus Mode**: Context-based timer in FocusContext tracking elapsed seconds; overlay rendered by FocusOverlay component

### Task Model
Located in [models/Task.ts](models/Task.ts):
- Mongoose schema with fields: `title`, `description`, `boardId` (ref to Board), `categories`, `priority`, `columnId`, `dueDate`, `assignees`, `comments`, `attachments`
- Auto-timestamps via `{ timestamps: true }`
- Singleton export: `mongoose.models.Task || mongoose.model("Task", TaskSchema)`

### Data Types
Located in [app/types/task.tsx](app/types/task.tsx):
- `Task` interface matches schema fields; optional `_id` for creation
- `ColumnId = 'todo' | 'inprogress' | 'done'`
- `ColumnData` for rendering column headers with color theming

### API Routes (Next.js Route Handlers)
- **POST `/api/tasks`**: Create task from JSON body
- **GET `/api/boards/[boardId]/tasks`**: Fetch tasks (currently returns all; TODO: filter by boardId)
- All routes follow: connect → query → return NextResponse.json

## Development Workflow

### Run Development Server
```bash
cd my-app && npm run dev
# or: bun dev
# Opens http://localhost:3000
```

### Build & Production
```bash
npm run build   # Compile for production
npm run start   # Run production server
```

### Linting
```bash
npm run lint    # ESLint check
```

## Conventions & Best Practices

### Code Style
- **TypeScript mandatory** for `.tsx` and `.ts` files
- **React Compiler enabled** (`reactCompiler: true` in next.config.ts)
- Use `cn()` utility (`lib/utils.ts`) to merge Tailwind classes conditionally: `cn('base-class', condition && 'conditional-class')`
- Client components marked with `'use client'` (Sidebar, dialogs, context consumers)

### Tailwind & Styling
- Import `@import "tailwindcss"` in globals.css; Tailwind 4 with inline theme variables
- Color palette uses semantic names: `blue-50`, `gray-100`, `destructive`, etc.
- Responsive breakpoints: `lg:` for desktop (≥1024px), mobile-first design
- Z-index management: Sidebar `z-40`, mobile header `z-50`, overlay `z-0`

### MongoDB & API Design
- **Connection**: `lib/mongodb.ts` handles connection singleton (async `connectMongoDB()` function)
- **API Error Handling**: Wrap in try-catch, return `NextResponse.json(error, { status: 500 })`
- **Query Filtering**: Route params accessed via `await params` (Next.js 15+) before querying

### Component Patterns
- **Dialog Components**: `CreateBoardDialog`, `EditBoardDialog`, `EditTaskDialog`, `LogoutDialog` (state in parent)
- **Navigation**: Use Next.js `Link`, `usePathname()`, `useRouter()` from `next/navigation`
- **Icons**: Import from `lucide-react` (e.g., `LayoutDashboard`, `Plus`, `ChevronRight`)

### Context & State
- Global state (focus mode, overlay visibility) via React Context
- Local component state via `useState` hook
- Side effects (timers, etc.) via `useEffect` with proper cleanup

## Critical Integration Points

1. **Sidebar ↔ Layout**: Sidebar rendered in `(workspace)/layout.tsx` with FocusProvider wrapper; focus state controls overlay visibility
2. **Task Creation**: Dialog in Sidebar → API POST → Sidebar state update (TODO: refactor to async/optimistic)
3. **Board Navigation**: Dynamic `[id]` routes fetch tasks from `/api/boards/[boardId]/tasks`
4. **Auth**: `(auth)` folder handles login/register; Sidebar logout navigates to `/login`

## Known Issues / TODOs
- API `GET /api/boards/[boardId]/tasks` doesn't filter by `boardId`; currently returns all tasks
- Focus mode timer display not yet implemented in UI
- Task assignment and attachment features partially stubbed

## Debugging Tips
- Enable Next.js Server Logs: Terminal shows API request paths, database errors
- MongoDB connection errors: Check `MONGODB_URI` env var and network access
- Component re-renders: React Compiler enabled; use React DevTools Profiler
- Missing types: Check `app/types/task.tsx` and import `Task` interface for API responses
