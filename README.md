# Print Helper System (Smart Campus Print Portal)

A production-grade, multi-application smart print management platform for campus stationery shops. Built with React 19, Vite, TypeScript, Express.js, Prisma ORM, Socket.IO, and a desktop Print Agent.

Developed with ❤️ by **Tanishq, Tanmay, Vibhor & Shashwat** for **Print Helper** — *Vibecoded to reality*.

---

## 🏗️ Architecture Overview

The system consists of 4 decoupled applications communicating over HTTP & WebSockets:

1. **`student-app`** (React 19 + Vite + TypeScript + Tailwind CSS): Student portal for uploading documents, selecting print options, instant online/cash payment, and live queue tracking.
2. **`admin-app`** (React 19 + Vite + TypeScript + Tailwind CSS): Staff control panel for live queue management, cash acceptance, printer status toggling, and revenue analytics.
3. **`backend`** (Express.js + TypeScript + Prisma ORM + Socket.IO): REST API & WebSocket server managing users, print jobs, 4-digit order IDs (`#0001` - `#9999`), file uploads, and printer queue routing.
4. **`print-agent`** (Node.js Desktop Service): Daemon process running on stationery PCs that streams PDF files and dispatches them to native OS print spoolers automatically.
5. **`demo`**: 1-click execution scripts (`run_all.bat` and `run_all.ps1`) to launch all 4 services at once.

---

## ⚡ 1-Click Launch (Demo Mode)

Run the batch script inside the `demo` folder:
```cmd
demo\run_all.bat
```

Or in PowerShell:
```powershell
.\demo\run_all.ps1
```

### URLs
- **Student Portal**: `http://localhost:5173` (Or `http://YOUR-LOCAL-IP:5173` on Phone)
- **Admin Control Panel**: `http://localhost:5174` (Or `http://YOUR-LOCAL-IP:5174` on Phone)
- **Backend API**: `http://localhost:5000`

---

## 🔑 Pre-Seeded Credentials

- **Admin Account**: `vibhor.singh0308@gmail.com` | Password: `vibhu12345`
- **Student Account**: `vibhor.student@gmail.com` | Password: `vibhu12345`
