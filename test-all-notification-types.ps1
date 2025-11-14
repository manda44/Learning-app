# Script pour créer et tester tous les types de notifications
# Usage: .\test-all-notification-types.ps1 -Token "YOUR_JWT_TOKEN" -StudentUserId 2 -AdminUserId 1

param(
    [Parameter(Mandatory=$true)]
    [string]$Token,

    [Parameter(Mandatory=$false)]
    [int]$StudentUserId = 2,

    [Parameter(Mandatory=$false)]
    [int]$AdminUserId = 1,

    [Parameter(Mandatory=$false)]
    [string]$BaseUrl = "https://localhost:7121/api"
)

# Désactiver la vérification SSL
[System.Net.ServicePointManager]::ServerCertificateValidationCallback = {$true}

# Headers
$headers = @{
    "Authorization" = "Bearer $Token"
    "Content-Type" = "application/json"
}

Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║       Testeur de Tous les Types de Notifications          ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "Configuration:" -ForegroundColor Yellow
Write-Host "  Base URL: $BaseUrl" -ForegroundColor Yellow
Write-Host "  Student User ID: $StudentUserId" -ForegroundColor Yellow
Write-Host "  Admin User ID: $AdminUserId" -ForegroundColor Yellow
Write-Host ""

# Définir les notifications par type
$notificationTypes = @(
    @{
        name = "1. COURSE_UPDATE (Bleu 🔵)"
        type = "COURSE_UPDATE"
        userId = $StudentUserId
        title = "Nouveau chapitre disponible"
        message = "Un nouveau chapitre 'Async/Await en Détail' a été ajouté au cours React Avancé"
        priority = 1
        actionUrl = "/courses/1"
        color = "Blue"
    },
    @{
        name = "2. ENROLLMENT_CONFIRMATION (Vert 🟢)"
        type = "ENROLLMENT_CONFIRMATION"
        userId = $StudentUserId
        title = "Inscription confirmée"
        message = "Vous êtes maintenant inscrit au cours 'Python Avancé'. Bienvenue!"
        priority = 0
        actionUrl = "/my-courses"
        color = "Green"
    },
    @{
        name = "3. QUIZ_REMINDER (Orange 🟠)"
        type = "QUIZ_REMINDER"
        userId = $StudentUserId
        title = "Quiz en attente"
        message = "Vous avez 2 quiz à compléter: TypeScript Basics (date limite: 25 jan) et React Hooks (date limite: 28 jan)"
        priority = 2
        actionUrl = "/quiz/5"
        color = "DarkYellow"
    },
    @{
        name = "4. GRADE_RECEIVED (Violet 🟣)"
        type = "GRADE_RECEIVED"
        userId = $StudentUserId
        title = "Note reçue - JavaScript Fundamentals"
        message = "Votre note: 85/100 ✓ Excellente performance! Consultez les détails pour voir les retours du professeur."
        priority = 1
        actionUrl = "/quiz/3/results/1"
        color = "Magenta"
    },
    @{
        name = "5. PROJECT_FEEDBACK (Cyan 🔵)"
        type = "PROJECT_FEEDBACK"
        userId = $StudentUserId
        title = "Retour sur votre mini-projet"
        message = "Votre enseignant a laissé 3 commentaires importants sur votre 'Todo App React'. Points excellents, quelques améliorations suggérées."
        priority = 2
        actionUrl = "/mini-projects/2"
        color = "Cyan"
    },
    @{
        name = "6. ADMIN_MESSAGE (Indigo 🟦)"
        type = "ADMIN_MESSAGE"
        userId = $StudentUserId
        title = "📢 Annonce Importante"
        message = "⚠️ La plateforme subira une maintenance le 15 janvier de 22h00 à 23h30. Service rétabli le 16 janvier matin. Veuillez sauvegarder vos travaux."
        priority = 2
        actionUrl = "/dashboard"
        color = "DarkMagenta"
    },
    @{
        name = "7. SYSTEM_ALERT (Rouge 🔴)"
        type = "SYSTEM_ALERT"
        userId = $StudentUserId
        title = "⚠️ Alerte de Sécurité"
        message = "Activité suspecte détectée sur votre compte depuis une nouvelle localisation. Si ce n'était pas vous, veuillez changer votre mot de passe immédiatement."
        priority = 3
        actionUrl = "/profile"
        color = "Red"
    }
)

Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║          Création des 7 Types de Notifications            ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$createdNotifications = @()
$failedNotifications = @()

foreach ($notif in $notificationTypes) {
    Write-Host "➤ $($notif.name)" -ForegroundColor $notif.color

    $body = @{
        userId = $notif.userId
        type = $notif.type
        title = $notif.title
        message = $notif.message
        priority = $notif.priority
        actionUrl = $notif.actionUrl
    } | ConvertTo-Json

    try {
        $response = Invoke-RestMethod -Uri "$BaseUrl/notifications" `
            -Method POST `
            -Headers $headers `
            -Body $body -ErrorAction Stop

        Write-Host "  ✓ Créée avec succès (ID: $($response.notificationId))" -ForegroundColor Green
        $createdNotifications += @{
            type = $notif.type
            id = $response.notificationId
            color = $notif.color
        }
    }
    catch {
        Write-Host "  ✗ Erreur: $_" -ForegroundColor Red
        $failedNotifications += $notif.type
    }

    Start-Sleep -Milliseconds 300
    Write-Host ""
}

# Résumé de création
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                    Résumé de Création                      ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "Réussies: $($createdNotifications.Count) / 7" -ForegroundColor Green
Write-Host "Échouées: $($failedNotifications.Count) / 7" -ForegroundColor $(if($failedNotifications.Count -eq 0) { "Green" } else { "Red" })
Write-Host ""

if ($failedNotifications.Count -gt 0) {
    Write-Host "Notifications échouées:" -ForegroundColor Red
    $failedNotifications | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
    Write-Host ""
}

# Récupérer les statistiques
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║              Statistiques des Notifications                ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

try {
    # Compteur de non-lues
    $unreadCount = Invoke-RestMethod -Uri "$BaseUrl/notifications/user/$StudentUserId/unread-count" `
        -Method GET `
        -Headers $headers

    Write-Host "Notifications non-lues: $unreadCount" -ForegroundColor Yellow
    Write-Host ""

    # Toutes les notifications
    $allNotifications = Invoke-RestMethod -Uri "$BaseUrl/notifications/user/$StudentUserId" `
        -Method GET `
        -Headers $headers

    Write-Host "Total des notifications: $($allNotifications.Count)" -ForegroundColor Cyan
    Write-Host ""

    # Afficher les 7 créées
    Write-Host "Notifications créées:" -ForegroundColor Yellow
    Write-Host ""

    $createdNotifications | ForEach-Object {
        $notifData = $allNotifications | Where-Object { $_.notificationId -eq $_.id } | Select-Object -First 1
        $status = if ($notifData.isRead) { "✓ Lue" } else { "✗ Non-lue" }

        switch ($_.type) {
            "COURSE_UPDATE" { $emoji = "📧"; $label = "Mise à jour cours" }
            "ENROLLMENT_CONFIRMATION" { $emoji = "📧"; $label = "Inscription" }
            "QUIZ_REMINDER" { $emoji = "📧"; $label = "Rappel quiz" }
            "GRADE_RECEIVED" { $emoji = "🏆"; $label = "Note reçue" }
            "PROJECT_FEEDBACK" { $emoji = "📧"; $label = "Feedback projet" }
            "ADMIN_MESSAGE" { $emoji = "📢"; $label = "Message admin" }
            "SYSTEM_ALERT" { $emoji = "⚠️"; $label = "Alerte système" }
            default { $emoji = "📧"; $label = $_.type }
        }

        Write-Host "$emoji [$($_.type)]" -ForegroundColor $_.color -NoNewline
        Write-Host " - ID: $($_.id)" -ForegroundColor Gray
    }

    Write-Host ""
}
catch {
    Write-Host "Erreur lors de la récupération des statistiques: $_" -ForegroundColor Red
}

# Instructions de test
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                Instructions de Test                       ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "1. 🔔 Vérifier la cloche dans les apps:" -ForegroundColor Cyan
Write-Host "   Admin:     http://localhost:5173" -ForegroundColor Yellow
Write-Host "   Étudiant:  http://localhost:5174" -ForegroundColor Yellow
Write-Host ""
Write-Host "2. 📋 Vérifier la page complète:" -ForegroundColor Cyan
Write-Host "   Admin:     http://localhost:5173/notifications" -ForegroundColor Yellow
Write-Host "   Étudiant:  http://localhost:5174/notifications" -ForegroundColor Yellow
Write-Host ""
Write-Host "3. 🧪 Points à vérifier pour chaque notification:" -ForegroundColor Cyan
Write-Host "   ✓ Couleur correcte" -ForegroundColor Green
Write-Host "   ✓ Icône appropriée" -ForegroundColor Green
Write-Host "   ✓ Titre et message lisibles" -ForegroundColor Green
Write-Host "   ✓ Priorité affichée" -ForegroundColor Green
Write-Host "   ✓ Marquer comme lue fonctionne" -ForegroundColor Green
Write-Host "   ✓ Supprimer fonctionne" -ForegroundColor Green
Write-Host "   ✓ Cliquer navigue vers actionUrl" -ForegroundColor Green
Write-Host ""
Write-Host "4. 🔍 Tests de filtrage:" -ForegroundColor Cyan
Write-Host "   ✓ Filtrer par type" -ForegroundColor Green
Write-Host "   ✓ Filtrer par statut (Lue/Non-lue)" -ForegroundColor Green
Write-Host "   ✓ Rechercher par texte" -ForegroundColor Green
Write-Host "   ✓ Pagination (10 par page)" -ForegroundColor Green
Write-Host ""
Write-Host "5. 🌐 Test Admin vs Étudiant:" -ForegroundColor Cyan
Write-Host "   ADMIN_MESSAGE doit s'afficher chez TOUS" -ForegroundColor Green
Write-Host "   Les autres types seulement chez l'étudiant" -ForegroundColor Green
Write-Host ""

Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                    ✓ Prêt pour le test!                   ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
