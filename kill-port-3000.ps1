# Tim va tat process dang dung port 3000 (chay trong PowerShell)
$port = 3000
$found = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
if ($found) {
    $found | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }
    Write-Host "Da tat process dung port $port"
} else {
    Write-Host "Khong co process nao dung port $port"
}
