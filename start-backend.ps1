# ─── Start Backend ─────────────────────────────────────────────────
# Sample Room Digital API — Port 6663
# Usage: .\start-backend.ps1
# ───────────────────────────────────────────────────────────────────

Write-Host "Starting Sample Room Digital Backend on port 6663..." -ForegroundColor Cyan

Set-Location "$PSScriptRoot\backend"

# Run Spring Boot with Maven wrapper or mvn
if (Test-Path ".\mvnw.cmd") {
    .\mvnw.cmd spring-boot:run
} else {
    mvn spring-boot:run
}
