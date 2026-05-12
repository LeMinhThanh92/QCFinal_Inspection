# ─────────────────────────────────────────────────────────────────
# services-status.ps1 — Quick status check for QCFinal services
# No admin required for status check.
# ─────────────────────────────────────────────────────────────────

$RootDir = $PSScriptRoot

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  QCFinal — Service Status"                   -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

$services = @("QCFinal-Backend", "QCFinal-Frontend")

foreach ($svc in $services) {
    $service = Get-Service -Name $svc -ErrorAction SilentlyContinue
    if ($service) {
        $status = $service.Status
        $color = switch ($status) {
            "Running"  { "Green" }
            "Stopped"  { "Red" }
            default    { "Yellow" }
        }
        $icon = switch ($status) {
            "Running"  { "[OK]" }
            "Stopped"  { "[--]" }
            default    { "[??]" }
        }
        Write-Host "  $icon $($service.DisplayName)" -ForegroundColor $color
        Write-Host "       Status: $status | StartType: $($service.StartType)" -ForegroundColor Gray
    } else {
        Write-Host "  [!!] $svc — NOT INSTALLED" -ForegroundColor Red
    }
}

# Check ports
Write-Host ""
Write-Host "  Port Check:" -ForegroundColor White
$ports = @(@{Name="Backend"; Port=6664}, @{Name="Frontend"; Port=7780})
foreach ($p in $ports) {
    $listening = netstat -an | Select-String ":$($p.Port)\s.*LISTENING"
    if ($listening) {
        Write-Host "    [OK] $($p.Name) port $($p.Port) — LISTENING" -ForegroundColor Green
    } else {
        Write-Host "    [--] $($p.Name) port $($p.Port) — NOT LISTENING" -ForegroundColor Red
    }
}

# Show log sizes
Write-Host ""
Write-Host "  Log Files:" -ForegroundColor White
$logDir = Join-Path $RootDir "logs"
if (Test-Path $logDir) {
    $logFiles = Get-ChildItem -Path $logDir -Recurse -File -Filter "*.log"
    $totalSize = ($logFiles | Measure-Object -Property Length -Sum).Sum
    $totalMB = [math]::Round($totalSize / 1MB, 2)
    Write-Host "    $($logFiles.Count) file(s), total $totalMB MB" -ForegroundColor Gray

    # Show latest log per subfolder
    foreach ($sub in @("backend", "frontend")) {
        $subDir = Join-Path $logDir $sub
        if (Test-Path $subDir) {
            $latest = Get-ChildItem $subDir -Filter "*.log" -File |
                      Sort-Object LastWriteTime -Descending |
                      Select-Object -First 1
            if ($latest) {
                $age = [math]::Round(((Get-Date) - $latest.LastWriteTime).TotalMinutes, 0)
                Write-Host "    $sub — latest: $($latest.Name) (${age}m ago)" -ForegroundColor Gray
            }
        }
    }
} else {
    Write-Host "    logs\ directory not found" -ForegroundColor Yellow
}

# Scheduled task
Write-Host ""
Write-Host "  Scheduled Task:" -ForegroundColor White
$task = Get-ScheduledTask -TaskName "QCFinal-LogCleanup" -ErrorAction SilentlyContinue
if ($task) {
    Write-Host "    [OK] QCFinal-LogCleanup — $($task.State)" -ForegroundColor Green
} else {
    Write-Host "    [--] QCFinal-LogCleanup — NOT REGISTERED" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Read-Host "Press Enter to close"
