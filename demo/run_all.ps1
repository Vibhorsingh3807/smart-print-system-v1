# Print Helper Management System - PowerShell Launcher
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$rootDir = Resolve-Path "$scriptDir\.."
$nodeBin = "C:\Users\vibho\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin"

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "   PRINT HELPER MANAGEMENT SYSTEM - DEMO LAUNCHER" -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Cyan

# 1. Backend API
Start-Process cmd -ArgumentList "/k ""cd /d `"$rootDir\backend`" && set PATH=$nodeBin;%%PATH%% && node ./node_modules/.pnpm/tsx@4.23.9/node_modules/tsx/dist/cli.mjs watch src/server.ts"""

# 2. Student App
Start-Process cmd -ArgumentList "/k ""cd /d `"$rootDir\student-app`" && set PATH=$nodeBin;%%PATH%% && node ./node_modules/vite/bin/vite.js --host"""

# 3. Admin App
Start-Process cmd -ArgumentList "/k ""cd /d `"$rootDir\admin-app`" && set PATH=$nodeBin;%%PATH%% && node ./node_modules/vite/bin/vite.js --host"""

# 4. Print Agent
Start-Process cmd -ArgumentList "/k ""cd /d `"$rootDir\print-agent`" && set PATH=$nodeBin;%%PATH%% && node ./node_modules/.pnpm/tsx@4.23.9/node_modules/tsx/dist/cli.mjs watch src/index.ts"""

Write-Host "`n🎉 All 4 applications started!" -ForegroundColor Green
Write-Host "🌐 Student Portal : http://localhost:5173" -ForegroundColor White
Write-Host "🛡️ Admin Panel    : http://localhost:5174" -ForegroundColor White
Write-Host "🚀 Backend API    : http://localhost:5000" -ForegroundColor White
