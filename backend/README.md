# SRM Print Helper - Backend API Service

Production-grade Express.js & TypeScript API server with Prisma ORM (PostgreSQL), Multer file handling, JWT authentication, and Socket.IO real-time print queue events.

## Tech Stack
- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL (Prisma ORM)
- **Real-Time**: Socket.IO
- **Security**: JWT tokens, bcryptjs, Zod validation, Rate limiting

## Setup & Running Locally
1. Copy environment configuration:
   ```bash
   cp .env.example .env
   ```
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Generate Prisma Client & Run Migrations:
   ```bash
   pnpm prisma:generate
   pnpm seed
   ```
4. Start development server:
   ```bash
   pnpm dev
   ```
   API runs on `http://localhost:5000` with WebSocket support.

## Endpoints Summary
- `POST /api/v1/auth/register` - Student registration
- `POST /api/v1/auth/login` - User/Admin authentication
- `POST /api/v1/jobs/submit` - Upload document and submit print job
- `POST /api/v1/jobs/estimate` - Dynamic cost estimation
- `GET /api/v1/admin/jobs` - Admin queue management
- `GET /api/v1/agent/pending-jobs` - Print agent queue polling
