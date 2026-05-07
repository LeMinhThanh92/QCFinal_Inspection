# ─────────────────────────────────────────────────────────────
# build.ps1 — One-click build & zip for SampleRoomDigital
# Run from project root: .\build.ps1
#
# Examples:
#   .\build.ps1
#   .\build.ps1 -BackendUrl "http://192.168.1.100:6664/api/v2"
#   .\build.ps1 -BackendUrl "http://myserver:6664/api/v2"
# ─────────────────────────────────────────────────────────────
param(
    [string]$OutputZip   = "QCFinal-release.zip",
    [string]$BackendUrl  = "",
    [string]$JavaHome    = "C:\Program Files\Java\jdk-17"
)

$ErrorActionPreference = "Stop"
$ProjectRoot = $PSScriptRoot
$ReleaseDir  = Join-Path $ProjectRoot "release"

# ── Validate Java ────────────────────────────────────────
$javaExe  = Join-Path $JavaHome "bin\java.exe"
$jlinkExe = Join-Path $JavaHome "bin\jlink.exe"
if (-not (Test-Path $javaExe)) {
    Write-Host "ERROR: Java not found at $JavaHome" -ForegroundColor Red
    Write-Host "       Set -JavaHome to your JDK 17 path" -ForegroundColor Red
    exit 1
}
# Set JAVA_HOME for Maven wrapper
$env:JAVA_HOME = $JavaHome

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  QCFinal — Production Build"   -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Java:       $JavaHome" -ForegroundColor Gray
if ($BackendUrl) {
    Write-Host "  BackendUrl: $BackendUrl" -ForegroundColor Gray
}
Write-Host ""

# ── 0. Clean previous release ──────────────────────────────
if (Test-Path $ReleaseDir)  { Remove-Item $ReleaseDir  -Recurse -Force }
$zipPath = Join-Path $ProjectRoot $OutputZip
if (Test-Path $zipPath)     { Remove-Item $zipPath -Force }

# ── 0.5 Auto-increment patch version ─────────────────────
$versionFile = Join-Path $ProjectRoot "frontend\src\components\constants\version.ts"
if (Test-Path $versionFile) {
    $vContent = Get-Content $versionFile -Raw
    if ($vContent -match 'v(\d+)\.(\d+)\.(\d+)') {
        $vMajor = [int]$Matches[1]
        $vMinor = [int]$Matches[2]
        $vPatch = [int]$Matches[3] + 1
        $newVersion = "v$vMajor.$vMinor.$vPatch"
        $vContent = $vContent -replace 'v\d+\.\d+\.\d+', $newVersion
        [System.IO.File]::WriteAllText($versionFile, $vContent)
        Write-Host "[0/5] Version: $newVersion" -ForegroundColor Yellow
    }
} else {
    $newVersion = "unknown"
}

# ── 0.6 Resolve Backend URL ──────────────────────────────
if (-not $BackendUrl) {
    $BackendUrl = "http://172.17.100.199:6664/api/v2"
}
Write-Host "[0/5] Backend URL: $BackendUrl" -ForegroundColor Yellow
$envProd = Join-Path $ProjectRoot "frontend\.env.production"
Set-Content -Path $envProd -Value "VITE_APP_API_URL=$BackendUrl" -Encoding UTF8
Write-Host "  -> .env.production updated" -ForegroundColor Green

# Also update runtime config.json (used by frontend at runtime)
$configJsonPath = Join-Path $ProjectRoot "frontend\public\config.json"
$configJson = @{ backendUrl = $BackendUrl } | ConvertTo-Json
[System.IO.File]::WriteAllText($configJsonPath, $configJson, [System.Text.Encoding]::UTF8)
Write-Host "  -> config.json updated" -ForegroundColor Green

# ── 1. Build Backend (Maven) ──────────────────────────────
Write-Host "[1/5] Building Backend (Maven)..." -ForegroundColor Yellow
Push-Location (Join-Path $ProjectRoot "backend")
try {
    & .\mvnw.cmd clean package -DskipTests -q
    if ($LASTEXITCODE -ne 0) { throw "Maven build failed with exit code $LASTEXITCODE" }
    Write-Host "  -> Backend build OK" -ForegroundColor Green
} finally {
    Pop-Location
}

# ── 2. Build Frontend (Vite) ─────────────────────────────
Write-Host "[2/5] Building Frontend (Vite)..." -ForegroundColor Yellow
Push-Location (Join-Path $ProjectRoot "frontend")
try {
    Write-Host "  -> Installing frontend dependencies..." -ForegroundColor Gray
    & npm install --legacy-peer-deps
    if ($LASTEXITCODE -ne 0) { throw "Frontend npm install failed with exit code $LASTEXITCODE" }

    Write-Host "  -> Running frontend build..." -ForegroundColor Gray
    & npm run build
    if ($LASTEXITCODE -ne 0) { throw "Frontend build failed with exit code $LASTEXITCODE" }
    Write-Host "  -> Frontend build OK" -ForegroundColor Green
} finally {
    Pop-Location
}

# ── 3. Create portable JRE (jlink) ──────────────────────
Write-Host "[3/5] Creating portable JRE (jlink)..." -ForegroundColor Yellow
$jreDir = Join-Path $ReleaseDir "jre"
if (Test-Path $jlinkExe) {
    & $jlinkExe `
        --module-path "$JavaHome\jmods" `
        --add-modules java.base,java.logging,java.sql,java.naming,java.management,java.instrument,java.desktop,java.security.jgss,java.xml,java.xml.crypto,java.net.http,jdk.unsupported,jdk.crypto.ec,jdk.crypto.cryptoki `
        --output $jreDir `
        --strip-debug `
        --compress 2 `
        --no-header-files `
        --no-man-pages
    if ($LASTEXITCODE -ne 0) { throw "jlink failed with exit code $LASTEXITCODE" }
    $jreSize = [math]::Round((Get-ChildItem $jreDir -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB, 1)
    Write-Host "  -> Portable JRE created ($jreSize MB)" -ForegroundColor Green
} else {
    Write-Host "  -> jlink not found, copying full JRE..." -ForegroundColor Yellow
    Copy-Item $JavaHome -Destination $jreDir -Recurse
    Write-Host "  -> Full JDK copied (larger)" -ForegroundColor Green
}

# ── 4. Assemble release folder ───────────────────────────
Write-Host "[4/5] Assembling release package..." -ForegroundColor Yellow

# Create directories
$beRelease = Join-Path $ReleaseDir "backend"
$feRelease = Join-Path $ReleaseDir "frontend"
New-Item -ItemType Directory -Path $beRelease -Force | Out-Null
New-Item -ItemType Directory -Path $feRelease -Force | Out-Null

# Backend: copy fat JAR
$jar = Get-ChildItem (Join-Path $ProjectRoot "backend\target") -Filter "*.jar" |
       Where-Object { $_.Name -notlike "*-plain*" -and $_.Name -notlike "*original*" } |
       Select-Object -First 1
if (-not $jar) { throw "No JAR found in backend\target\" }
Copy-Item $jar.FullName -Destination $beRelease
Write-Host "  -> JAR: $($jar.Name)" -ForegroundColor Gray

# Backend: copy application.properties (for easy config changes)
Copy-Item (Join-Path $ProjectRoot "backend\src\main\resources\application.properties") -Destination $beRelease
Write-Host "  -> application.properties" -ForegroundColor Gray

# Backend: copy custom-java.security
$securityFile = Join-Path $ProjectRoot "backend\src\main\resources\custom-java.security"
if (Test-Path $securityFile) {
    Copy-Item $securityFile -Destination $beRelease
    Write-Host "  -> custom-java.security" -ForegroundColor Gray
}

# Frontend: copy dist files directly to frontend root
Copy-Item (Join-Path $ProjectRoot "frontend\dist\*") -Destination $feRelease -Recurse
Write-Host "  -> frontend dist files" -ForegroundColor Gray

# Frontend: create serve.json for SPA routing
$serveConfig = @'
{
  "rewrites": [
    { "source": "**", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/assets/**",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
'@
[System.IO.File]::WriteAllText((Join-Path $feRelease "serve.json"), $serveConfig)
Write-Host "  -> serve.json (SPA routing config)" -ForegroundColor Gray

# Copy start/stop scripts
foreach ($script in @("start.ps1", "start-backend.ps1", "start-frontend.ps1")) {
    $scriptPath = Join-Path $ProjectRoot $script
    if (Test-Path $scriptPath) {
        Copy-Item $scriptPath -Destination $ReleaseDir
        Write-Host "  -> $script" -ForegroundColor Gray
    }
}

Write-Host "  -> Assembly complete" -ForegroundColor Green

# ── 5. Create ZIP ────────────────────────────────────────
Write-Host "[5/5] Creating ZIP: $OutputZip..." -ForegroundColor Yellow

# Use .NET ZipFile instead of Compress-Archive to avoid "Stream was not readable" locking issues in PS 5.1
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory($ReleaseDir, $zipPath)

Write-Host "  -> ZIP created: $zipPath" -ForegroundColor Green

# Clean up staging folder
Remove-Item $ReleaseDir -Recurse -Force

# ── Done ─────────────────────────────────────────────────
$zipSize = [math]::Round((Get-Item $zipPath).Length / 1MB, 2)
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  BUILD COMPLETE — $newVersion — $OutputZip ($zipSize MB)" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "To deploy: extract the zip and run start.ps1" -ForegroundColor Gray
Write-Host "  (Java is bundled — no JDK/JRE needed on server)" -ForegroundColor Gray
Write-Host ""

