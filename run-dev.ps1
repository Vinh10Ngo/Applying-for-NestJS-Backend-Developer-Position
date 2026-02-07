# Chay NestJS o che do dev. Chay trong terminal Cursor: .\run-dev.ps1
$ErrorActionPreference = 'Stop'
$dir = Get-ChildItem E:\ -Directory | Where-Object { $_.Name -like 'cursor*' -and $_.Name -notlike '*frontend*' } | Select-Object -First 1
if (-not $dir) { Write-Error 'Khong tim thay thu muc du an tren E:\'; exit 1 }
Set-Location $dir.FullName
npm run start:dev
