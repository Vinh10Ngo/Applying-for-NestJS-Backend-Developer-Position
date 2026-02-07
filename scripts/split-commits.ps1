# Script tach commit "handle admin" (hoac commit gan nhat) thanh nhieu commit theo chuc nang.
# Chay trong thu muc du an: .\scripts\split-commits.ps1
# Can: git da cai, dang o nhanh main/master, chua push hoac da push (neu da push thi phai force push sau nay).

$ErrorActionPreference = 'Stop'
# Repo root = thu muc cha cua scripts\
$root = Split-Path $PSScriptRoot -Parent
if (-not (Test-Path (Join-Path $root '.git'))) {
    $root = Get-Location
}
Set-Location $root

Write-Host "Thu muc repo: $root"
Write-Host ""

# Buoc 1: Huy commit gan nhat, giu lai thay doi (unstaged)
Write-Host "[1/2] Reset soft commit gan nhat..."
git reset --soft HEAD~1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Loi: Khong the reset (co the chi co 1 commit?). Dung script." -ForegroundColor Red
    exit 1
}
git reset
Write-Host "    Da unstage tat ca. Cac file thay doi van o working tree." -ForegroundColor Green
Write-Host ""

# Buoc 2: Add va commit tung nhom (chinh sua thu tu/ten neu can)
$commits = @(
    @{
        Name = "feat(admin): PATCH /users/:id - doi vai tro user (admin)"
        Paths = @(
            "src/users/dto/update-user-role.dto.ts",
            "src/users/users.service.ts",
            "src/users/users.controller.ts"
        )
    },
    @{
        Name = "feat(admin): GET /articles/admin - quan ly bai viet (phan trang + tim kiem)"
        Paths = @(
            "src/articles/articles.controller.ts"
        )
    },
    @{
        Name = "docs: API Admin - tai lieu API quan tri"
        Paths = @(
            "docs/API-ADMIN.md"
        )
    }
)

foreach ($c in $commits) {
    $add = $false
    foreach ($p in $c.Paths) {
        if (Test-Path $p) {
            git add $p
            $add = $true
        }
    }
    if ($add) {
        git status --short
        git commit -m $c.Name
        Write-Host "    Committed: $($c.Name)" -ForegroundColor Green
    }
}

# Con lai (file khac trong commit cu) - commit 1 lan
$remaining = git status --porcelain
if ($remaining) {
    Write-Host ""
    Write-Host "Con lai (chua add):" -ForegroundColor Yellow
    git status --short
    $ans = Read-Host "Commit cac file con lai thanh 1 commit? (y/n)"
    if ($ans -eq 'y') {
        git add -A
        git commit -m "chore: cac thay doi con lai"
        Write-Host "    Done." -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "Xong. Xem lich su: git log --oneline -10" -ForegroundColor Cyan
Write-Host "Neu da push commit cu len remote, sau nay push lai can: git push --force-with-lease" -ForegroundColor Yellow
