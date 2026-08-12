# Print Helper - Desktop Print Agent Service

Lightweight Node.js desktop daemon that runs on the stationery shop computer. Communicates securely with the backend API via Socket.IO events & HTTP polling, receives assigned print jobs, downloads PDF streams, and dispatches them to physical OS printers using `pdf-to-printer` or native OS print spoolers.

## Workflow
1. Authenticates using `AGENT_API_KEY`.
2. Connects to backend WebSocket (`agent:printers`).
3. On receiving assigned print job:
   - Updates backend status to `PRINTING`.
   - Streams PDF file to local temporary folder.
   - Dispatches job to target OS printer driver.
   - Updates backend status to `COMPLETED` (or `REJECTED` on error).
   - Instantly purges local temporary file.

## Running Locally
```bash
cp .env.example .env
pnpm install
pnpm dev
```
