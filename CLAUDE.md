# CLAUDE.md — flowapprove-frontend

Guidance for Claude Code when working in this repository.

## What this is

The React 19 + Vite SPA for **FlowApprove**, a multi-tenant document approval workflow system. Sibling repos: `flowapprove-backend/` (Django API) and `flowapprove-docs/` (documentation).

The actual app lives in `frontend/` (this repo is a thin wrapper around a single Vite project).

## Commands

Run from `frontend/`:

```bash
npm install
npm run dev         # Vite dev server :5173
npm run build       # production build → dist/
npm run preview     # preview the production build
npm run lint        # ESLint (flat config in eslint.config.js)
```

## Tech stack

- **React 19** with **Vite**
- **React Router v7** for routing
- **TanStack Query** for server state (lists, detail, dashboard stats)
- **Axios** via a single configured instance in `src/services/api.js`
- **react-hook-form** for forms
- **react-pdf** for inline PDF viewing
- **react-dropzone** for uploads
- **react-hot-toast** for notifications
- Custom CSS (no UI framework)

## Structure

```
frontend/src/
├── main.jsx / App.jsx
├── context/
│   └── AuthContext.jsx          # auth state, login/logout, current user
├── services/
│   ├── api.js                   # axios instance + JWT Authorization header
│   ├── authService.js
│   ├── documentService.js
│   └── workflowService.js
├── components/
│   ├── Auth/
│   ├── Dashboard/
│   ├── Documents/               # react-pdf viewer, react-dropzone upload, comments
│   ├── Layout/
│   ├── Users/
│   └── Workflows/
├── global/   styles/   assets/
└── App.css / index.css
```

## Golden rules

1. **Never call `axios` directly from a component.** Extend the matching `src/services/*Service.js` and import the function. This keeps the JWT header and base URL handling in one place.
2. **After any mutation (approve / reject / sendback / upload / version)**, invalidate the relevant TanStack Query keys (`documents` list + the affected detail) so the UI reflects reality.
3. **Auth state is owned by `AuthContext`.** Don't read the JWT from `localStorage` elsewhere — go through the context or the axios interceptor.
4. **API contracts are not shared** with the backend. If you add or change an endpoint, also update `flowapprove-backend/api/views.py` + `serializers.py` in the same change.
5. **Document comments can be page-anchored** (`page_number` field) — preserve this when editing the Documents area.

## Domain concepts (quick reference)

- **Organization** — tenant workspace, created on sign-up.
- **User** — `ADMIN` or `USER` role. Users can only approve steps assigned to them.
- **Workflow** — ordered list of steps, each bound to a specific user.
- **Document** — file + `status` (`PENDING`/`APPROVED`/`REJECTED`) + `current_step` pointer into the workflow.
- **Approve / Reject / Send Back** — only the user at `current_step` may act. Send-back requires a reason and returns the document to the previous step.
- **Versions** — re-upload is only allowed after rejection; uploads reset the workflow to step 1.

## Full documentation

See `flowapprove-docs/` for architecture diagrams, API reference, data model, deployment checklist, and the security model.
