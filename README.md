# CoolifyExample

This repository contains 5 demo applications showcasing different Coolify build pack strategies.

## 📁 Applications

### 1. 📄 Static App (`/static-app`)
**Build Pack:** Static
- Pure HTML/CSS/JavaScript
- No build process required
- Perfect for landing pages and simple websites

### 2. ⚡ Node.js App (`/nodejs-app`)
**Build Pack:** Nixpacks (auto-detection)
- Express.js server
- Nixpacks automatically detects Node.js
- Includes REST API endpoints

### 3. 🐳 Dockerfile App (`/dockerfile-app`)
**Build Pack:** Dockerfile
- Python Flask application
- Uses custom Dockerfile
- Full control over the build process

### 4. 🐙 Docker Compose App (`/compose-app`)
**Build Pack:** Docker Compose
- Multi-service architecture
- Nginx frontend + Node.js API
- Services communicate via internal network

### 5. 🗄️ Nixpacks + Database App (`/nixpacks-app`)
**Build Pack:** Nixpacks
- Node.js Express with PostgreSQL
- Task management CRUD app
- Connects to Coolify-managed database

## 🚀 Deploying on Coolify

1. Add a new application in Coolify
2. Connect this GitHub repository
3. Select the appropriate folder for each app
4. Choose the matching build pack:
   - `static-app` → **Static**
   - `nodejs-app` → **Nixpacks**
   - `dockerfile-app` → **Dockerfile**
   - `compose-app` → **Docker Compose**
   - `nixpacks-app` → **Nixpacks** + PostgreSQL Database

## 🗄️ Database Setup (for nixpacks-app)

1. In Coolify, go to **Resources** → **New** → **Database** → **PostgreSQL**
2. Create the database and copy the connection string
3. In your nixpacks-app, add environment variable:
   ```
   DATABASE_URL=postgresql://user:password@hostname:5432/database
   ```
4. Deploy the app!

## 📝 License
MIT

This repository contains 4 example applications demonstrating different Coolify build pack strategies:

## 📁 Project Structure

```
├── nixpacks-app/      # Node.js app using Nixpacks (auto-detection)
├── static-app/        # Static HTML/CSS site
├── dockerfile-app/    # Python Flask app with custom Dockerfile
└── docker-compose-app/ # Multi-service app with Docker Compose
```

## 🛠 Build Packs

### 1. Nixpacks (nixpacks-app/)
- **Type**: Node.js Express application
- **Build**: Automatic framework detection
- **Port**: 3000

### 2. Static (static-app/)
- **Type**: Static HTML/CSS/JS site
- **Build**: Static file serving
- **Port**: 80

### 3. Dockerfile (dockerfile-app/)
- **Type**: Python Flask application
- **Build**: Custom Dockerfile
- **Port**: 5000

### 4. Docker Compose (docker-compose-app/)
- **Type**: Multi-service (Node.js API + Redis)
- **Build**: Docker Compose orchestration
- **Ports**: 3000 (API)

## 🚀 Deploying on Coolify

1. Connect this repository to Coolify
2. Select the appropriate folder for each application
3. Choose the matching build pack
4. Deploy!
