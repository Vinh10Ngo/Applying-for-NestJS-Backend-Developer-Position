# Chay trong thu muc du an: cd "E:\cursor _ xin viec"  roi  .\init-git.ps1

$here = Get-Location
Write-Host "Thu muc hien tai: $here" -ForegroundColor Yellow

if (Test-Path .git) {
    Remove-Item -Recurse -Force .git
    Write-Host "Da xoa .git cu" -ForegroundColor Gray
}

New-Item -ItemType Directory -Force .git | Out-Null
New-Item -ItemType Directory -Force .git\refs\heads | Out-Null
New-Item -ItemType Directory -Force .git\objects | Out-Null
New-Item -ItemType Directory -Force .git\hooks | Out-Null
New-Item -ItemType Directory -Force .git\info | Out-Null

# Ghi config bang ASCII de tranh BOM (git doc duoc)
$config = @"
[core]
	repositoryformatversion = 0
	filemode = false
	bare = false
	logallrefupdates = true
	symlinks = false
	ignorecase = true
"@
[System.IO.File]::WriteAllText("$here\.git\config", $config)

[System.IO.File]::WriteAllText("$here\.git\HEAD", "ref: refs/heads/main`n")

Write-Host "Da tao .git tai: $here\.git" -ForegroundColor Green
Write-Host ""
Write-Host "Kiem tra..." -ForegroundColor Cyan
& git status 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "Neu van loi, thu chay: git init" -ForegroundColor Red
} else {
    Write-Host ""
    Write-Host "Thanh cong. Tiep theo: git add ." -ForegroundColor Green
    Write-Host "Sau do: git commit -m `"Initial commit`"" -ForegroundColor Green
}
