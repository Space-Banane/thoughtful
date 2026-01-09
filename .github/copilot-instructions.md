# Thoughtful - AI Coding Instructions

## Project Overview
Thoughtful is a full-stack personal idea notebook app. Users can create, organize, and manage ideas with rich metadata (tags, icons, todos, resources).

**Architecture**: Monorepo with separate backend (Node.js API) and frontend (React Router SSR)
- Backend: rjweb-server framework (file-based routing), MongoDB, TypeScript
- Frontend: React Router v7 with SSR, Tailwind CSS v4, Vite

## Critical Patterns

### Backend Route Structure (rjweb-server)
All backend routes use the **rjweb-server FileLoader pattern** - routes auto-register by file path:
```typescript
// Pattern: export = new fileRouter.Path("/").http(METHOD, "/path", handler)
export = new fileRouter.Path("/").http("POST", "/api/ideas/create", (http) =>
  http.onRequest(async (ctr) => { /* ... */ })
);
```
- Routes placed in `backend/src/routes/` auto-load via FileLoader in [index.ts](backend/src/index.ts#L21-L22)
- Use `ctr.bindBody((z) => z.object({...}))` for request validation (built-in Zod)
- Return `[data, error]` tuple pattern from bindBody - always check for error before using data
- **Authentication**: Use `authCheck(ctr.cookies.get("thoughtful_session"))` helper from [lib/Auth.ts](backend/src/lib/Auth.ts)

### Data Models & Types
Shared TypeScript interfaces in [backend/src/types.ts](backend/src/types.ts) define the core domain:
- **Idea**: main entity (id, userId, title, description, tags, icon, todos, resources, timestamps)
- **User**: id, username, passwordHash
- **Session**: token-based auth with 90-day expiry
- Frontend mirrors these types in [frontend/app/services/notebook.ts](frontend/app/services/notebook.ts) but uses `Note` instead of `Idea`

### Authentication Flow
- Login creates session token (sha256 hash), stores in MongoDB `sessions` collection
- Token set as `thoughtful_session` cookie with configurable domain (`.env` → `COOKIE_DOMAIN`)
- All `/api/ideas/*` routes require authentication via `authCheck()` helper
- Cookie domain configurable in [index.ts](backend/src/index.ts#L9-L11) config object

### Frontend Service Layer
API calls abstracted in [frontend/app/services/notebook.ts](frontend/app/services/notebook.ts):
- `createNote()`, `listNotes()`, `updateNote()`, `deleteNote()`, `searchNotes()`
- Base URL from `import.meta.env.VITE_API_BASE` (defaults to `http://localhost:8080`)
- Handles icon name conversion between frontend (LucideIcon) and backend (string)

### Icon System
Dual representation pattern:
- Backend stores icon as **string** (e.g., "Lightbulb", "Rocket")
- Frontend converts to **LucideIcon** component via [utils/iconMap.ts](frontend/app/utils/iconMap.ts)
- Available icons defined in [NoteModal.tsx](frontend/app/components/NoteModal.tsx#L16-L28) iconOptions array

## Developer Workflows

### Running the Stack
**Both projects use pnpm** - ensure it's installed globally.

Backend (port 8080):
```bash
cd backend
pnpm dev  # Builds TS → dist/, runs node dist/index.js
```

Frontend (port 5173):
```bash
cd frontend
pnpm dev  # React Router dev server with HMR
```

**Production**: Backend serves frontend static files from `frontend/build/client` ([index.ts](backend/src/index.ts#L27-L35))

### Database Setup
Requires MongoDB connection string in `.env` at project root:
```
DB_CONN_STRING=mongodb://...
COOKIE_DOMAIN=localhost
```
Database name: `thoughtful` (see [index.ts](backend/src/index.ts#L15))

### Building
- Backend: `pnpm build` → compiles TS to `dist/`
- Frontend: `pnpm build` → React Router builds SSR app to `build/`

## Project-Specific Conventions

1. **No traditional file-based routing**: Backend routes explicitly define HTTP method and path, not derived from file structure
2. **Icons as strings**: Always store/send icon names as strings in API, convert to components only in frontend
3. **Nested resource limits**: Max 5 tags, 5 todo lists, 100 items per list (enforced in [create.ts](backend/src/routes/ideas/create.ts#L24-L36) validation)
4. **Date handling**: MongoDB stores Date objects, frontend converts from ISO strings to Date
5. **Session cookies**: Domain configurable for production cross-subdomain auth
6. **Soft frontend fallback**: Backend 404 handler serves frontend index.html for client-side routing ([index.ts](backend/src/index.ts#L33-L36))

## Key Files Reference
- [backend/src/index.ts](backend/src/index.ts) - Server setup, DB connection, FileLoader registration, SPA fallback
- [backend/src/lib/Auth.ts](backend/src/lib/Auth.ts) - Authentication helper (session validation)
- [frontend/app/services/notebook.ts](frontend/app/services/notebook.ts) - API client layer
- [frontend/app/components/NoteModal.tsx](frontend/app/components/NoteModal.tsx) - Complex form with todos/resources management
