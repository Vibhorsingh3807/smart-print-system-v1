@echo off
title SRM Print Management System - 1-Click Demo Launcher
echo ========================================================
echo   SRM PRINT MANAGEMENT SYSTEM - DEMO LAUNCHER
echo ========================================================
echo Starting Backend API (Port 5000)...
echo Starting Student App (Port 5173 - Host 0.0.0.0)...
echo Starting Admin Control Panel (Port 5174 - Host 0.0.0.0)...
echo Starting Desktop Print Agent...
echo ========================================================

start "1. SRM Backend API (Port 5000)" cmd /k "cd /d %~dp0..\backend && set PATH=C:\Users\vibho\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin;%%PATH%% && node ./node_modules/.pnpm/tsx@4.23.9/node_modules/tsx/dist/cli.mjs watch src/server.ts"

start "2. SRM Student App (Port 5173)" cmd /k "cd /d %~dp0..\student-app && set PATH=C:\Users\vibho\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin;%%PATH%% && node ./node_modules/vite/bin/vite.js --host 0.0.0.0"

start "3. SRM Admin App (Port 5174)" cmd /k "cd /d %~dp0..\admin-app && set PATH=C:\Users\vibho\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin;%%PATH%% && node ./node_modules/vite/bin/vite.js --host 0.0.0.0"

start "4. SRM Print Agent Service" cmd /k "cd /d %~dp0..\print-agent && set PATH=C:\Users\vibho\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin;%%PATH%% && node ./node_modules/.pnpm/tsx@4.23.9/node_modules/tsx/dist/cli.mjs watch src/index.ts"

echo.
echo All 4 applications launched successfully!
echo.
echo   Student Portal : http://localhost:5173  (Or http://YOUR-LOCAL-IP:5173 on Phone)
echo   Admin Panel    : http://localhost:5174  (Or http://YOUR-LOCAL-IP:5174 on Phone)
echo   Backend API    : http://localhost:5000
echo.
echo ========================================================
pause
