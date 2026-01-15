# AI Coding Assistant Instructions for TaskTrack

## Quick Start

**Development**: `cd my-app && npm run dev` → http://localhost:3000
**Build/Lint**: `npm run build`, `npm run start`, `npm run lint`
**Database**: Requires `MONGODB_URI` environment variable

**Key Files**:
- [app/types/task.tsx](app/types/task.tsx) – Task interface & ColumnId union type
- [models/Task.ts](models/Task.ts) – Mongoose schema definition
- [lib/mongodb.ts](lib/mongodb.ts) – MongoDB singleton connection
- [app/(workspace)/layout.tsx](app/(workspace)/layout.tsx) – Workspace root with FocusProvider

## Architecture Overview

**Stack**: Next.js 16 + React 19 + TypeScript + Tailwind CSS 4 + MongoDB (Mongoose)

**Three-Layer Structure**:
1. **UI Layer**: React components (`app/components/`) with `'use client'` for interactive features
2. **API Layer**: Next.js route handlers (`app/api/`) following pattern: connect MongoDB → query → return JSON
3. **Data Layer**: Mongoose schemas (`models/`) + type definitions (`app/types/`)

**Layout Hierarchy**:
- `app/layout.tsx` (root, sets metadata)
  - `app/(auth)/layout.tsx` (login/register, no sidebar)
  - `app/(workspace)/layout.tsx` (protected routes wrapped with FocusProvider, Sidebar, FocusOverlay)

## Core Patterns

### Kanban Board
- **Fixed columns**: `columnId` in Task schema uses union type: `'todo' | 'inprogress' | 'done'`
- **Board discovery**: Pages reference dynamic route `board/[id]` which fetches tasks via `GET /api/boards/[boardId]/tasks`
- **Focus Mode**: Global state via `FocusContext` (timer tracking seconds elapsed); overlay visibility controlled by context value

### Mongoose + API Routes
**Connection Pattern** (in every API route):
```typescript
import connectMongoDB from '@/lib/mongodb';
await connectMongoDB();
const data = await Task.find({ /* query */ });
```
**Dynamic params**: Use `await params` before destructuring (Next.js 15+ requirement).
Example from [app/api/boards/[boardId]/tasks/route.ts](app/api/boards/[boardId]/tasks/route.ts):
```typescript
const { boardId } = await params;
const tasks = await Task.find({ boardId });
```

### Component State & Context
- **Global state**: Focus mode (`isFocusMode`, `toggleFocusMode`, `seconds`) via `FocusProvider` → consumed by Sidebar & FocusOverlay
- **Local state**: Dialog visibility, form inputs via `useState` in component
- **Side effects**: Timer logic uses `useEffect` with interval cleanup (see FocusContext pattern)

## Code Conventions

**TypeScript**: Mandatory for `.tsx` / `.ts` files. Import Task interface from `app/types/task.tsx` in API routes.

**React**: 
- Mark interactive components `'use client'` (Sidebar, dialogs, anything with hooks)
- Server components (pages) default; use client components sparingly
- Icons: `lucide-react` preferred (LayoutDashboard, Plus, ChevronRight, etc.)

**Styling**:
- Use `cn()` utility (`lib/utils.ts`) to merge Tailwind classes: `cn('base', condition && 'variant')`
- Colors: semantic names (blue-50, gray-100, destructive)
- Responsive: `lg:` breakpoint for desktop (≥1024px); mobile-first
- Z-index hierarchy: Sidebar z-40, mobile header z-50, FocusOverlay z-0 (intentionally low to allow Sidebar interaction)

**Error Handling** (API routes):
```typescript
try {
  await connectMongoDB();
  // query
  return NextResponse.json(result);
} catch (error) {
  return NextResponse.json({ error: 'message' }, { status: 500 });
}
```

## Critical Integration Points

1. **Sidebar ↔ FocusMode**: Sidebar (`use client`) toggles `FocusContext.toggleFocusMode()` → FocusOverlay visibility updates
2. **Task Creation Flow**: Dialog in Sidebar → POST to `/api/tasks` → state refresh (currently TODO: refactor to optimistic update)
3. **Board Navigation**: `board/[id]` page fetches tasks from `/api/boards/[boardId]/tasks` endpoint
4. **Auth Guard**: `(auth)` folder is public; `(workspace)` requires auth (implement via middleware if not present)

## Known Gaps & TODOs

- **API filtering**: `GET /api/boards/[boardId]/tasks` returns all tasks (should filter by `boardId` ObjectId)
- **Focus UI**: Timer value in FocusContext exists but display in UI not implemented
- **Assignees/Attachments**: Schema fields present but UI partially stubbed
- **Mongoose connection caching**: Uses global cache pattern; test for connection leaks under load

## Debugging Checklist

- **MongoDB errors**: Verify `MONGODB_URI` env var, network access, connection string format
- **API params**: Always use `await params` in dynamic route handlers (common Next.js 15+ gotcha)
- **Missing types**: Check `app/types/task.tsx`; import `Task` interface in API responses
- **React rerender issues**: React Compiler enabled; use DevTools Profiler to identify avoidable renders
- **Sidebar not responsive**: Check `'use client'` declaration; context not accessible in server components
