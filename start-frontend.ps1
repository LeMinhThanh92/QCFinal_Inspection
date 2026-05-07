# ─── Start Frontend ────────────────────────────────────────────────
# QCFinal Frontend — Port 7780
# Usage: .\start-frontend.ps1
# ───────────────────────────────────────────────────────────────────

$Host.UI.RawUI.WindowTitle = "QCFinal Frontend"
Write-Host "Starting QCFinal Frontend on port 7780..." -ForegroundColor Cyan

Set-Location "$PSScriptRoot\frontend"

npm run dev
