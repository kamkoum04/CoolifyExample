# 🚀 Coolify Deployment Dashboard

A simplified deployment dashboard that allows users to deploy and manage applications through the **Coolify API**, organized by user projects.

## Architecture

```
┌─────────────────┐      ┌─────────────────┐      ┌──────────────────┐
│    Frontend      │ ───► │  Backend Proxy   │ ───► │  Coolify API     │
│  React + TS      │      │  Express.js      │      │  (Your Instance) │
│  Tailwind CSS    │      │  Port 3001       │      │                  │
│  React Query     │      │  Hides API Token │      │                  │
│  Port 5173       │      │                  │      │                  │
└─────────────────┘      └─────────────────┘      └──────────────────┘
```

## Features

- **Project-based organization** — Each user gets their own Coolify project (e.g., "hamza")
- **Auto project creation** — If a project doesn't exist for the user, it's created automatically
- **Application cards** showing name, status, domain, git info, and timestamps
- **Status badges** — Running (green), Deploying (blue pulse), Stopped (gray), Failed (red)
- **Actions** — Start, Stop, Restart, Deploy, View Logs, Delete
- **Real-time logs** viewer with auto-scroll
- **New Application dialog** — Deploy from any public Git repository
- **Auto-refresh** — Applications and deployments refresh every 10 seconds

## Tech Stack

| Layer    | Technology                                |
| -------- | ----------------------------------------- |
| Frontend | React 18 + TypeScript, Vite               |
| Styling  | Tailwind CSS                              |
| State    | TanStack React Query                      |
| Icons    | Lucide React                              |
| Backend  | Express.js (API proxy)                    |
| API      | Coolify REST API v1                       |

## Quick Start

### 1. Configure the backend

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` with your Coolify details:

```env
COOLIFY_API_URL=https://your-coolify-instance.com
COOLIFY_API_TOKEN=your-api-token-here
PORT=3001
```

**To get your API token:**
1. Log into your Coolify dashboard
2. Go to **Settings → API Tokens** (or Keys & Tokens → API Tokens)
3. Click **Create New Token**
4. Copy the token

### 2. Install & run

```bash
# Terminal 1 — Backend
cd backend
npm install
npm run dev

# Terminal 2 — Frontend
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

### 3. With Docker Compose (alternative)

```bash
# From the coolify-dashboard root
docker compose up --build
```

## How User/Project Separation Works

1. The dashboard uses a **static username** (currently `"hamza"`) set in `Dashboard.tsx`
2. On load, it calls `GET /api/v1/projects` to check if a project named `"hamza"` exists
3. If **not found** → creates it via `POST /api/v1/projects` with `{ name: "hamza" }`
4. All applications are then listed from that project's `"production"` environment
5. New applications are created under the same project UUID

This approach allows **separating users by project name** — each user's apps live in their own project.

## API Endpoints Proxied

| Frontend Route                          | Coolify API                                      |
| --------------------------------------- | ------------------------------------------------ |
| `GET /api/health`                       | `GET /api/v1/version`                            |
| `GET /api/servers`                      | `GET /api/v1/servers`                             |
| `GET /api/projects`                     | `GET /api/v1/projects`                            |
| `POST /api/projects`                    | `POST /api/v1/projects`                           |
| `GET /api/projects/:uuid`              | `GET /api/v1/projects/:uuid`                      |
| `GET /api/projects/:uuid/:env`         | `GET /api/v1/projects/:uuid/:env`                 |
| `GET /api/applications`                | `GET /api/v1/applications`                        |
| `POST /api/applications/public`        | `POST /api/v1/applications/public`                |
| `GET /api/applications/:uuid/start`    | `GET /api/v1/applications/:uuid/start`            |
| `GET /api/applications/:uuid/stop`     | `GET /api/v1/applications/:uuid/stop`             |
| `GET /api/applications/:uuid/restart`  | `GET /api/v1/applications/:uuid/restart`          |
| `GET /api/applications/:uuid/logs`     | `GET /api/v1/applications/:uuid/logs`             |
| `DELETE /api/applications/:uuid`       | `DELETE /api/v1/applications/:uuid`               |
| `GET /api/deploy?uuid=...`             | `GET /api/v1/deploy?uuid=...`                     |
| `GET /api/deployments`                 | `GET /api/v1/deployments`                         |

## Project Structure

```
coolify-dashboard/
├── docker-compose.yaml
├── backend/
│   ├── .env.example
│   ├── Dockerfile
│   ├── package.json
│   └── server.js                # Express proxy server
└── frontend/
    ├── Dockerfile
    ├── index.html
    ├── package.json
    ├── vite.config.ts
    ├── tsconfig.json
    ├── tailwind.config.js
    ├── postcss.config.js
    └── src/
        ├── main.tsx
        ├── App.tsx              # QueryClient setup
        ├── index.css            # Tailwind + custom classes
        ├── lib/
        │   └── utils.ts         # cn(), formatDate, status helpers
        ├── types/
        │   └── coolify.ts       # TypeScript interfaces
        ├── services/
        │   └── api.ts           # API client functions
        ├── hooks/
        │   └── use-coolify.ts   # React Query hooks
        └── components/
            ├── Header.tsx
            ├── Dashboard.tsx    # Main page with project/user logic
            ├── AppCard.tsx      # Application card with actions
            ├── NewAppDialog.tsx # Create application form
            ├── LogsDialog.tsx   # Live log viewer
            └── ui/
                └── shared.tsx   # Dialog, Input, Select, Spinner, etc.
```
