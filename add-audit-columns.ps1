$migrationsDir = "z:\home\alifreytez\remesas\backend\src\database\cli\migrate\migrations"
$files = Get-ChildItem -Path $migrationsDir -Filter "*.cjs"

$auditColumns = @"
                        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
                        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
                        deleted_at: { type: Sequelize.DATE },
"@

foreach ($f in $files) {
    if ($f.Name -match "135-migrate-status-to-paranoid") {
        Remove-Item $f.FullName
        Write-Output "Deleted $($f.Name)"
        continue
    }

    $content = [System.IO.File]::ReadAllText($f.FullName)
    
    if ($content -match "createTable" -and $content -notmatch "deleted_at") {
        # Using regex to insert right before `\s*\}, \s*\{ transaction \}` in createTable
        # Since these files were generated consistently by generate-migration.js, they all have:
        #                    },
        #                    { transaction }
        #                );
        
        $content = $content -replace '(?m)(\s*)\},\s*\{\s*transaction\s*\}\s*\);', "`$1,$auditColumns`$1},`n`$1{ transaction }`n`$1);"
        
        [System.IO.File]::WriteAllText($f.FullName, $content, (New-Object System.Text.UTF8Encoding($false)))
        Write-Output "Injected audit columns into $($f.Name)"
    }
}
