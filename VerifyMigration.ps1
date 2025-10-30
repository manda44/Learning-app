$connectionString = "Server=DESKTOP-OJMN97K\SQLEXPRESS;Database=LearningApp;Integrated Security=true;TrustServerCertificate=true;"

try
{
    $connection = New-Object System.Data.SqlClient.SqlConnection
    $connection.ConnectionString = $connectionString
    $connection.Open()
    Write-Host "Connected to database" -ForegroundColor Green

    # Check MiniProject columns
    $query1 = "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'MiniProject' ORDER BY ORDINAL_POSITION"
    $cmd1 = New-Object System.Data.SqlClient.SqlCommand
    $cmd1.Connection = $connection
    $cmd1.CommandText = $query1
    $reader1 = $cmd1.ExecuteReader()

    Write-Host "`nMiniProject Columns:" -ForegroundColor Yellow
    while ($reader1.Read())
    {
        Write-Host "  - " $reader1["COLUMN_NAME"]
    }
    $reader1.Close()

    # Check Ticket columns
    $query2 = "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Ticket' ORDER BY ORDINAL_POSITION"
    $cmd2 = New-Object System.Data.SqlClient.SqlCommand
    $cmd2.Connection = $connection
    $cmd2.CommandText = $query2
    $reader2 = $cmd2.ExecuteReader()

    Write-Host "`nTicket Columns:" -ForegroundColor Yellow
    while ($reader2.Read())
    {
        Write-Host "  - " $reader2["COLUMN_NAME"]
    }
    $reader2.Close()

    # Check row counts (verify data is preserved)
    $query3 = "SELECT COUNT(*) as Count FROM MiniProject"
    $cmd3 = New-Object System.Data.SqlClient.SqlCommand
    $cmd3.Connection = $connection
    $cmd3.CommandText = $query3
    $count1 = $cmd3.ExecuteScalar()

    $query4 = "SELECT COUNT(*) as Count FROM Ticket"
    $cmd4 = New-Object System.Data.SqlClient.SqlCommand
    $cmd4.Connection = $connection
    $cmd4.CommandText = $query4
    $count2 = $cmd4.ExecuteScalar()

    Write-Host "`nData Integrity Check:" -ForegroundColor Yellow
    Write-Host "  MiniProject rows: $count1"
    Write-Host "  Ticket rows: $count2"

    Write-Host "`n✓ Migration verification completed successfully!" -ForegroundColor Green

    $connection.Close()
}
catch
{
    Write-Host "✗ Error: $_" -ForegroundColor Red
    exit 1
}
