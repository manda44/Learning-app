# Script PowerShell pour créer des notifications de test
# Usage: .\create-test-notifications.ps1 -Token "YOUR_JWT_TOKEN" -UserId 1

param(
    [Parameter(Mandatory=$true)]
    [string]$Token,

    [Parameter(Mandatory=$false)]
    [int]$UserId = 1,

    [Parameter(Mandatory=$false)]
    [string]$BaseUrl = "https://localhost:7121/api"
)

# Désactiver la vérification SSL pour localhost
[System.Net.ServicePointManager]::ServerCertificateValidationCallback = {$true}

# Headers
$headers = @{
    "Authorization" = "Bearer $Token"
    "Content-Type" = "application/json"
}

# Fonction pour créer une notification
function Create-Notification {
    param(
        [string]$Type,
        [string]$Title,
        [string]$Message,
        [int]$Priority = 0,
        [string]$ActionUrl = ""
    )

    $body = @{
        userId = $UserId
        type = $Type
        title = $Title
        message = $Message
        priority = $Priority
        actionUrl = $ActionUrl
    } | ConvertTo-Json

    try {
        $response = Invoke-RestMethod -Uri "$BaseUrl/notifications" `
            -Method POST `
            -Headers $headers `
            -Body $body

        Write-Host "✓ Notification '$Title' créée avec succès (ID: $($response.notificationId))" -ForegroundColor Green
        return $response
    }
    catch {
        Write-Host "✗ Erreur lors de la création de '$Title': $_" -ForegroundColor Red
        return $null
    }
}

# Fonction pour récupérer les notifications
function Get-Notifications {
    try {
        $response = Invoke-RestMethod -Uri "$BaseUrl/notifications/user/$UserId" `
            -Method GET `
            -Headers $headers

        Write-Host "✓ Récupération des notifications réussie" -ForegroundColor Green
        return $response
    }
    catch {
        Write-Host "✗ Erreur lors de la récupération: $_" -ForegroundColor Red
        return $null
    }
}

# Fonction pour obtenir le compteur de non-lues
function Get-UnreadCount {
    try {
        $response = Invoke-RestMethod -Uri "$BaseUrl/notifications/user/$UserId/unread-count" `
            -Method GET `
            -Headers $headers

        Write-Host "✓ Compteur de non-lues: $response" -ForegroundColor Green
        return $response
    }
    catch {
        Write-Host "✗ Erreur lors de la récupération du compteur: $_" -ForegroundColor Red
        return $null
    }
}

# Fonction pour marquer comme lue
function Mark-AsRead {
    param([int]$NotificationId)

    try {
        $response = Invoke-RestMethod -Uri "$BaseUrl/notifications/$NotificationId/mark-as-read" `
            -Method PUT `
            -Headers $headers

        Write-Host "✓ Notification $NotificationId marquée comme lue" -ForegroundColor Green
        return $response
    }
    catch {
        Write-Host "✗ Erreur lors du marquage: $_" -ForegroundColor Red
        return $null
    }
}

# Fonction pour supprimer une notification
function Remove-Notification {
    param([int]$NotificationId)

    try {
        Invoke-RestMethod -Uri "$BaseUrl/notifications/$NotificationId" `
            -Method DELETE `
            -Headers $headers

        Write-Host "✓ Notification $NotificationId supprimée" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "✗ Erreur lors de la suppression: $_" -ForegroundColor Red
        return $false
    }
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Script de création de notifications de test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Utilisateur ID: $UserId" -ForegroundColor Yellow
Write-Host "Base URL: $BaseUrl" -ForegroundColor Yellow
Write-Host ""

# Créer des notifications de test
Write-Host "Création de notifications de test..." -ForegroundColor Cyan
Write-Host ""

$notifications = @(
    @{
        Type = "COURSE_UPDATE"
        Title = "Nouveau contenu disponible"
        Message = "Un nouveau chapitre a été ajouté au cours 'React Avancé'"
        Priority = 1
        ActionUrl = "/courses/1"
    },
    @{
        Type = "QUIZ_REMINDER"
        Title = "Quiz en attente"
        Message = "Vous avez un quiz à compléter: TypeScript Basics"
        Priority = 2
        ActionUrl = "/quiz/5"
    },
    @{
        Type = "GRADE_RECEIVED"
        Title = "Note reçue"
        Message = "Votre note pour le quiz 'JavaScript Fundamentals' est de 85/100"
        Priority = 1
        ActionUrl = "/quiz/3/results/1"
    },
    @{
        Type = "PROJECT_FEEDBACK"
        Title = "Retour sur votre mini-projet"
        Message = "Votre enseignant a laissé des commentaires sur 'Todo App React'"
        Priority = 2
        ActionUrl = "/mini-projects/2"
    },
    @{
        Type = "ADMIN_MESSAGE"
        Title = "Message de l'administrateur"
        Message = "La plateforme sera en maintenance le 15 janvier de 22h à 23h"
        Priority = 2
        ActionUrl = "/dashboard"
    },
    @{
        Type = "SYSTEM_ALERT"
        Title = "Alerte système"
        Message = "Votre session va expirer dans 5 minutes"
        Priority = 3
        ActionUrl = "/profile"
    },
    @{
        Type = "ENROLLMENT_CONFIRMATION"
        Title = "Inscription confirmée"
        Message = "Vous êtes maintenant inscrit au cours 'Python Avancé'"
        Priority = 0
        ActionUrl = "/my-courses"
    }
)

$createdNotifications = @()

foreach ($notif in $notifications) {
    $created = Create-Notification `
        -Type $notif.Type `
        -Title $notif.Title `
        -Message $notif.Message `
        -Priority $notif.Priority `
        -ActionUrl $notif.ActionUrl

    if ($created) {
        $createdNotifications += $created
    }

    Start-Sleep -Milliseconds 200
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Résumé" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Notifications créées: $($createdNotifications.Count)" -ForegroundColor Green
Write-Host ""

# Afficher les statistiques
Write-Host "Récupération des statistiques..." -ForegroundColor Cyan
Write-Host ""

Get-UnreadCount
Write-Host ""

Write-Host "Récupération de toutes les notifications..." -ForegroundColor Cyan
$allNotifications = Get-Notifications
if ($allNotifications) {
    Write-Host "Nombre total: $($allNotifications.Count)" -ForegroundColor Green
    Write-Host ""

    $allNotifications | ForEach-Object {
        $status = if ($_.isRead) { "✓ Lue" } else { "✗ Non-lue" }
        Write-Host "$status - [$($_.type)] $($_.title) (ID: $($_.notificationId))" -ForegroundColor Cyan
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Terminé!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Les notifications sont maintenant visibles dans:" -ForegroundColor Yellow
Write-Host "  - Admin: http://localhost:5173" -ForegroundColor Yellow
Write-Host "  - Étudiant: http://localhost:5174" -ForegroundColor Yellow
Write-Host ""
