# Coolify Example — Task Board & Custom Dashboard

This repository is a **hands-on demo** designed to show a development team how Coolify works, from the simplest single-service deployment up to a custom management dashboard that talks to Coolify's own API.

Everything here is intentionally kept simple so that anyone on the team — even with no prior Coolify experience — can understand it in one read.

---

## 📁 What's in this repo

```
├── stage1-frontend-only/      # Simplest case: one React app, no backend
├── stage2-frontend-backend/   # Two containers: Nginx + Express API
├── stage3-fullstack-database/ # Three containers: Nginx + Express + PostgreSQL
└── coolify-dashboard/         # Custom Coolify management dashboard (proxy pattern)
```

---

## 🧪 The Test Applications (Stages 1 – 3)

These three stages all implement the **same Task Board app** (add tasks, check them off, delete them).  
Each stage adds one more layer of complexity so you can see how Coolify handles it.

### Stage 1 — Frontend Only

> "Just a React page. No server needed."

- The app runs entirely in the browser. Tasks are saved in `localStorage`.
- There is only **one container** (Nginx serving the built files).
- **Build pack:** Nixpacks (Coolify detects Vite automatically) or Dockerfile.

```
Browser  ──►  Nginx (port 80)  ──►  React app (static files)
```

**Deploy steps on Coolify:**
1. New application → pick this repository.
2. Base directory: `/stage1-frontend-only`
3. Build pack: **Nixpacks** (or Dockerfile).
4. Deploy — done.

**What you see:** One service, one domain, zero environment variables needed.

---

### Stage 2 — Frontend + Backend

> "The frontend calls an API. Both run in Docker Compose."

- Tasks are now stored in a **JSON file** on the backend server.
- There are **two containers**: the React/Nginx frontend and an Express.js API.
- The frontend talks to the backend using the internal Docker network name `backend`.
- **Build pack:** Docker Compose.

```
Browser  ──►  Nginx :80  ──►  Express API :3001  ──►  tasks.json
```

**Backend API endpoints:**
| Method | Path | What it does |
|--------|------|--------------|
| GET | `/api/tasks` | Return all tasks |
| POST | `/api/tasks` | Create a task |
| PATCH | `/api/tasks/:id` | Update a task |
| DELETE | `/api/tasks/:id` | Delete a task |
| GET | `/api/health` | Health check |

**Deploy steps on Coolify:**
1. New application → **Docker Compose** build pack.
2. Base directory: `/stage2-frontend-backend`
3. Docker Compose file: `/docker-compose.yaml`
4. Assign a domain to the `frontend` service.
5. Deploy.

**What you see:** Two services, service-to-service networking, restart policies.

---

### Stage 3 — Fullstack + Database

> "Same app, but tasks live in a real PostgreSQL database with automatic migrations."

- **Three containers:** frontend, backend (Express + Prisma ORM), PostgreSQL.
- Prisma runs migrations automatically on startup — no manual SQL needed.
- A named Docker volume keeps the database data alive across restarts.
- **Build pack:** Docker Compose.

```
Browser  ──►  Nginx :80  ──►  Express/Prisma :3001  ──►  PostgreSQL :5432
```

**Deploy steps on Coolify:**
1. New application → **Docker Compose** build pack.
2. Base directory: `/stage3-fullstack-database`
3. Docker Compose file: `/docker-compose.yaml`
4. Assign a domain to the `frontend` service.
5. Deploy.

> **Alternative:** Create a managed PostgreSQL database inside Coolify, skip the `db` service from the compose file, and set `DATABASE_URL` as an environment variable pointing to Coolify's database.

**What you see:** Database management, environment variables, persistent volumes, health checks.

---

### WordPress Advanced (bonus)

> "Four containers: a real-world CMS stack."

| Service | Port | Role |
|---------|------|------|
| WordPress | 80 | Main site |
| MariaDB | 3306 | Database |
| Redis | 6379 | Object cache |
| phpMyAdmin | 80 | DB admin UI |

**Deploy steps on Coolify:**
1. New application → **Docker Compose** build pack.
2. Base directory: `/wordpress-advanced`
3. Assign a domain to `wordpress` and a separate domain to `phpmyadmin`.
4. Set env vars: `WORDPRESS_DB_PASSWORD`, `MYSQL_ROOT_PASSWORD`.
5. Deploy.

---

## 🖥️ Custom Coolify Dashboard (`/coolify-dashboard`)

> This is the most interesting part of the repo for the dev team.

### What problem does it solve?

Coolify's own UI is powerful but not always what you want to expose. This custom dashboard shows how to **build your own management UI on top of the Coolify REST API** using a simple proxy pattern.

### Architecture

```
┌──────────────────┐        ┌────────────────────┐        ┌──────────────────┐
│   React Frontend │  HTTP  │  Express Backend    │  HTTP  │  Coolify API     │
│   (Vite + TS)    │ ──────► │  (Proxy / Guard)   │ ──────► │  /api/v1/...    │
│   Tailwind CSS   │        │  Hides API token    │        │                  │
│   React Query    │        │  Port 3001          │        │  Your instance   │
│   Port 5173      │        │                     │        │                  │
└──────────────────┘        └────────────────────┘        └──────────────────┘
```

**Why a backend proxy?**

The Coolify API requires a secret API token. You cannot put that token in the React frontend code because anyone can read it in the browser. The Express backend:
1. Receives requests from the frontend (no token needed from the frontend side).
2. Adds the secret token to every outgoing request to Coolify.
3. Returns the response to the frontend.

The frontend never sees the token. It only talks to `/api/*` on its own backend.

---

### Features

| Feature | Description |
|---------|-------------|
| Project isolation | Each user has their own Coolify project (auto-created on first login) |
| Application cards | Shows name, status badge, domain, git branch, and last update time |
| Status badges | Running (green), Deploying (animated blue), Stopped (gray), Failed (red) |
| Start / Stop / Restart | One-click lifecycle controls for each app |
| Force deploy | Trigger a new deployment of any app |
| Live log viewer | Stream the last N lines of container logs with auto-scroll |
| Deployment history | Browse past deployments and their logs |
| New app dialog | Deploy any public Git repository using pre-set templates or a custom form |
| Deployment templates | One-click deploy for Stage 1, 2, 3 and WordPress from this repo |
| Auto-refresh | All data refreshes every 10 seconds via React Query |

---

### Backend Proxy — API Routes

The backend (`backend/server.js`) exposes these routes. Each one proxies exactly one Coolify API call.

#### Health
| Method | Proxy Route | Coolify API Called |
|--------|-------------|--------------------|
| GET | `/api/health` | `GET /api/v1/version` |

#### Servers
| Method | Proxy Route | Coolify API Called |
|--------|-------------|--------------------|
| GET | `/api/servers` | `GET /api/v1/servers` |

#### Projects
| Method | Proxy Route | Coolify API Called |
|--------|-------------|--------------------|
| GET | `/api/projects` | `GET /api/v1/projects` |
| POST | `/api/projects` | `POST /api/v1/projects` |
| GET | `/api/projects/:uuid` | `GET /api/v1/projects/:uuid` |
| DELETE | `/api/projects/:uuid` | `DELETE /api/v1/projects/:uuid` |
| GET | `/api/projects/:uuid/environments` | `GET /api/v1/projects/:uuid/environments` |
| GET | `/api/projects/:uuid/:envNameOrUuid` | `GET /api/v1/projects/:uuid/:envNameOrUuid` |

#### Applications
| Method | Proxy Route | Coolify API Called |
|--------|-------------|--------------------|
| GET | `/api/applications` | `GET /api/v1/applications` |
| GET | `/api/applications/:uuid` | `GET /api/v1/applications/:uuid` |
| POST | `/api/applications/public` | `POST /api/v1/applications/public` |
| PATCH | `/api/applications/:uuid` | `PATCH /api/v1/applications/:uuid` |
| DELETE | `/api/applications/:uuid` | `DELETE /api/v1/applications/:uuid` |

#### Application Lifecycle
| Method | Proxy Route | Coolify API Called |
|--------|-------------|--------------------|
| GET | `/api/applications/:uuid/start` | `GET /api/v1/applications/:uuid/start` |
| GET | `/api/applications/:uuid/stop` | `GET /api/v1/applications/:uuid/stop` |
| GET | `/api/applications/:uuid/restart` | `GET /api/v1/applications/:uuid/restart` |

#### Application Extras
| Method | Proxy Route | Coolify API Called |
|--------|-------------|--------------------|
| GET | `/api/applications/:uuid/logs?lines=N` | `GET /api/v1/applications/:uuid/logs` |
| GET | `/api/applications/:uuid/envs` | `GET /api/v1/applications/:uuid/envs` |
| POST | `/api/applications/:uuid/envs` | `POST /api/v1/applications/:uuid/envs` |

#### Deployments
| Method | Proxy Route | Coolify API Called |
|--------|-------------|--------------------|
| GET | `/api/deployments` | `GET /api/v1/deployments` |
| GET | `/api/deployments/:uuid` | `GET /api/v1/deployments/:uuid` |
| GET | `/api/deployments/applications/:uuid` | `GET /api/v1/deployments/applications/:uuid` |
| GET | `/api/deploy?uuid=&force=` | `GET /api/v1/deploy?uuid=&force=` |

#### Services (Docker Compose stacks)
| Method | Proxy Route | Coolify API Called |
|--------|-------------|--------------------|
| GET | `/api/services` | `GET /api/v1/services` |
| POST | `/api/services` | `POST /api/v1/services` |
| GET | `/api/services/:uuid` | `GET /api/v1/services/:uuid` |
| PATCH | `/api/services/:uuid` | `PATCH /api/v1/services/:uuid` |
| DELETE | `/api/services/:uuid` | `DELETE /api/v1/services/:uuid` |
| GET | `/api/services/:uuid/start` | `GET /api/v1/services/:uuid/start` |
| GET | `/api/services/:uuid/stop` | `GET /api/v1/services/:uuid/stop` |
| GET | `/api/services/:uuid/restart` | `GET /api/v1/services/:uuid/restart` |

---

### Quick Start (local dev)

```bash
# 1. Configure backend
cd coolify-dashboard/backend
cp .env.example .env
# Edit .env: set COOLIFY_API_URL and COOLIFY_API_TOKEN

# 2. Start backend
npm install
npm run dev   # starts on port 3001

# 3. Start frontend (new terminal)
cd ../frontend
npm install
npm run dev   # starts on port 5173, proxies /api → localhost:3001
```

Open `http://localhost:5173`.

### Deploy on Coolify

```bash
# Use the included docker-compose.yaml
cd coolify-dashboard
```

1. New application → **Docker Compose** build pack.
2. Base directory: `/coolify-dashboard`
3. Set env vars on the backend service: `COOLIFY_API_URL`, `COOLIFY_API_TOKEN`.
4. Deploy.

---

## 🚀 Deployment Summary

| Folder | Build Pack | Services | Storage |
|--------|-----------|----------|---------|
| `stage1-frontend-only` | Nixpacks / Dockerfile | 1 | Browser localStorage |
| `stage2-frontend-backend` | Docker Compose | 2 | JSON file |
| `stage3-fullstack-database` | Docker Compose | 3 | PostgreSQL |
| `wordpress-advanced` | Docker Compose | 4 | MariaDB + Volumes |
| `coolify-dashboard` | Docker Compose | 2 | Coolify API (stateless) |

---

## 🔧 Local Development

```bash
# Stage 1
cd stage1-frontend-only && npm install && npm run dev

# Stage 2
cd stage2-frontend-backend && docker compose up --build

# Stage 3
cd stage3-fullstack-database && docker compose up --build

# WordPress
cd wordpress-advanced && docker compose -f docker-compose.local.yaml up -d
# → http://localhost:8085 (WordPress)   http://localhost:8081 (phpMyAdmin)

# Custom Dashboard
cd coolify-dashboard/backend && cp .env.example .env  # fill in your Coolify details
npm install && npm run dev &
cd ../frontend && npm install && npm run dev
# → http://localhost:5173
```

---

## 📝 License
MIT
