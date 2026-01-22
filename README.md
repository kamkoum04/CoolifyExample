# CoolifyExample - Task Board Application

This repository contains 3 progressive stages of a Task Board application, demonstrating different deployment complexities on Coolify.

## 📁 Project Structure

```
├── stage1-frontend-only/      # React + Vite (LocalStorage)
├── stage2-frontend-backend/   # Frontend + Backend API (JSON file storage)
└── stage3-fullstack-database/ # Frontend + Backend + PostgreSQL (Prisma ORM)
```

---

## 🎯 Stage 1: Frontend Only (`/stage1-frontend-only`)

**Build Pack:** Nixpacks or Dockerfile

A React + Vite application that stores tasks in the browser's LocalStorage.

### Features:
- ⚛️ React 18 + Vite
- 💾 LocalStorage persistence
- 🎨 Beautiful gradient UI
- ✅ Add, complete, delete tasks

### Deploy on Coolify:
1. Create new application
2. Select repository and set **Base Directory**: `/stage1-frontend-only`
3. **Build Pack**: Nixpacks (auto-detects Vite) or Dockerfile
4. Deploy!

### What you learn:
- Single service deployment
- Static/SPA build process
- Nixpacks auto-detection

---

## 🔗 Stage 2: Frontend + Backend (`/stage2-frontend-backend`)

**Build Pack:** Docker Compose

A full-stack application with separate frontend and backend services. Tasks are stored in a JSON file.

### Architecture:
```
┌─────────────┐     ┌─────────────┐
│  Frontend   │────▶│   Backend   │
│  (Nginx)    │     │  (Express)  │
│   :80       │     │   :3001     │
└─────────────┘     └─────────────┘
```

### Features:
- 🌐 React frontend (Nginx)
- ⚡ Express.js REST API
- 📁 JSON file storage
- 🔄 Service-to-service networking

### API Endpoints:
```
GET    /api/tasks      - List all tasks
POST   /api/tasks      - Create task
PATCH  /api/tasks/:id  - Update task
DELETE /api/tasks/:id  - Delete task
GET    /api/health     - Health check
```

### Deploy on Coolify:
1. Create new application with **Docker Compose**
2. Set **Base Directory**: `/stage2-frontend-backend`
3. Set **Docker Compose Location**: `/docker-compose.yaml`
4. Configure domain for `frontend` service
5. Deploy!

### What you learn:
- Multi-service deployment
- Service-to-service networking
- Reverse proxy configuration
- Build logs & restart policies

---

## 🗄️ Stage 3: Full Stack + Database (`/stage3-fullstack-database`)

**Build Pack:** Docker Compose

A complete full-stack application with PostgreSQL database and Prisma ORM.

### Architecture:
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Frontend   │────▶│   Backend   │────▶│  PostgreSQL │
│  (Nginx)    │     │  (Express)  │     │     :5432   │
│   :80       │     │   :3001     │     └─────────────┘
└─────────────┘     └─────────────┘
                          │
                    ┌─────┴─────┐
                    │  Prisma   │
                    │   ORM     │
                    └───────────┘
```

### Features:
- 🌐 React frontend
- ⚡ Express.js + Prisma ORM
- 🐘 PostgreSQL database
- 📊 Auto migrations
- 💾 Persistent volume for data

### Tech Stack:
- **Frontend**: React 18, Vite, CSS
- **Backend**: Node.js, Express, Prisma
- **Database**: PostgreSQL 16
- **ORM**: Prisma with auto-migrations

### Deploy on Coolify:
1. Create new application with **Docker Compose**
2. Set **Base Directory**: `/stage3-fullstack-database`
3. Set **Docker Compose Location**: `/docker-compose.yaml`
4. Configure domain for `frontend` service
5. Deploy!

**Alternative (Coolify Managed DB):**
1. Create PostgreSQL database in Coolify first
2. Deploy only frontend + backend services
3. Set `DATABASE_URL` environment variable pointing to Coolify's database

### What you learn:
- Database service management
- Environment variables for credentials
- Persistent volumes
- Database migrations
- Health checks & dependencies
- Backup strategies (later)

---

## 🚀 Quick Deployment Guide

| Stage | Build Pack | Services | Storage |
|-------|-----------|----------|---------|
| 1 | Nixpacks/Dockerfile | 1 (Frontend) | LocalStorage |
| 2 | Docker Compose | 2 (Frontend + Backend) | JSON File |
| 3 | Docker Compose | 3 (Frontend + Backend + DB) | PostgreSQL |

## 🔧 Local Development

### Stage 1:
```bash
cd stage1-frontend-only
npm install
npm run dev
```

### Stage 2:
```bash
cd stage2-frontend-backend
docker compose up --build
```

### Stage 3:
```bash
cd stage3-fullstack-database
docker compose up --build
```

## 📝 License
MIT
