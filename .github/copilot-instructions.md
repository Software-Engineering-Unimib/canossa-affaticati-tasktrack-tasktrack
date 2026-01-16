# Copilot Instructions for TaskTrack

## Project Overview
- **Framework:** Next.js (App Router, TypeScript)
- **UI:** Tailwind CSS, custom components in `my-app/components/`
- **Backend:** Supabase (see `my-app/lib/supabase.ts`)
- **Domain:** Task and board management for students

## Key Architecture
- **App Structure:**
  - Pages and layouts in `my-app/app/` (auth, workspace, dashboard, board, categories, priorities)
  - API routes in `my-app/app/api/` (REST endpoints for users)
  - Models in `my-app/models/` (Board, Task, Category, etc.)
  - Contexts in `my-app/context/` (e.g., FocusContext)
- **Data Flow:**
  - Supabase client handles all DB operations (CRUD, relations)
  - Models encapsulate queries and business logic (see `BoardModel` in `models/Board.ts`)
  - Components receive data via props or fetch directly using models

## Developer Workflow
- **Start Dev Server:**
  - Use `bun dev`, `npm run dev`, `yarn dev`, or `pnpm dev` in `my-app/`
- **Environment:**
  - Set Supabase credentials in `.env.local`
- **Hot Reload:**
  - Edit files in `app/` or `components/` for instant updates
- **API Testing:**
  - Test endpoints in `app/api/` using browser or tools like Postman

## Project-Specific Patterns
- **Model Usage:**
  - Always use model classes (e.g., `BoardModel`) for DB access, not direct Supabase calls in components
- **Component Structure:**
  - UI split into dialogs, cards, overlays, sidebar, etc. (see `components/`)
  - Auth flows use dialogs (`registerDialog`, `forgotPasswordDialog`)
- **TypeScript:**
  - All models and components are typed; extend interfaces in `models/` for new entities
- **Routing:**
  - Dynamic routes use `[id]` folders (e.g., `board/[id]/page.tsx`)

## Integration Points
- **Supabase:**
  - All DB and auth logic via `lib/supabase.ts` and model classes
- **External Icons:**
  - Uses `lucide-react` for icons

## Conventions
- **Naming:**
  - PascalCase for components and models
  - camelCase for variables and functions
- **Localization:**
  - Some UI text is in Italian; maintain consistency
- **Testing:**
  - No explicit test setup found; add tests in `__tests__/` if needed

## Examples
- To fetch all boards for a user:
  ```ts
  const { data, error } = await BoardModel.findByUserId(userId);
  ```
- To create a new board:
  ```ts
  const { data, error } = await BoardModel.create({ title, icon, theme, owner_id });
  ```

---
For unclear patterns or missing documentation, ask the user for clarification or examples from existing code.
