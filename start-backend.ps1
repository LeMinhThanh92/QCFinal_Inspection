# ─── Start Backend ─────────────────────────────────────────────────
# QCFinal Backend — Port 6664
# Usage: .\start-backend.ps1
# ───────────────────────────────────────────────────────────────────

$Host.UI.RawUI.WindowTitle = "QCFinal Backend"
Write-Host "Starting QCFinal Backend on port 6664..." -ForegroundColor Cyan

Set-Location "$PSScriptRoot\backend"

# Run Spring Boot with Maven wrapper or mvn
if (Test-Path ".\mvnw.cmd") {
    .\mvnw.cmd spring-boot:run
} else {
    mvn spring-boot:run
}
