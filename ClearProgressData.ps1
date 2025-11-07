# Script pour supprimer toutes les données d'avancement
# Garde les contenus (cours, chapitres, quiz, questions)

$connectionString = "Data Source=DESKTOP-OJMN97K\SQLEXPRESS;Database=LearningAppV2;Integrated Security=True;"

try {
    $connection = New-Object System.Data.SqlClient.SqlConnection
    $connection.ConnectionString = $connectionString
    $connection.Open()

    Write-Host "Connexion à la base de données réussie" -ForegroundColor Green

    # Supprimer les données d'avancement dans l'ordre correct (contraintes de clés étrangères)
    $tables = @(
        "StudentQuestionResponse",
        "StudentQuizAttempt",
        "StudentChapterProgress"
    )

    foreach ($table in $tables) {
        $command = $connection.CreateCommand()
        $command.CommandText = "DELETE FROM $table"
        $rowsAffected = $command.ExecuteNonQuery()
        Write-Host "Table $table : $rowsAffected lignes supprimées" -ForegroundColor Yellow
    }

    Write-Host "`nToutes les données d'avancement ont été supprimées avec succès!" -ForegroundColor Green
    Write-Host "Les cours, chapitres, quiz et questions sont conservés." -ForegroundColor Cyan

    $connection.Close()
}
catch {
    Write-Host "Erreur: $_" -ForegroundColor Red
    if ($connection.State -eq 'Open') {
        $connection.Close()
    }
}
