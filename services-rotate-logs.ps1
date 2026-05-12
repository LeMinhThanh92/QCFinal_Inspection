# ─────────────────────────────────────────────────────────────────
# services-rotate-logs.ps1 — Cleanup old QCFinal log files
# Deletes log files older than 30 days.
# Designed to run via Windows Task Scheduler (daily at 00:05).
# Can also be run manually at any time.
# ─────────────────────────────────────────────────────────────────

$RootDir = $PSScriptRoot
$logDir  = Join-Path $RootDir "logs"
$maxDays = 30

if (-not (Test-Path $logDir)) {
    exit 0
}

$cutoffDate = (Get-Date).AddDays(-$maxDays)
$totalDeleted = 0
$totalFreedMB = 0

Get-ChildItem -Path $logDir -Recurse -File -Filter "*.log" | Where-Object {
    $_.LastWriteTime -lt $cutoffDate
} | ForEach-Object {
    $sizeMB = [math]::Round($_.Length / 1MB, 2)
    $totalFreedMB += $sizeMB
    $totalDeleted++
    try {
        Remove-Item $_.FullName -Force
    } catch {
        # File might be locked, skip silently
    }
}

# Write a small summary to a rotate log
$rotateLog = Join-Path $logDir "rotate-history.log"
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$summary = "$timestamp | Deleted $totalDeleted files | Freed $([math]::Round($totalFreedMB, 2)) MB | Cutoff: $($cutoffDate.ToString('yyyy-MM-dd'))"
$summary | Out-File -FilePath $rotateLog -Append -Encoding UTF8
