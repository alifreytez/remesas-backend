$migrationsDir = "z:\home\alifreytez\remesas\backend\src\database\cli\migrate\migrations"
$files = Get-ChildItem -Path $migrationsDir -Filter "*.cjs"

foreach ($f in $files) {
    $content = [System.IO.File]::ReadAllText($f.FullName)
    
    # Remove status column
    $content = $content -replace '(?m)^\s*status:\s*\{\s*type:\s*Sequelize\.INTEGER[^\}]+\},\r?\n', ''
    
    # Remove where: { status: 1 } from indices
    $content = $content -replace '(?i),\s*where:\s*\{\s*status:\s*1\s*\}', ''
    $content = $content -replace '(?i)where:\s*\{\s*status:\s*1\s*\},\s*', ''
    $content = $content -replace '(?i)where:\s*\{\s*status:\s*1\s*\}', ''
    
    # Remove fk_status constraints
    $content = $content -replace '(?s)await queryInterface\.addConstraint\(\s*\{\s*schema:\s*''[a-zA-Z0-9_]+'',\s*tableName:\s*''[a-zA-Z0-9_]+''\s*\},\s*\{\s*fields:\s*\[''status''\].*?name:\s*''fk_status''.*?\}\s*\);\s*', ''
    
    [System.IO.File]::WriteAllText($f.FullName, $content, (New-Object System.Text.UTF8Encoding($false)))
}

$seedersDir = "z:\home\alifreytez\remesas\backend\src\database\cli\migrate\seeders"
if (Test-Path $seedersDir) {
    $sfiles = Get-ChildItem -Path $seedersDir -Filter "*.cjs"
    foreach ($sf in $sfiles) {
        $content = [System.IO.File]::ReadAllText($sf.FullName)
        $content = $content -replace '(?i),\s*status:\s*1', ''
        $content = $content -replace '(?i)status:\s*1\s*,?', ''
        [System.IO.File]::WriteAllText($sf.FullName, $content, (New-Object System.Text.UTF8Encoding($false)))
    }
}
Write-Output "Status column and constraints removed from all migrations and seeders."
