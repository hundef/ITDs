# PostgreSQL Setup and Migration Script

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "PostgreSQL Setup & Migration Script" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check if PostgreSQL is installed
Write-Host "[1/5] Checking PostgreSQL installation..." -ForegroundColor Yellow
$psqlVersion = psql --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "PostgreSQL is not installed or not in PATH" -ForegroundColor Red
    exit 1
}
Write-Host "PostgreSQL found: $psqlVersion" -ForegroundColor Green
Write-Host ""

# Test connection to PostgreSQL
Write-Host "[2/5] Testing PostgreSQL connection..." -ForegroundColor Yellow
$connTest = psql -U postgres -h localhost -c "SELECT 1;" 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Cannot connect to PostgreSQL" -ForegroundColor Red
    exit 1
}
Write-Host "Successfully connected to PostgreSQL" -ForegroundColor Green
Write-Host ""

# Create database if it doesn't exist
Write-Host "[3/5] Creating database itd_portfolio..." -ForegroundColor Yellow
createdb -U postgres -h localhost itd_portfolio 2>&1
Write-Host "Database creation completed" -ForegroundColor Green
Write-Host ""

# Run migration script
Write-Host "[4/5] Running data migration..." -ForegroundColor Yellow
node server/src/db/migrate.js
if ($LASTEXITCODE -ne 0) {
    Write-Host "Migration failed" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Summary
Write-Host "================================================" -ForegroundColor Green
Write-Host "PostgreSQL Setup Complete!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Stop current npm run dev (Ctrl+C)" -ForegroundColor White
Write-Host "2. Run: npm run dev" -ForegroundColor White
Write-Host "3. Access: http://localhost:3000" -ForegroundColor White
Write-Host ""
