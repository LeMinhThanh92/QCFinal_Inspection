# ─── Start Frontend ────────────────────────────────────────────────
# Sample Room Digital Frontend — Port 7780
# Usage: .\start-frontend.ps1
# ───────────────────────────────────────────────────────────────────

Write-Host "Starting Sample Room Digital Frontend on port 7780..." -ForegroundColor Cyan

Set-Location "$PSScriptRoot\frontend"

npm run dev
