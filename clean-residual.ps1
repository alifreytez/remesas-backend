$migrationsDir = "z:\home\alifreytez\remesas\backend\src\database\cli\migrate\migrations"
$files = Get-ChildItem -Path $migrationsDir -Filter "*.cjs"

foreach ($f in $files) {
    $content = [System.IO.File]::ReadAllText($f.FullName)
    
    $pattern = '(?s)\s*,\s*created_at: \{ type: Sequelize\.DATE, allowNull: false, defaultValue: Sequelize\.literal\(''CURRENT_TIMESTAMP''\) \},\s*updated_at: \{ type: Sequelize\.DATE, allowNull: false, defaultValue: Sequelize\.literal\(''CURRENT_TIMESTAMP''\) \},\s*deleted_at: \{ type: Sequelize\.DATE \},\s*'
    
    if ($content -match $pattern) {
        $content = $content -replace $pattern, ' '
        [System.IO.File]::WriteAllText($f.FullName, $content, (New-Object System.Text.UTF8Encoding($false)))
        Write-Output "Cleaned $($f.Name)"
    }
}
