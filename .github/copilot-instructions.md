# Copilot Instructions for TaskTrack

## Project Overview
**TaskTrack** is a personal task/project management application built with Next.js 16, React 19, and TypeScript. It features authentication-gated workspaces, task boards organized by categories (University, Personal, Thesis, Work), and a responsive sidebar navigation.

## Architecture & Key Patterns

### File Structure
- **`app/(auth)/`** - Authentication routes (login page, no auth implemented yet)
- **`app/(workspace)/`** - Protected workspace routes (dashboard, categories, priorities)
- **`app/components/`** - Reusable UI components (BoardCard, dialogs, sidebar)
- **`lib/utils.ts`** - Shared utilities (cn() for classname merging)

### Route Groups (Parenthesized Directories)
- `(auth)` and `(workspace)` are Next.js route groups—they don't appear in URLs
- Use this pattern when adding new feature routes (e.g., `(workspace)/tasks`, `(workspace)/settings`)
- Each group has its own layout.tsx for shared styling/navigation

### Layout Architecture
**Root Layout** ([app/layout.tsx](app/layout.tsx)) - Sets global metadata, font optimization, favicon
**Auth Layout** ([app/(auth)/layout.tsx](app/(auth)/layout.tsx)) - Simple full-width layout for login/register
**Workspace Layout** ([app/(workspace)/layout.tsx](app/(workspace)/layout.tsx)) - Flexbox container with:
  - Sidebar (responsive: hidden on mobile, visible on lg+)
  - Main content area with scroll (`overflow-y-auto`)
  - Mobile sidebar overlay (Sidebar component handles visibility)

### Component Patterns

**BoardCard** ([app/components/BoardCard.tsx](app/components/BoardCard.tsx))
- Uses TypeScript types: `BoardTheme`, `BoardCategory`, `BoardStats`
- Maps theme/category to visual styles via Record types
- Props pattern: id, title, category, theme, stats, onEdit callback
- Imported from lucide-react icons

**Sidebar** ([app/components/sidebar/sidebar.tsx](app/components/sidebar/sidebar.tsx))
- Client component (`'use client'`) with local state management
- State: isFocusMode, isMobileMenuOpen, isBoardsOpen
- NavItem sub-component for consistent navigation styling
- Hardcoded board list (no backend integration yet)

## Development Patterns

### Styling & Tailwind
- Use Tailwind CSS 4 with PostCSS
- Utility-first: apply styles directly in className
- Theme colors: blue, green, purple, orange (used consistently across BoardCard)
- Responsive: `hidden lg:block` for desktop-only, `lg:hidden` for mobile overrides
- Use `cn()` utility from [lib/utils.ts](lib/utils.ts) to merge conflicting Tailwind classes

### Client vs Server Components
- Mark interactive components with `'use client'` (Sidebar, BoardCard, login form)
- Layouts and pages can be server components by default
- Use `usePathname()` from next/navigation for active route detection

### TypeScript Conventions
- Define component interfaces ending with "Props" (e.g., `BoardCardProps`)
- Use Record types for mappings: `Record<Theme, StyleString>`
- Keep types exported if reusable (e.g., `BoardTheme`, `BoardCategory`)

## Build & Run

```bash
npm run dev        # Start dev server (localhost:3000)
npm run build      # Build for production
npm start          # Run production build
npm run lint       # Run ESLint
```

**Key Config**: React Compiler enabled (`reactCompiler: true` in next.config.ts) for optimizations.

## Known Patterns & Conventions

1. **Path Alias**: Use `@/` for absolute imports (e.g., `@/app/components/sidebar`)
2. **Icon Library**: lucide-react for icons (e.g., LayoutDashboard, Tags, Flag)
3. **Hardcoded State**: recentBoards list in sidebar is static—will need backend integration
4. **Italian Comments**: Code comments are in Italian; maintain consistency when editing
5. **No Backend Yet**: Login, boards, and categories are UI-only; no API routes or database

## Common Tasks

**Adding a new workspace page**: Create file in `app/(workspace)/[feature]/page.tsx`, add link in sidebar
**Styling a new component**: Follow BoardCard pattern (interface, types, theme mapping)
**Making a component interactive**: Add `'use client'` and use React hooks (useState, usePathname)
**Mobile responsiveness**: Use Tailwind responsive classes (hidden, lg:block, lg:hidden)
