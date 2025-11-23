# PowerShell script to clean up and start dev server
Write-Host "Cleaning up port 3000..." -ForegroundColor Yellow

# Kill any process using port 3000
$processIds = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique

if ($processIds) {
    foreach ($pid in $processIds) {
        Write-Host "Killing process on port 3000 (PID: $pid)" -ForegroundColor Red
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
    }
} else {
    Write-Host "No process found on port 3000" -ForegroundColor Green
}

Write-Host "Starting development server..." -ForegroundColor Green
npm run dev
