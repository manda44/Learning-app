$connectionString = "Server=DESKTOP-OJMN97K\SQLEXPRESS;Database=LearningApp;Integrated Security=true;TrustServerCertificate=true;"
$sqlQueries = @"
-- Add columns to MiniProject table
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'MiniProject' AND COLUMN_NAME = 'Title')
BEGIN
    ALTER TABLE [dbo].[MiniProject] ADD [Title] VARCHAR(255) NULL;
    ALTER TABLE [dbo].[MiniProject] ADD [Description] VARCHAR(MAX) NULL;
    ALTER TABLE [dbo].[MiniProject] ADD [CreatedAt] DATETIME DEFAULT GETDATE();
    ALTER TABLE [dbo].[MiniProject] ADD [UpdatedAt] DATETIME NULL;
    PRINT 'MiniProject table altered successfully';
END

-- Add columns to Ticket table
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Ticket' AND COLUMN_NAME = 'Title')
BEGIN
    ALTER TABLE [dbo].[Ticket] ADD [Title] VARCHAR(255) NULL;
    ALTER TABLE [dbo].[Ticket] ADD [Description] VARCHAR(MAX) NULL;
    ALTER TABLE [dbo].[Ticket] ADD [Status] VARCHAR(50) DEFAULT 'pending' NULL;
    ALTER TABLE [dbo].[Ticket] ADD [CreatedAt] DATETIME DEFAULT GETDATE();
    ALTER TABLE [dbo].[Ticket] ADD [UpdatedAt] DATETIME NULL;
    PRINT 'Ticket table altered successfully';
END

-- Verify tables
SELECT 'MiniProject Columns:' as Info;
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'MiniProject' ORDER BY ORDINAL_POSITION;

SELECT 'Ticket Columns:' as Info;
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Ticket' ORDER BY ORDINAL_POSITION;

SELECT 'Migration completed successfully!' as Status;
"@

try
{
    $connection = New-Object System.Data.SqlClient.SqlConnection
    $connection.ConnectionString = $connectionString
    $connection.Open()
    Write-Host "✓ Connected to LearningApp database" -ForegroundColor Green

    $command = New-Object System.Data.SqlClient.SqlCommand
    $command.Connection = $connection
    $command.CommandText = $sqlQueries
    $command.CommandTimeout = 300

    $result = $command.ExecuteNonQuery()
    Write-Host "✓ Migration applied successfully!" -ForegroundColor Green

    $connection.Close()
}
catch
{
    Write-Host "✗ Error: $_" -ForegroundColor Red
    exit 1
}
