$pgvectorDir = "$env:TEMP\pgvector"
$pgRoot = "C:\Program Files\PostgreSQL\17"

Write-Host "Installing pgvector into PostgreSQL 17..." -ForegroundColor Cyan

Copy-Item "$pgvectorDir\vector.dll"           "$pgRoot\lib\vector.dll"                    -Force
Copy-Item "$pgvectorDir\sql\vector.sql"       "$pgRoot\share\extension\vector.sql"         -Force
Copy-Item "$pgvectorDir\sql\vector--0.8.0.sql" "$pgRoot\share\extension\vector--0.8.0.sql" -Force
Copy-Item "$pgvectorDir\vector.control"       "$pgRoot\share\extension\vector.control"     -Force

Write-Host "pgvector installed successfully!" -ForegroundColor Green
Write-Host "Press any key to close..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
