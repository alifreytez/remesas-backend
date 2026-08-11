$migrationsDir = "z:\home\alifreytez\remesas\backend\src\database\cli\migrate\migrations"
$files = Get-ChildItem -Path $migrationsDir -Filter "*.cjs"

$auditCols = "`n                        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },`n                        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },`n                        deleted_at: { type: Sequelize.DATE }`n"

foreach ($f in $files) {
    if ($f.Name -match "00-" -or $f.Name -match "99-" -or $f.Name -match "140-" -or $f.Name -match "141-" -or $f.Name -match "142-" -or $f.Name -match "143-" -or $f.Name -match "144-" -or $f.Name -match "01-init") {
        continue
    }

    $content = [System.IO.File]::ReadAllText($f.FullName)
    
    $match = [regex]::Match($content, '(?s)(\s*)\},\s*\{\s*transaction\s*\}\s*\)\;')
    if ($match.Success) {
        $fullMatch = $match.Value
        $indent = $match.Groups[1].Value
        
        $replacement = "$indent,$auditCols$indent},`n$indent{ transaction }`n$indent);"
        
        $content = $content.Remove($match.Index, $match.Length).Insert($match.Index, $replacement)
        
        [System.IO.File]::WriteAllText($f.FullName, $content, (New-Object System.Text.UTF8Encoding($false)))
        Write-Output "Fixed $($f.Name)"
    }
}
