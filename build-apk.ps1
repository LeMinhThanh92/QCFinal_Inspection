# ─────────────────────────────────────────────────────────────
# build-apk.ps1 — Build APK for a specific server IP
# Run from project root: .\build-apk.ps1 -ServerIP "10.20.30.40"
#
# Examples:
#   .\build-apk.ps1 -ServerIP "172.17.100.199"              # Same IP for frontend & backend
#   .\build-apk.ps1 -ServerIP "10.20.30.40" -Label "TH"     # Thailand
#   .\build-apk.ps1 -ServerIP "10.30.40.50" -Label "KH"     # Cambodia
#   .\build-apk.ps1 -ServerIP "10.40.50.60" -Label "ID"     # Indonesia
#
#   # Separate frontend & backend servers:
#   .\build-apk.ps1 -ServerIP "172.17.100.199" -FrontendIP "10.1.1.1" -Label "TH"
#   .\build-apk.ps1 -ServerIP "172.17.100.199" -BackendIP "10.2.2.2" -Label "KH"
#   .\build-apk.ps1 -FrontendIP "10.1.1.1" -BackendIP "10.2.2.2" -Label "ID"
#   .\build-apk.ps1 -FrontendIP "10.1.1.1" -FrontendPort 8080 -BackendIP "10.2.2.2" -BackendPort 9999
# ─────────────────────────────────────────────────────────────
param(
    [string]$ServerIP = "",

    [string]$FrontendIP = "",
    [int]$FrontendPort = 7780,

    [string]$BackendIP = "",
    [int]$BackendPort = 6663,

    [string]$Label = "",

    [string]$JavaHome = "C:\Program Files\Java\jdk-17"
)

$ErrorActionPreference = "Stop"
$ProjectRoot = $PSScriptRoot
$MobileDir   = Join-Path $ProjectRoot "mobile"
$AndroidDir  = Join-Path $MobileDir "android"
$FrontendDir = Join-Path $ProjectRoot "frontend"

# ── Resolve IPs: FrontendIP / BackendIP fallback to ServerIP ──
if (-not $FrontendIP -and -not $BackendIP -and -not $ServerIP) {
    Write-Host "ERROR: You must provide -ServerIP, or at least one of -FrontendIP / -BackendIP." -ForegroundColor Red
    Write-Host ""
    Write-Host "Usage examples:" -ForegroundColor Yellow
    Write-Host "  .\build-apk.ps1 -ServerIP '172.17.100.199'"                               -ForegroundColor Gray
    Write-Host "  .\build-apk.ps1 -FrontendIP '10.1.1.1' -BackendIP '10.2.2.2' -Label 'TH'" -ForegroundColor Gray
    exit 1
}

if (-not $FrontendIP) { $FrontendIP = $ServerIP }
if (-not $BackendIP)  { $BackendIP  = $ServerIP }

if (-not $FrontendIP -or -not $BackendIP) {
    Write-Host "ERROR: Cannot resolve both Frontend and Backend IPs." -ForegroundColor Red
    Write-Host "  Provide -ServerIP for both, or specify each with -FrontendIP / -BackendIP." -ForegroundColor Red
    exit 1
}

$FrontendUrl = "http://${FrontendIP}:${FrontendPort}/"
$BackendUrl  = "http://${BackendIP}:${BackendPort}/api/v2"

# ── Resolve output APK name ────────────────────────────────
if ($Label) {
    $ApkName = "SampleRoomDigital-${Label}.apk"
} else {
    $safe = $FrontendIP -replace '\.', '_'
    $ApkName = "SampleRoomDigital-${safe}.apk"
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  SampleRoomDigital — APK Build"          -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
if ($FrontendIP -eq $BackendIP) {
    Write-Host "  Server IP   : $FrontendIP (same for both)" -ForegroundColor Gray
} else {
    Write-Host "  Frontend IP : $FrontendIP"                  -ForegroundColor Gray
    Write-Host "  Backend IP  : $BackendIP"                   -ForegroundColor Gray
}
Write-Host "  Frontend URL: $FrontendUrl"                 -ForegroundColor Gray
Write-Host "  Backend URL : $BackendUrl"                  -ForegroundColor Gray
Write-Host "  Output      : $ApkName"                     -ForegroundColor Gray
Write-Host ""

# ── Validate ────────────────────────────────────────────────
if (-not (Test-Path $MobileDir)) {
    Write-Host "ERROR: mobile/ folder not found at $MobileDir" -ForegroundColor Red
    exit 1
}
$env:JAVA_HOME = $JavaHome

# ─────────────────────────────────────────────────────────────
# [1/5] Update frontend config.json (for the web build bundled in APK)
# ─────────────────────────────────────────────────────────────
Write-Host "[1/5] Updating frontend config.json..." -ForegroundColor Yellow
$configPath = Join-Path $FrontendDir "public\config.json"
$configJson = @{ backendUrl = $BackendUrl } | ConvertTo-Json
[System.IO.File]::WriteAllText($configPath, $configJson, [System.Text.Encoding]::UTF8)
Write-Host "  -> config.json: $BackendUrl" -ForegroundColor Green

# Also update .env.production as fallback
$envProd = Join-Path $FrontendDir ".env.production"
Set-Content -Path $envProd -Value "VITE_APP_API_URL=$BackendUrl" -Encoding UTF8
Write-Host "  -> .env.production updated (fallback)" -ForegroundColor Green

# ─────────────────────────────────────────────────────────────
# [2/5] Update capacitor.config.ts
# ─────────────────────────────────────────────────────────────
Write-Host "[2/5] Updating capacitor.config.ts..." -ForegroundColor Yellow
$capConfigPath = Join-Path $MobileDir "capacitor.config.ts"
$capContent = @"
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.trax.sampleroomdigital',
  appName: 'Sample Room Digital',
  webDir: '../frontend/dist',
  server: {
    url: '$FrontendUrl',
    cleartext: true
  },
  android: {
    allowMixedContent: true,
  }
};

export default config;
"@
[System.IO.File]::WriteAllText($capConfigPath, $capContent, [System.Text.Encoding]::UTF8)
Write-Host "  -> server.url = $FrontendUrl" -ForegroundColor Green

# ─────────────────────────────────────────────────────────────
# [3/5] Update network_security_config.xml (whitelist IPs for HTTP)
# ─────────────────────────────────────────────────────────────
Write-Host "[3/5] Updating network_security_config.xml..." -ForegroundColor Yellow
$netSecPath = Join-Path $AndroidDir "app\src\main\res\xml\network_security_config.xml"

# Build domain entries — whitelist both IPs if they differ
$domainEntries = "        <domain includeSubdomains=`"true`">$FrontendIP</domain>"
if ($BackendIP -ne $FrontendIP) {
    $domainEntries += "`n        <domain includeSubdomains=`"true`">$BackendIP</domain>"
}

$netSecContent = @"
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <!-- Allow cleartext and trust all certs for internal network -->
    <base-config cleartextTrafficPermitted="true">
        <trust-anchors>
            <certificates src="system" />
            <certificates src="user" />
        </trust-anchors>
    </base-config>
    <domain-config cleartextTrafficPermitted="true">
$domainEntries
        <trust-anchors>
            <certificates src="system" />
            <certificates src="user" />
        </trust-anchors>
    </domain-config>
</network-security-config>
"@
[System.IO.File]::WriteAllText($netSecPath, $netSecContent, [System.Text.Encoding]::UTF8)
if ($BackendIP -ne $FrontendIP) {
    Write-Host "  -> Whitelisted $FrontendIP (frontend) + $BackendIP (backend) for HTTP" -ForegroundColor Green
} else {
    Write-Host "  -> Whitelisted $FrontendIP for HTTP" -ForegroundColor Green
}

# ─────────────────────────────────────────────────────────────
# [4/5] Sync Capacitor (generates capacitor.config.json in APK)
# ─────────────────────────────────────────────────────────────
Write-Host "[4/5] Running Capacitor sync..." -ForegroundColor Yellow
Push-Location $MobileDir
try {
    & npx cap sync android 2>&1 | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
    if ($LASTEXITCODE -ne 0) { throw "Capacitor sync failed" }
    Write-Host "  -> Capacitor sync OK" -ForegroundColor Green
} finally {
    Pop-Location
}

# Verify capacitor.config.json was updated
$capJsonPath = Join-Path $AndroidDir "app\src\main\assets\capacitor.config.json"
if (Test-Path $capJsonPath) {
    $capJson = Get-Content $capJsonPath -Raw | ConvertFrom-Json
    Write-Host "  -> capacitor.config.json url = $($capJson.server.url)" -ForegroundColor Green
}

# ─────────────────────────────────────────────────────────────
# [5/5] Build APK via Gradle
# ─────────────────────────────────────────────────────────────
Write-Host "[5/5] Building APK (Gradle assembleDebug)..." -ForegroundColor Yellow
Push-Location $AndroidDir
try {
    & .\gradlew.bat assembleDebug 2>&1 | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
    if ($LASTEXITCODE -ne 0) { throw "Gradle build failed" }
    Write-Host "  -> Gradle build OK" -ForegroundColor Green
} finally {
    Pop-Location
}

# ─────────────────────────────────────────────────────────────
# Copy APK to project root with a descriptive name
# ─────────────────────────────────────────────────────────────
$apkSource = Join-Path $AndroidDir "app\build\outputs\apk\debug\app-debug.apk"
if (Test-Path $apkSource) {
    $apkDest = Join-Path $ProjectRoot $ApkName
    Copy-Item $apkSource -Destination $apkDest -Force
    $apkSize = [math]::Round((Get-Item $apkDest).Length / 1MB, 2)

    Write-Host ""
    Write-Host "============================================" -ForegroundColor Cyan
    Write-Host "  APK BUILD COMPLETE" -ForegroundColor Green
    Write-Host "============================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  File     : $ApkName ($apkSize MB)" -ForegroundColor White
    Write-Host "  Frontend : $FrontendUrl" -ForegroundColor White
    Write-Host "  Backend  : $BackendUrl" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "WARNING: APK file not found at expected location" -ForegroundColor Yellow
    Write-Host "  Expected: $apkSource" -ForegroundColor Gray
    Write-Host "  Check Gradle output above for errors." -ForegroundColor Gray
}
