# ─────────────────────────────────────────────────────────────────
# services-install.ps1 — Register QCFinal Backend + Frontend
#                         as Windows Services using NSSM.
# Run from the RELEASE folder (or project root) as Administrator.
#
# Prerequisites:
#   1. Download NSSM from https://nssm.cc/download
#   2. Place nssm.exe in a "nssm\" subfolder next to this script
#   3. Node.js + "npm install -g serve" on the server
#
# Usage:  .\services-install.ps1
# ─────────────────────────────────────────────────────────────────

# ── Must run as Administrator ────────────────────────────────────
$isAdmin = ([Security.Principal.WindowsPrincipal] `
    [Security.Principal.WindowsIdentity]::GetCurrent() `
).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "Requesting Administrator privileges..." -ForegroundColor Yellow
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

# Catch ANY unhandled error → show it and pause before closing
trap {
    Write-Host ""
    Write-Host "════════════════════════════════════════" -ForegroundColor Red
    Write-Host "  ERROR: $_" -ForegroundColor Red
    Write-Host "════════════════════════════════════════" -ForegroundColor Red
    Write-Host ""
    Write-Host $_.ScriptStackTrace -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to close"
    exit 1
}

# Helper: Run NSSM commands safely (stderr won't trigger ErrorActionPreference)
function Invoke-Nssm {
    param([string[]]$Arguments)
    $proc = Start-Process -FilePath $nssmExe -ArgumentList $Arguments `
        -NoNewWindow -Wait -PassThru -RedirectStandardError "NUL" 2>$null
    return $proc.ExitCode
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  QCFinal — Windows Service Installer"       -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# ═══════════════════════════════════════════════════════════════
# STEP 1: Validate prerequisites
# ═══════════════════════════════════════════════════════════════

# -- NSSM --
$nssmExe = Join-Path $RootDir "nssm\nssm.exe"
if (-not (Test-Path $nssmExe)) {
    # Try win64 subfolder (common NSSM download structure)
    $nssmExe = Join-Path $RootDir "nssm\win64\nssm.exe"
}
if (-not (Test-Path $nssmExe)) {
    Write-Host "ERROR: nssm.exe not found!" -ForegroundColor Red
    Write-Host "  Download from https://nssm.cc/download" -ForegroundColor Yellow
    Write-Host "  Extract nssm.exe to: $RootDir\nssm\nssm.exe" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "  NSSM: $nssmExe" -ForegroundColor Gray

# -- Java (bundled JRE or system) --
$javaExe = Join-Path $RootDir "jre\bin\java.exe"
if (-not (Test-Path $javaExe)) {
    if ($env:JAVA_HOME -and (Test-Path "$env:JAVA_HOME\bin\java.exe")) {
        $javaExe = "$env:JAVA_HOME\bin\java.exe"
    } else {
        $javaExe = (Get-Command java -ErrorAction SilentlyContinue).Source
    }
}
if (-not $javaExe -or -not (Test-Path $javaExe)) {
    Write-Host "ERROR: Java not found! Place JRE in jre\ folder or set JAVA_HOME." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "  Java: $javaExe" -ForegroundColor Gray

# -- Backend JAR --
$backendDir = Join-Path $RootDir "backend"
$jar = Get-ChildItem $backendDir -Filter "*.jar" -ErrorAction SilentlyContinue |
       Where-Object { $_.Name -notlike "*-plain*" -and $_.Name -notlike "*original*" } |
       Select-Object -First 1
if (-not $jar) {
    Write-Host "ERROR: No JAR file found in backend\" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "  JAR:  $($jar.Name)" -ForegroundColor Gray

# -- Frontend dist --
$frontendDir = Join-Path $RootDir "frontend"
if (-not (Test-Path (Join-Path $frontendDir "index.html"))) {
    Write-Host "ERROR: frontend\index.html not found" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "  Frontend: $frontendDir" -ForegroundColor Gray

# -- Node.js + serve --
$nodeExe = (Get-Command node -ErrorAction SilentlyContinue).Source
if (-not $nodeExe) {
    Write-Host "ERROR: Node.js not found in PATH!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "  Node: $nodeExe" -ForegroundColor Gray

$serveCmd = (Get-Command serve -ErrorAction SilentlyContinue).Source
if (-not $serveCmd) {
    Write-Host "  serve not found, installing globally..." -ForegroundColor Yellow
    & npm install -g serve
    $serveCmd = (Get-Command serve -ErrorAction SilentlyContinue).Source
}
if (-not $serveCmd) {
    Write-Host "ERROR: 'serve' not found even after install!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
# Resolve the actual serve JS entry point for NSSM
$npmGlobalRoot = (& npm root -g 2>$null).Trim()
$serveMainJs = Join-Path $npmGlobalRoot "serve\build\main.js"
if (-not (Test-Path $serveMainJs)) {
    # Fallback: use serve.cmd directly
    $useServeCmd = $true
    Write-Host "  serve: $serveCmd (cmd wrapper)" -ForegroundColor Gray
} else {
    $useServeCmd = $false
    Write-Host "  serve: $serveMainJs" -ForegroundColor Gray
}

Write-Host ""
Write-Host "  All prerequisites OK!" -ForegroundColor Green
Write-Host ""

# ═══════════════════════════════════════════════════════════════
# STEP 2: Create log directories
# ═══════════════════════════════════════════════════════════════
$logDir = Join-Path $RootDir "logs"
$beLogDir = Join-Path $logDir "backend"
$feLogDir = Join-Path $logDir "frontend"
New-Item -ItemType Directory -Path $beLogDir -Force | Out-Null
New-Item -ItemType Directory -Path $feLogDir -Force | Out-Null
Write-Host "[1/5] Log directories created" -ForegroundColor Yellow
Write-Host "  -> $beLogDir" -ForegroundColor Gray
Write-Host "  -> $feLogDir" -ForegroundColor Gray

# ═══════════════════════════════════════════════════════════════
# STEP 3: Install Backend Service
# ═══════════════════════════════════════════════════════════════
$beSvcName = "QCFinal-Backend"
Write-Host ""
Write-Host "[2/5] Installing $beSvcName..." -ForegroundColor Yellow

# Remove existing service if present (ignore errors if not found)
cmd /c """$nssmExe"" stop $beSvcName 2>nul & ""$nssmExe"" remove $beSvcName confirm 2>nul" | Out-Null

# Build Java arguments
$logbackFile = Join-Path $RootDir "services-logback-spring.xml"
$securityFile = Join-Path $backendDir "custom-java.security"
$propsFile = Join-Path $backendDir "application.properties"

$javaArgs = "-Xms512m -Xmx2g"
$javaArgs += " -DLOG_DIR=$beLogDir"
if (Test-Path $logbackFile) {
    $javaArgs += " -Dlogging.config=file:$logbackFile"
}
if (Test-Path $securityFile) {
    $javaArgs += " -Djava.security.properties=$securityFile"
}
$javaArgs += " -jar $($jar.FullName)"
if (Test-Path $propsFile) {
    $javaArgs += " --spring.config.additional-location=file:$propsFile"
}

cmd /c """$nssmExe"" install $beSvcName ""$javaExe"" 2>&1" | Write-Host -ForegroundColor Gray
cmd /c """$nssmExe"" set $beSvcName AppParameters $javaArgs 2>&1" | Out-Null
cmd /c """$nssmExe"" set $beSvcName AppDirectory ""$RootDir"" 2>&1" | Out-Null
cmd /c """$nssmExe"" set $beSvcName DisplayName ""QCFinal Backend API (Port 6664)"" 2>&1" | Out-Null
cmd /c """$nssmExe"" set $beSvcName Description ""QCFinal Spring Boot Backend - Port 6664"" 2>&1" | Out-Null
cmd /c """$nssmExe"" set $beSvcName Start SERVICE_AUTO_START 2>&1" | Out-Null
cmd /c """$nssmExe"" set $beSvcName AppStdout ""$beLogDir\backend-console.log"" 2>&1" | Out-Null
cmd /c """$nssmExe"" set $beSvcName AppStderr ""$beLogDir\backend-console.log"" 2>&1" | Out-Null
cmd /c """$nssmExe"" set $beSvcName AppStdoutCreationDisposition 4 2>&1" | Out-Null
cmd /c """$nssmExe"" set $beSvcName AppStderrCreationDisposition 4 2>&1" | Out-Null
cmd /c """$nssmExe"" set $beSvcName AppRotateFiles 1 2>&1" | Out-Null
cmd /c """$nssmExe"" set $beSvcName AppRotateOnline 1 2>&1" | Out-Null
cmd /c """$nssmExe"" set $beSvcName AppRotateSeconds 86400 2>&1" | Out-Null
cmd /c """$nssmExe"" set $beSvcName AppRotateBytes 10485760 2>&1" | Out-Null
# Recovery: restart on failure after 10 seconds
cmd /c """$nssmExe"" set $beSvcName AppExit Default Restart 2>&1" | Out-Null
cmd /c """$nssmExe"" set $beSvcName AppRestartDelay 10000 2>&1" | Out-Null

Write-Host "  -> $beSvcName installed" -ForegroundColor Green

# ═══════════════════════════════════════════════════════════════
# STEP 4: Install Frontend Service
# ═══════════════════════════════════════════════════════════════
$feSvcName = "QCFinal-Frontend"
Write-Host ""
Write-Host "[3/5] Installing $feSvcName..." -ForegroundColor Yellow

cmd /c """$nssmExe"" stop $feSvcName 2>nul & ""$nssmExe"" remove $feSvcName confirm 2>nul" | Out-Null

if ($useServeCmd) {
    cmd /c """$nssmExe"" install $feSvcName ""$serveCmd"" 2>&1" | Write-Host -ForegroundColor Gray
    cmd /c """$nssmExe"" set $feSvcName AppParameters ""-l 7780 -s --no-clipboard"" 2>&1" | Out-Null
} else {
    cmd /c """$nssmExe"" install $feSvcName ""$nodeExe"" 2>&1" | Write-Host -ForegroundColor Gray
    cmd /c """$nssmExe"" set $feSvcName AppParameters ""$serveMainJs -l 7780 -s --no-clipboard"" 2>&1" | Out-Null
}

cmd /c """$nssmExe"" set $feSvcName AppDirectory ""$frontendDir"" 2>&1" | Out-Null
cmd /c """$nssmExe"" set $feSvcName DisplayName ""QCFinal Frontend Web (Port 7780)"" 2>&1" | Out-Null
cmd /c """$nssmExe"" set $feSvcName Description ""QCFinal Static Frontend - Port 7780"" 2>&1" | Out-Null
cmd /c """$nssmExe"" set $feSvcName Start SERVICE_AUTO_START 2>&1" | Out-Null
cmd /c """$nssmExe"" set $feSvcName AppStdout ""$feLogDir\frontend.log"" 2>&1" | Out-Null
cmd /c """$nssmExe"" set $feSvcName AppStderr ""$feLogDir\frontend-error.log"" 2>&1" | Out-Null
cmd /c """$nssmExe"" set $feSvcName AppStdoutCreationDisposition 4 2>&1" | Out-Null
cmd /c """$nssmExe"" set $feSvcName AppStderrCreationDisposition 4 2>&1" | Out-Null
cmd /c """$nssmExe"" set $feSvcName AppRotateFiles 1 2>&1" | Out-Null
cmd /c """$nssmExe"" set $feSvcName AppRotateOnline 1 2>&1" | Out-Null
cmd /c """$nssmExe"" set $feSvcName AppRotateSeconds 86400 2>&1" | Out-Null
cmd /c """$nssmExe"" set $feSvcName AppRotateBytes 10485760 2>&1" | Out-Null
cmd /c """$nssmExe"" set $feSvcName AppExit Default Restart 2>&1" | Out-Null
cmd /c """$nssmExe"" set $feSvcName AppRestartDelay 5000 2>&1" | Out-Null

Write-Host "  -> $feSvcName installed" -ForegroundColor Green

# ═══════════════════════════════════════════════════════════════
# STEP 5: Open Firewall Ports (one-time)
# ═══════════════════════════════════════════════════════════════
Write-Host ""
Write-Host "[4/5] Opening firewall ports..." -ForegroundColor Yellow
try {
    & netsh advfirewall firewall delete rule name="QCFinal-Backend-6664"  2>$null | Out-Null
    & netsh advfirewall firewall delete rule name="QCFinal-Frontend-7780" 2>$null | Out-Null
    & netsh advfirewall firewall add rule name="QCFinal-Backend-6664"  dir=in action=allow protocol=tcp localport=6664 | Out-Null
    & netsh advfirewall firewall add rule name="QCFinal-Frontend-7780" dir=in action=allow protocol=tcp localport=7780 | Out-Null
    Write-Host "  -> Port 6664 (Backend) opened" -ForegroundColor Green
    Write-Host "  -> Port 7780 (Frontend) opened" -ForegroundColor Green
} catch {
    Write-Host "  -> Firewall warning: $($_.Exception.Message)" -ForegroundColor Yellow
}

# ═══════════════════════════════════════════════════════════════
# STEP 6: Register log cleanup task (daily at 00:05)
# ═══════════════════════════════════════════════════════════════
Write-Host ""
Write-Host "[5/5] Registering daily log cleanup task..." -ForegroundColor Yellow
$rotateScript = Join-Path $RootDir "services-rotate-logs.ps1"
if (Test-Path $rotateScript) {
    $taskName = "QCFinal-LogCleanup"
    $taskAction = New-ScheduledTaskAction `
        -Execute "powershell.exe" `
        -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$rotateScript`""
    $taskTrigger = New-ScheduledTaskTrigger -Daily -At "00:05"
    $taskSettings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries
    $taskPrincipal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest

    Unregister-ScheduledTask -TaskName $taskName -Confirm:$false -ErrorAction SilentlyContinue
    Register-ScheduledTask -TaskName $taskName -Action $taskAction -Trigger $taskTrigger `
        -Settings $taskSettings -Principal $taskPrincipal -Description "Cleanup QCFinal logs older than 30 days" | Out-Null
    Write-Host "  -> Task '$taskName' registered (daily 00:05)" -ForegroundColor Green
} else {
    Write-Host "  -> services-rotate-logs.ps1 not found, skipping" -ForegroundColor Yellow
}

# ═══════════════════════════════════════════════════════════════
# STEP 7: Start services
# ═══════════════════════════════════════════════════════════════
Write-Host ""
Write-Host "Starting services..." -ForegroundColor Yellow
cmd /c """$nssmExe"" start $beSvcName 2>&1" | Write-Host -ForegroundColor Gray
Start-Sleep -Seconds 3
cmd /c """$nssmExe"" start $feSvcName 2>&1" | Write-Host -ForegroundColor Gray

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  INSTALLATION COMPLETE!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Services:" -ForegroundColor White
Write-Host "    $beSvcName  -> http://localhost:6664/api/v2" -ForegroundColor Gray
Write-Host "    $feSvcName -> http://localhost:7780/" -ForegroundColor Gray
Write-Host ""
Write-Host "  Logs:" -ForegroundColor White
Write-Host "    Backend:  $beLogDir" -ForegroundColor Gray
Write-Host "    Frontend: $feLogDir" -ForegroundColor Gray
Write-Host ""
Write-Host "  Manage via:" -ForegroundColor White
Write-Host "    services.msc       (GUI)" -ForegroundColor Gray
Write-Host "    .\services-status.ps1  (Quick check)" -ForegroundColor Gray
Write-Host ""
Read-Host "Press Enter to close"
