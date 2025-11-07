$connectionString = "Data Source=DESKTOP-OJMN97K\SQLEXPRESS;Database=LearningAppV2;Integrated Security=True;"

try {
    $connection = New-Object System.Data.SqlClient.SqlConnection
    $connection.ConnectionString = $connectionString
    $connection.Open()

    $command = $connection.CreateCommand()
    $command.CommandText = "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE' ORDER BY TABLE_NAME"

    $reader = $command.ExecuteReader()

    Write-Host "Tables dans la base LearningAppV2:" -ForegroundColor Green
    while ($reader.Read()) {
        Write-Host "  - $($reader[0])"
    }

    $reader.Close()
    $connection.Close()
}
catch {
    Write-Host "Erreur: $_" -ForegroundColor Red
}
