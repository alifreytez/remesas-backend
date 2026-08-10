$migrationsDir = "z:\home\alifreytez\remesas\backend\src\database\cli\migrate\migrations"
$files = Get-ChildItem -Path $migrationsDir -Filter "*.cjs"

foreach ($f in $files) {
    $content = [System.IO.File]::ReadAllText($f.FullName)
    
    $pattern = '(?m)(\s*),\s*created_at: \{ type: Sequelize\.DATE, allowNull: false, defaultValue: Sequelize\.literal\(''CURRENT_TIMESTAMP''\) \},\r?\n\s*updated_at: \{ type: Sequelize\.DATE, allowNull: false, defaultValue: Sequelize\.literal\(''CURRENT_TIMESTAMP''\) \},\r?\n\s*deleted_at: \{ type: Sequelize\.DATE \},\r?\n\s*\}\,\r?\n\s*\{\s*transaction\s*\}\r?\n\s*\)\;'
    
    $replacement = "`$1},`n`$1{ transaction }`n`$1);"
    
    if ($content -match $pattern) {
        $content = $content -replace $pattern, $replacement
        [System.IO.File]::WriteAllText($f.FullName, $content, (New-Object System.Text.UTF8Encoding($false)))
        Write-Output "Reverted $($f.Name)"
    }
}
