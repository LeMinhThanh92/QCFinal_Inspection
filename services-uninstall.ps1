# ─────────────────────────────────────────────────────────────────
# services-uninstall.ps1 — Remove QCFinal Windows Services
# Run as Administrator.
# ─────────────────────────────────────────────────────────────────

$isAdmin = ([Security.Principal.WindowsPrincipal] `
    [Security.Principal.WindowsIdentity]::GetCurrent() `
).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    try {
        Start-Process powershell.exe -Verb RunAs `
            -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$($MyInvocation.MyCommand.Path)`""
    } catch {
        Write-Host "ERROR: Administrator privileges required." -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
    exit 0
}

$ErrorActionPreference = "Stop"
$RootDir = $PSScriptRoot

# Locate NSSM
$nssmExe = Join-Path $RootDir "nssm\nssm.exe"
if (-not (Test-Path $nssmExe)) {
    $nssmExe = Join-Path $RootDir "nssm\win64\nssm.exe"
}
if (-not (Test-Path $nssmExe)) {
    Write-Host "ERROR: nssm.exe not found in nssm\ folder" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  QCFinal — Service Uninstaller"              -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

$services = @("QCFinal-Backend", "QCFinal-Frontend")

foreach ($svc in $services) {
    Write-Host "Removing $svc..." -ForegroundColor Yellow
    & $nssmExe stop $svc 2>$null | Out-Null
    Start-Sleep -Seconds 2
    $removeResult = & $nssmExe remove $svc confirm 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  -> $svc removed" -ForegroundColor Green
    } else {
        Write-Host "  -> $svc not found or already removed" -ForegroundColor Gray
    }
}

# Remove firewall rules
Write-Host ""
Write-Host "Removing firewall rules..." -ForegroundColor Yellow
& netsh advfirewall firewall delete rule name="QCFinal-Backend-6664"  2>$null | Out-Null
& netsh advfirewall firewall delete rule name="QCFinal-Frontend-7780" 2>$null | Out-Null
Write-Host "  -> Firewall rules removed" -ForegroundColor Green

# Remove scheduled task
Write-Host ""
Write-Host "Removing scheduled task..." -ForegroundColor Yellow
Unregister-ScheduledTask -TaskName "QCFinal-LogCleanup" -Confirm:$false -ErrorAction SilentlyContinue
Write-Host "  -> QCFinal-LogCleanup task removed" -ForegroundColor Green

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  All services removed."                       -ForegroundColor Green
Write-Host "  Log files in logs\ are preserved."          -ForegroundColor Gray
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Read-Host "Press Enter to close"
