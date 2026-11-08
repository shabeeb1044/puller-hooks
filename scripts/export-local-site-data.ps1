# Export local website MySQL + uploads for VPS import (website only — no mail).
# Usage (repo root): powershell -ExecutionPolicy Bypass -File scripts/export-local-site-data.ps1

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

if (-not (Test-Path .env)) { throw '.env not found' }

$envFile = Get-Content .env -Raw
$dbUser = $null; $dbPass = $null; $dbHost = $null; $dbPort = $null; $dbName = $null
if ($envFile -match 'DATABASE_URL="?mysql://([^:/\s]+):([^@]*)@([^:/]+):(\d+)/([^"?\s]+)"?') {
  $dbUser = $Matches[1]; $dbPass = $Matches[2]; $dbHost = $Matches[3]; $dbPort = $Matches[4]; $dbName = $Matches[5]
} elseif ($envFile -match 'DATABASE_URL="?mysql://([^@/\s]+)@([^:/]+):(\d+)/([^"?\s]+)"?') {
  $dbUser = $Matches[1]; $dbPass = ''; $dbHost = $Matches[2]; $dbPort = $Matches[3]; $dbName = $Matches[4]
} else {
  throw 'Could not parse mysql DATABASE_URL from .env'
}

$dumpExe = 'C:\xampp\mysql\bin\mysqldump.exe'
if (-not (Test-Path $dumpExe)) {
  $cmd = Get-Command mysqldump -ErrorAction SilentlyContinue
  if (-not $cmd) { throw 'mysqldump not found (install XAMPP MySQL or add mysqldump to PATH)' }
  $dumpExe = $cmd.Source
}

New-Item -ItemType Directory -Force -Path backups | Out-Null
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$sqlOut = Join-Path $root "backups\puller_hooks-local-$stamp.sql"

Write-Host "Exporting MySQL db=$dbName from ${dbHost}:$dbPort ..."
if ($dbPass) { $env:MYSQL_PWD = $dbPass }
try {
  & $dumpExe -h $dbHost -P $dbPort -u $dbUser --single-transaction --routines --triggers $dbName -r $sqlOut
  if ($LASTEXITCODE -ne 0) { throw "mysqldump failed exit=$LASTEXITCODE" }
} finally {
  Remove-Item Env:MYSQL_PWD -ErrorAction SilentlyContinue
}

Write-Host "DB dump: $sqlOut ($((Get-Item $sqlOut).Length) bytes)"

$uploadsDir = Join-Path $root 'public\uploads'
$zipOut = Join-Path $root "backups\uploads-local-$stamp.zip"
if (Test-Path $uploadsDir) {
  $files = Get-ChildItem $uploadsDir -Recurse -File -ErrorAction SilentlyContinue
  if ($files.Count -gt 0) {
    if (Test-Path $zipOut) { Remove-Item $zipOut -Force }
    Compress-Archive -Path (Join-Path $uploadsDir '*') -DestinationPath $zipOut -Force
    Write-Host "Uploads zip: $zipOut ($((Get-Item $zipOut).Length) bytes)"
  } else {
    Write-Host 'Uploads: empty (skip zip)'
  }
} else {
  Write-Host 'Uploads: folder missing (skip zip)'
}

Write-Host 'Done. Website data only — copy SQL/ZIP to VPS when approved. Do not touch mail.'
