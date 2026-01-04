# SyncNotes 📝

SyncNotes is a premium, real-time collaborative note-taking application designed for seamless team productivity. Built with a modern tech stack, it features high-performance synchronization, robust authentication, and a sleek, responsive user interface.

## 🚀 Features

- **Real-time Collaboration**: Simultaneous editing with conflict resolution via Socket.io.
- **Infinite Discovery**: Efficient note browsing with infinite scroll, advanced search, and multi-criteria sorting.
- **Robust Authentication**: Secure access via Email/Password or Google OAuth 2.0.
- **Premium UI/UX**: Stunning interface with glassmorphism, smooth animations, and automatic Dark Mode.
- **Solid Architecture**: Modular backend services and a custom, race-condition-proof frontend API client.
- **Docker Ready**: Fully containerized environment for both development and production.

## 🛠 Technology Stack

### Frontend
- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS & Vanilla CSS
- **State/Data**: TanStack Form, React Context, Axios
- **Feedback**: Sonner (toasts), Lucide (icons)

### Backend
- **Server**: Node.js & Express
- **Database**: PostgreSQL with Prisma ORM
- **Real-time**: Socket.io
- **Security**: Passport.js (JWT & Google OAuth)
- **Dev-Ops**: Docker & Docker Compose

## 🏁 Getting Started

### Prerequisites
- Node.js (v18+)
- Docker & Docker Compose (optional for local DB)
- PostgreSQL instance

### 1. Setup Backend
```bash
cd backend
npm install
# Configure your .env (see .env.example)
npx prisma migrate dev
npm run dev
```

### 2. Setup Frontend
```bash
cd frontend
npm install
# Configure your .env (point to backend API)
npm run dev
```

## 🐳 Docker Setup

Run the entire stack (including DB) with a single command:

```bash
# Development
docker-compose -f backend/docker-compose.dev.yml up

# Production
docker-compose -f backend/docker-compose.prod.yml up --build
```

## 📜 License
MIT
