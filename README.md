# FlowApprove Frontend

React 19 + Vite SPA for **FlowApprove**, a multi-tenant document approval workflow system.

Sibling repos: [flowapprove-backend](https://github.com/ThkSanidhya/flowapprove-backend) · [flowapprove-docs](https://github.com/ThkSanidhya/flowapprove-docs)

The actual Vite project lives in **[`frontend/`](./frontend)** (this repo is a thin wrapper so we can keep Docker and CI metadata at the top level).

The easiest way to run the full stack is from the [**meta-repo**](https://github.com/ThkSanidhya/flowapprove) with Docker. Keep reading if you want to run the frontend natively against a running backend.

---

## Quickstart — native (Linux / macOS / Windows)

### Prerequisites

- **Node.js 20+** — <https://nodejs.org/> (pick the "LTS" installer)
- A running backend at `http://localhost:8000/api` (see [flowapprove-backend](https://github.com/ThkSanidhya/flowapprove-backend))

### 1. Clone and install

```bash
git clone https://github.com/ThkSanidhya/flowapprove-frontend.git
cd flowapprove-frontend/frontend
npm install
```

### 2. Point at your backend (optional)

Copy the example env file and edit `VITE_API_URL` if your backend isn't on `localhost:8000`:

```bash
cp .env.example .env
```

**Windows PowerShell equivalent:**
```powershell
Copy-Item .env.example .env
```

### 3. Start the dev server

```bash
npm run dev
```

Open **http://localhost:5173** in your browser. Vite hot-reloads on save.

---

## Commands cheat sheet

| Task                   | Command          |
|------------------------|------------------|
| Install dependencies   | `npm install`    |
| Dev server (hot reload)| `npm run dev`    |
| Production build       | `npm run build`  |
| Preview production build| `npm run preview` |
| Lint                   | `npm run lint`   |

All commands must be run from **`frontend/`**, not the repo root.

---

## Project structure

```
frontend/src/
├── main.jsx / App.jsx            # entry + router
├── context/
│   └── AuthContext.jsx           # JWT-based auth state, login/logout
├── services/
│   ├── api.js                    # axios instance + auth interceptor + 401 handler
│   ├── authService.js
│   ├── documentService.js        # upload, approve, reject, sendback, recall, uploadVersion
│   ├── userService.js
│   └── workflowService.js
├── components/
│   ├── Auth/Login.jsx + Register.jsx
│   ├── Dashboard/                # UserDashboard + DocumentTable
│   ├── Documents/
│   │   ├── DocumentList.jsx
│   │   ├── DocumentUpload.jsx
│   │   ├── DocumentViewer.jsx    # inline PDF/image/DOCX renderer
│   │   └── EnhancedDocumentDetail.jsx  # tabs, approvals, versions, comments
│   ├── Layout/Layout.jsx
│   ├── Users/UserList.jsx
│   ├── Workflows/WorkflowList.jsx + WorkflowForm.jsx
│   └── ErrorBoundary.jsx
└── styles/ + assets/
```

---

## Key libraries

- **Vite** — dev server and build tool
- **React 19** + **React Router v7**
- **TanStack Query** — server state cache
- **Axios** — HTTP client with JWT interceptor
- **docx-preview** — inline `.docx` rendering (new in this version)
- **react-pdf** — inline PDF handling
- **react-dropzone** — upload drag-and-drop
- **react-hot-toast** — toast notifications

---

## Troubleshooting

**"CORS error" or blank screen** — your backend isn't running on the URL `VITE_API_URL` points at. Confirm `http://localhost:8000/api/healthz` returns `{"status":"ok"}` in a browser tab first.

**401 on every request** — JWT access tokens expire in 60 minutes (15 in production). Log out and back in.

**`npm install` hangs on Windows** — try `npm install --force` or delete `node_modules/` and `package-lock.json`, then retry.

**DOCX preview shows an error** — the file may be corrupted, password-protected, or an old `.doc` (not `.docx`). Use "Open in new tab" or "Download" as the fallback.

**"Port 5173 is already in use"** — another Vite instance is running. Kill it or start this one on a different port: `npm run dev -- --port 5174`.
