# -------------------------------------------------------------
# start.ps1 - One-click start for DecorationScanOutput
# Run from the release folder: .\start.ps1
# -------------------------------------------------------------

# -- Auto-elevate to Administrator (required for firewall) --
$isAdmin = ([Security.Principal.WindowsPrincipal] `
    [Security.Principal.WindowsIdentity]::GetCurrent() `
).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "Requesting Administrator privileges..." -ForegroundColor Yellow
    $scriptPath = $MyInvocation.MyCommand.Path
    try {
        Start-Process powershell.exe -Verb RunAs -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$scriptPath`""
    } catch {
        Write-Host "ERROR: Administrator privileges are required to open firewall ports." -ForegroundColor Red
        Write-Host "       Please right-click start.ps1 and select 'Run as Administrator'." -ForegroundColor Red
        Write-Host ""
        Read-Host "Press Enter to exit"
        exit 1
    }
    exit 0
}

$ErrorActionPreference = "Stop"
$RootDir = $PSScriptRoot

function Stop-WithError {
    param([string]$Message)
    Write-Host ""
    Write-Host "ERROR: $Message" -ForegroundColor Red
    try {
        $logPath = Join-Path $RootDir "start_error.log"
        "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') - ERROR: $Message" | Out-File -FilePath $logPath -Append
        Write-Host "Error logged to start_error.log" -ForegroundColor Yellow
    } catch {}
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

trap {
    Stop-WithError "Unexpected error: $_`n$($_.ScriptStackTrace)"
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  DecorationScanOutput - Starting Services"  -ForegroundColor Cyan
Write-Host "  (Running as Administrator)"                 -ForegroundColor Gray
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# -- Resolve Java -----------------------------------------
$bundledJre = Join-Path $RootDir "jre\bin\java.exe"
if (Test-Path $bundledJre) {
    $JavaExe = $bundledJre
    Write-Host "  Using bundled JRE" -ForegroundColor Gray
} elseif ($env:JAVA_HOME -and (Test-Path "$env:JAVA_HOME\bin\java.exe")) {
    $JavaExe = "$env:JAVA_HOME\bin\java.exe"
    Write-Host "  Using JAVA_HOME: $env:JAVA_HOME" -ForegroundColor Gray
} else {
    $JavaExe = "java"
    try {
        & $JavaExe --version 2>&1 | Out-Null
        Write-Host "  Using system Java" -ForegroundColor Gray
    } catch {
        Stop-WithError "Java not found! Install Java 17+ or place a JRE in the 'jre' folder."
    }
}

# -- Locate backend JAR ----------------------------------
$backendDir = Join-Path $RootDir "backend"
$jar = Get-ChildItem $backendDir -Filter "*.jar" | Select-Object -First 1
if (-not $jar) {
    Stop-WithError "No JAR file found in backend\"
}

# -- Locate frontend dist --------------------------------
$frontendDir = Join-Path $RootDir "frontend"
if (-not (Test-Path (Join-Path $frontendDir "index.html"))) {
    Stop-WithError "frontend\index.html not found"
}



# -- Build backend startup script ------------------------
# Backend always HTTP (mobile APK needs HTTP)
$beCmdFile = Join-Path $RootDir "_start_backend.cmd"
$beCmdLines = @("@echo off", "title DecorationScanOutput Backend")

$securityFile = Join-Path $backendDir "custom-java.security"
$securityArg = ""
if (Test-Path $securityFile) {
    $securityArg = "-Djava.security.properties=""$securityFile"""
}

$externalProps = Join-Path $backendDir "application.properties"
$configArg = ""
if (Test-Path $externalProps) {
    $configArg = "--spring.config.additional-location=file:""$externalProps"""
}

$beCmdLines += """$JavaExe"" -Xms512m -Xmx2g $securityArg -jar ""$($jar.FullName)"" $configArg"
$beCmdLines += "pause"
[System.IO.File]::WriteAllLines($beCmdFile, $beCmdLines)

# -- Build frontend startup script -----------------------
$feCmdFile = Join-Path $RootDir "_start_frontend.cmd"
$feCmdLines = @(
    "@echo off",
    "title DecorationScanOutput Frontend",
    "cd /d ""$frontendDir""",
    "",
    "REM -- Ensure serve is installed globally (not npx temp) --",
    "where serve >nul 2>&1",
    "if errorlevel 1 (",
    "    echo [Frontend] Installing serve globally...",
    "    call npm install -g serve",
    "    if errorlevel 1 (",
    "        echo [Frontend] ERROR: Failed to install serve",
    "        pause",
    "        exit /b 1",
    "    )",
    ")",
    "",
    "REM -- Auto-restart loop - if serve crashes, wait 5s and restart --",
    ":restart",
    "echo.",
    "echo [%date% %time%] Starting serve on port 7779...",
    "start /b serve -l 7779 -s --no-clipboard",
    "",
    "REM Wait for serve to start, then reclaim window title",
    "timeout /t 2 /nobreak >nul",
    "title DecorationScanOutput Frontend",
    "",
    "REM Monitor: refresh title + check if serve is still running",
    ":check",
    "timeout /t 10 /nobreak >nul",
    "title DecorationScanOutput Frontend",
    "netstat -an | findstr "":7779.*LISTENING"" >nul 2>&1",
    "if %errorlevel% equ 0 goto check",
    "",
    "echo.",
    "echo [%date% %time%] Frontend process exited.",
    "echo [%date% %time%] Restarting in 5 seconds... Press Ctrl+C to stop.",
    "timeout /t 5 /nobreak >nul",
    "goto restart"
)
[System.IO.File]::WriteAllLines($feCmdFile, $feCmdLines)

# -- Open Firewall Ports ----------------------------------
Write-Host ""
Write-Host "[Firewall] Opening ports 6662 (BE) and 7779 (FE)..." -ForegroundColor Yellow
try {
    & netsh advfirewall firewall delete rule name="DecorationScan-Backend-6662"  2>$null | Out-Null
    & netsh advfirewall firewall delete rule name="DecorationScan-Frontend-7779" 2>$null | Out-Null

    & netsh advfirewall firewall add rule name="DecorationScan-Backend-6662"  dir=in action=allow protocol=tcp localport=6662 | Out-Null
    & netsh advfirewall firewall add rule name="DecorationScan-Frontend-7779" dir=in action=allow protocol=tcp localport=7779 | Out-Null

    Write-Host "  -> Port 6662 (Backend) opened" -ForegroundColor Green
    Write-Host "  -> Port 7779 (Frontend) opened" -ForegroundColor Green
} catch {
    Write-Host "  -> Could not open firewall ports (run as Administrator)" -ForegroundColor Yellow
}

# -- Start Backend ----------------------------------------
Write-Host ""
Write-Host "[Backend] Starting Spring Boot on port 6662 (HTTP)..." -ForegroundColor Yellow
Start-Process cmd -ArgumentList "/c", """$beCmdFile"""

# -- Start Frontend ---------------------------------------
Write-Host "[Frontend] Starting on port 7779 (http)..." -ForegroundColor Yellow
Start-Process cmd -ArgumentList "/c", """$feCmdFile"""

# -- Summary ----------------------------------------------
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Services Starting..." -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Backend API  : http://localhost:6662/api/v2" -ForegroundColor White
Write-Host "  Frontend Web : http://localhost:7779/" -ForegroundColor White
Write-Host ""
Write-Host "  Two CMD windows opened. Close them to stop the services." -ForegroundColor Gray
Write-Host ""
Read-Host "Press Enter to close this window"
