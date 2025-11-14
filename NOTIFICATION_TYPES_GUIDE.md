# Guide Complet des Types de Notifications

## 📋 Les 7 Types de Notifications

### 1. **COURSE_UPDATE** 🔵 Bleu
**Contexte**: Quand un nouveau contenu est ajouté à un cours

**Description**:
- Utilisé pour informer les étudiants des mises à jour de cours
- Nouveaux chapitres, ressources, ou modifications de contenu

**Exemple**:
```json
{
  "userId": 1,
  "type": "COURSE_UPDATE",
  "title": "Nouveau contenu disponible",
  "message": "Un nouveau chapitre a été ajouté au cours 'React Avancé'",
  "priority": 1,
  "actionUrl": "/courses/1"
}
```

**Qui reçoit**:
- ✅ Étudiants inscrits au cours
- ❌ Admin (sauf si configuré)

**Action suggérée**: Cliquer pour voir le nouveau contenu

---

### 2. **ENROLLMENT_CONFIRMATION** 🟢 Vert
**Contexte**: Confirmation d'inscription à un cours

**Description**:
- Confirmation quand un étudiant s'inscrit à un cours
- Confirmation de succès d'inscription

**Exemple**:
```json
{
  "userId": 1,
  "type": "ENROLLMENT_CONFIRMATION",
  "title": "Inscription confirmée",
  "message": "Vous êtes maintenant inscrit au cours 'Python Avancé'",
  "priority": 0,
  "actionUrl": "/my-courses"
}
```

**Qui reçoit**:
- ✅ Étudiants nouvellement inscrits
- ✅ Admin (pour tracking)

**Action suggérée**: Accéder aux cours inscrits

---

### 3. **QUIZ_REMINDER** 🟠 Orange
**Contexte**: Rappel de quiz en attente

**Description**:
- Rappel pour un quiz non complété
- Dates limites approchant
- Nouveau quiz disponible

**Exemple**:
```json
{
  "userId": 1,
  "type": "QUIZ_REMINDER",
  "title": "Quiz en attente",
  "message": "Vous avez un quiz à compléter: TypeScript Basics",
  "priority": 2,
  "actionUrl": "/quiz/5"
}
```

**Qui reçoit**:
- ✅ Étudiants avec quiz en attente
- ✅ Admin (pour suivi)

**Action suggérée**: Accéder au quiz pour le compléter

---

### 4. **GRADE_RECEIVED** 🟣 Violet
**Contexte**: Notification de note reçue

**Description**:
- Quand un quiz est noté
- Quand un projet reçoit une évaluation
- Résultats d'examen

**Exemple**:
```json
{
  "userId": 1,
  "type": "GRADE_RECEIVED",
  "title": "Note reçue",
  "message": "Votre note pour le quiz 'JavaScript Fundamentals' est de 85/100",
  "priority": 1,
  "actionUrl": "/quiz/3/results/1"
}
```

**Qui reçoit**:
- ✅ Étudiants notés
- ✅ Admin (pour audit)

**Action suggérée**: Voir les résultats et le feedback

---

### 5. **PROJECT_FEEDBACK** 🔵 Cyan
**Contexte**: Feedback sur un mini-projet

**Description**:
- Retour de l'instructeur sur un projet
- Commentaires sur un mini-projet soumis
- Demande de révision

**Exemple**:
```json
{
  "userId": 1,
  "type": "PROJECT_FEEDBACK",
  "title": "Retour sur votre mini-projet",
  "message": "Votre enseignant a laissé des commentaires sur 'Todo App React'",
  "priority": 2,
  "actionUrl": "/mini-projects/2"
}
```

**Qui reçoit**:
- ✅ Étudiants ayant soumis un projet
- ✅ Admin (pour suivi)

**Action suggérée**: Voir le feedback détaillé

---

### 6. **ADMIN_MESSAGE** 🟦 Indigo
**Contexte**: Message administrateur

**Description**:
- Annonces importantes
- Maintenances programmées
- Informations importantes pour tous les utilisateurs

**Exemple**:
```json
{
  "userId": 1,
  "type": "ADMIN_MESSAGE",
  "title": "Message de l'administrateur",
  "message": "La plateforme sera en maintenance le 15 janvier de 22h à 23h",
  "priority": 2,
  "actionUrl": "/dashboard"
}
```

**Qui reçoit**:
- ✅ Tous les utilisateurs (Admin et Étudiants)
- ✅ Priorité haute

**Action suggérée**: Lire l'annonce importante

---

### 7. **SYSTEM_ALERT** 🔴 Rouge
**Contexte**: Alertes système critiques

**Description**:
- Erreurs système
- Expiration de session
- Problèmes de sécurité
- Avertissements urgents

**Exemple**:
```json
{
  "userId": 1,
  "type": "SYSTEM_ALERT",
  "title": "Alerte système",
  "message": "Votre session va expirer dans 5 minutes",
  "priority": 3,
  "actionUrl": "/profile"
}
```

**Qui reçoit**:
- ✅ Utilisateurs concernés (Admin ou Étudiant)
- ✅ Urgence maximale

**Action suggérée**: Action immédiate requise

---

## 🎨 Tableau Récapitulatif

| Type | Couleur | Icône | Priorité | Destinataires |
|------|---------|-------|----------|---|
| COURSE_UPDATE | 🔵 Bleu | 📧 | Basse | Étudiants |
| ENROLLMENT_CONFIRMATION | 🟢 Vert | 📧 | Très Basse | Étudiants + Admin |
| QUIZ_REMINDER | 🟠 Orange | 📧 | Haute | Étudiants + Admin |
| GRADE_RECEIVED | 🟣 Violet | 🏆 | Moyenne | Étudiants + Admin |
| PROJECT_FEEDBACK | 🔵 Cyan | 📧 | Haute | Étudiants + Admin |
| ADMIN_MESSAGE | 🟦 Indigo | 📧 | Haute | Tous |
| SYSTEM_ALERT | 🔴 Rouge | ⚠️ | URGENTE | Concernés |

---

## 🧪 Comment Tester Chaque Type

### **Test 1: COURSE_UPDATE**

#### Admin:
```bash
curl -X POST https://localhost:7121/api/notifications \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 2,
    "type": "COURSE_UPDATE",
    "title": "Nouveau chapitre: TypeScript Avancé",
    "message": "Un nouveau chapitre a été ajouté au cours React Avancé",
    "priority": 1,
    "actionUrl": "/courses/1"
  }'
```

#### Vérification (Étudiant):
1. Allez à `http://localhost:5174`
2. Regardez la cloche 🔔
3. Doit apparaître en **BLEU**
4. Message: "Nouveau chapitre: TypeScript Avancé"

---

### **Test 2: ENROLLMENT_CONFIRMATION**

#### Admin:
```bash
curl -X POST https://localhost:7121/api/notifications \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 2,
    "type": "ENROLLMENT_CONFIRMATION",
    "title": "Inscription confirmée",
    "message": "Vous êtes maintenant inscrit au cours Python Avancé",
    "priority": 0,
    "actionUrl": "/my-courses"
  }'
```

#### Vérification (Étudiant):
1. Allez à `http://localhost:5174`
2. Cloche 🔔 affiche la notification
3. Badge **VERT**
4. Cliquez → Va vers `/my-courses`

---

### **Test 3: QUIZ_REMINDER**

#### Admin:
```bash
curl -X POST https://localhost:7121/api/notifications \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 2,
    "type": "QUIZ_REMINDER",
    "title": "Quiz en attente",
    "message": "Vous avez un quiz à compléter: TypeScript Basics (Date limite: 25 Jan)",
    "priority": 2,
    "actionUrl": "/quiz/5"
  }'
```

#### Vérification (Étudiant):
1. Notification en **ORANGE**
2. Priorité: **HIGH**
3. Cliquez → Accès au quiz

---

### **Test 4: GRADE_RECEIVED**

#### Admin:
```bash
curl -X POST https://localhost:7121/api/notifications \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 2,
    "type": "GRADE_RECEIVED",
    "title": "Note reçue",
    "message": "Votre note pour le quiz JavaScript Fundamentals: 85/100 ✓",
    "priority": 1,
    "actionUrl": "/quiz/3/results/1"
  }'
```

#### Vérification (Étudiant):
1. Notification en **VIOLET**
2. Icône: 🏆
3. Cliquez → Voir les résultats détaillés

---

### **Test 5: PROJECT_FEEDBACK**

#### Admin:
```bash
curl -X POST https://localhost:7121/api/notifications \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 2,
    "type": "PROJECT_FEEDBACK",
    "title": "Retour sur votre mini-projet",
    "message": "Votre enseignant a laissé 3 commentaires sur Todo App React",
    "priority": 2,
    "actionUrl": "/mini-projects/2"
  }'
```

#### Vérification (Étudiant):
1. Notification en **CYAN**
2. Priorité: **HIGH**
3. Cliquez → Voir le feedback

---

### **Test 6: ADMIN_MESSAGE**

#### Admin:
```bash
curl -X POST https://localhost:7121/api/notifications \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "type": "ADMIN_MESSAGE",
    "title": "Maintenance programmée",
    "message": "La plateforme sera en maintenance le 15 janvier de 22h à 23h. Service rétabli le 16 janvier.",
    "priority": 2,
    "actionUrl": "/dashboard"
  }'
```

#### Vérification (Admin + Étudiant):
1. Notification en **INDIGO**
2. **LES DEUX VOIENT** la notification
3. Admin: `http://localhost:5173` 🔔
4. Étudiant: `http://localhost:5174` 🔔

---

### **Test 7: SYSTEM_ALERT (URGENT)**

#### Admin:
```bash
curl -X POST https://localhost:7121/api/notifications \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 2,
    "type": "SYSTEM_ALERT",
    "title": "⚠️ Alerte de sécurité",
    "message": "Activité suspecte détectée. Veuillez vérifier votre compte.",
    "priority": 3,
    "actionUrl": "/profile"
  }'
```

#### Vérification (Étudiant):
1. Notification en **ROUGE** 🔴
2. Priorité: **URGENT**
3. Badge "New" bien visible
4. Icône: ⚠️

---

## 🚀 Test Complet (Créer Tous les Types)

### **Script PowerShell Complet**:

```powershell
$baseUrl = "https://localhost:7121/api"
$adminToken = "YOUR_ADMIN_TOKEN"
$studentUserId = 2

$notifications = @(
    @{
        type = "COURSE_UPDATE"
        title = "Nouveau chapitre disponible"
        message = "React Hooks - Partie 2"
        priority = 1
    },
    @{
        type = "ENROLLMENT_CONFIRMATION"
        title = "Inscription confirmée"
        message = "Vous êtes inscrit à Python Avancé"
        priority = 0
    },
    @{
        type = "QUIZ_REMINDER"
        title = "Quiz en attente"
        message = "TypeScript Basics - Date limite: 25 janvier"
        priority = 2
    },
    @{
        type = "GRADE_RECEIVED"
        title = "Note reçue"
        message = "JavaScript Fundamentals: 85/100"
        priority = 1
    },
    @{
        type = "PROJECT_FEEDBACK"
        title = "Retour du professeur"
        message = "3 commentaires sur Todo App React"
        priority = 2
    },
    @{
        type = "ADMIN_MESSAGE"
        title = "Maintenance programmée"
        message = "Plateforme en maintenance le 15 janvier 22h-23h"
        priority = 2
    },
    @{
        type = "SYSTEM_ALERT"
        title = "Alerte de sécurité"
        message = "Activité suspecte détectée"
        priority = 3
    }
)

$headers = @{
    "Authorization" = "Bearer $adminToken"
    "Content-Type" = "application/json"
}

foreach ($notif in $notifications) {
    $body = @{
        userId = $studentUserId
        type = $notif.type
        title = $notif.title
        message = $notif.message
        priority = $notif.priority
        actionUrl = "/dashboard"
    } | ConvertTo-Json

    Invoke-RestMethod -Uri "$baseUrl/notifications" `
        -Method POST `
        -Headers $headers `
        -Body $body

    Write-Host "✓ Created: $($notif.type)" -ForegroundColor Green
    Start-Sleep -Milliseconds 200
}
```

---

## 🧪 Checklist de Test par Type

### ✅ COURSE_UPDATE
- [ ] Créer la notification via API
- [ ] Vérifier la couleur: BLEU
- [ ] Vérifier l'icône: 📧
- [ ] Vérifier le message
- [ ] Cliquer: Va vers `/courses/1`
- [ ] Marquer comme lue fonctionne
- [ ] Supprimer fonctionne
- [ ] Visible seulement pour l'étudiant

### ✅ ENROLLMENT_CONFIRMATION
- [ ] Créer la notification via API
- [ ] Vérifier la couleur: VERT
- [ ] Vérifier la priorité: LOW (0)
- [ ] Cliquer: Va vers `/my-courses`
- [ ] Filtrer par type fonctionne
- [ ] Pagination fonctionne

### ✅ QUIZ_REMINDER
- [ ] Créer la notification via API
- [ ] Vérifier la couleur: ORANGE
- [ ] Vérifier la priorité: HIGH (2)
- [ ] Cliquer: Va vers `/quiz/5`
- [ ] Badge "High Priority" visible
- [ ] Recherche trouve cette notification

### ✅ GRADE_RECEIVED
- [ ] Créer la notification via API
- [ ] Vérifier la couleur: VIOLET
- [ ] Vérifier l'icône: 🏆
- [ ] Message affiche la note
- [ ] Cliquer: Accès aux résultats
- [ ] Format de la notification lisible

### ✅ PROJECT_FEEDBACK
- [ ] Créer la notification via API
- [ ] Vérifier la couleur: CYAN
- [ ] Vérifier la priorité: HIGH
- [ ] Message affiche le projet
- [ ] Cliquer: Va vers `/mini-projects/2`
- [ ] Distinction visuelle claire

### ✅ ADMIN_MESSAGE
- [ ] Créer la notification via API
- [ ] Vérifier la couleur: INDIGO
- [ ] Visible chez l'admin
- [ ] Visible chez l'étudiant
- [ ] Message d'annonce lisible
- [ ] Cliquer: Va vers `/dashboard`

### ✅ SYSTEM_ALERT
- [ ] Créer la notification via API
- [ ] Vérifier la couleur: ROUGE 🔴
- [ ] Vérifier la priorité: URGENT (3)
- [ ] Icône: ⚠️
- [ ] Badge bien visible
- [ ] Message alerte clair
- [ ] Cliquer: Accès au profil

---

## 📊 Test de Filtrage

Pour chaque type, testez:

1. **Dropdown** (5 dernières):
   - Cliquez cloche 🔔
   - Vérifiez que le type apparaît

2. **Page complète** (`/notifications`):
   - Filtrer par type
   - Vérifier que SEUL ce type s'affiche
   - Combiner filtres
   - Rechercher par titre

3. **Statut**:
   - Marquer comme lue
   - Badge "New" disparaît
   - Filtre "Read" l'affiche
   - Filtre "Unread" le cache

---

## 🎯 Test Intégration (Admin → Étudiant)

### Scénario 1: Admin envoie COURSE_UPDATE
```
1. Admin connecté: http://localhost:5173
2. Créer notification COURSE_UPDATE pour userid=2
3. Ouvrir nouvel onglet: http://localhost:5174 (Étudiant userid=2)
4. Vérifier que la notification apparaît
5. Vérifier que l'admin ne reçoit pas
6. Marquer comme lue: Doit disparaître du badge
7. Rafraîchir: Doit rester marquée
```

### Scénario 2: Admin envoie ADMIN_MESSAGE
```
1. Admin: Créer notification ADMIN_MESSAGE
2. Vérifier qu'elle apparaît chez l'ADMIN
3. Vérifier qu'elle apparaît chez l'ÉTUDIANT
4. Les deux voient la même notification
5. Chacun peut la marquer indépendamment
```

### Scénario 3: Filtrer par Type
```
1. Créer les 7 types de notifications
2. Aller à /notifications
3. Dropdown: "Filter by type"
4. Sélectionner QUIZ_REMINDER
5. Vérifier que SEUL QUIZ_REMINDER s'affiche
6. Combiner avec recherche textuelle
7. Combiner avec filtre statut
```

---

## 🎨 Vérifier les Couleurs

Chaque type doit avoir sa couleur distinctive:

**ADMIN**: http://localhost:5173/notifications
```
✓ COURSE_UPDATE → 🔵 Bleu
✓ ENROLLMENT_CONFIRMATION → 🟢 Vert
✓ QUIZ_REMINDER → 🟠 Orange
✓ GRADE_RECEIVED → 🟣 Violet
✓ PROJECT_FEEDBACK → 🔵 Cyan
✓ ADMIN_MESSAGE → 🟦 Indigo
✓ SYSTEM_ALERT → 🔴 Rouge
```

**ÉTUDIANT**: http://localhost:5174/notifications
```
Même chose!
```

---

## 🔍 Débogage

### Vérifier les réceptions:
```javascript
// Console (F12)
import { useNotificationStore } from '/store/notificationStore';
const store = useNotificationStore();
console.log(store.notifications);
// Affiche toutes les notifications
```

### Vérifier le filtrage:
```javascript
const store = useNotificationStore();
console.log(store.notifications.filter(n => n.type === 'QUIZ_REMINDER'));
// Affiche seulement QUIZ_REMINDER
```

### Vérifier les actions:
```javascript
const store = useNotificationStore();
await store.markAsRead(1); // Marque notification ID 1 comme lue
await store.deleteNotification(1); // Supprime
```

---

## ✨ Résumé

| Type | Couleur | Qui reçoit | Action | Priorité |
|------|---------|-----------|--------|----------|
| COURSE_UPDATE | 🔵 | Étudiants | Voir cours | Basse |
| ENROLLMENT_CONFIRMATION | 🟢 | Étudiants + Admin | Voir mes cours | Très basse |
| QUIZ_REMINDER | 🟠 | Étudiants + Admin | Faire quiz | Haute |
| GRADE_RECEIVED | 🟣 | Étudiants + Admin | Voir résultats | Moyenne |
| PROJECT_FEEDBACK | 🔵 | Étudiants + Admin | Voir feedback | Haute |
| ADMIN_MESSAGE | 🟦 | TOUS | Voir annonce | Haute |
| SYSTEM_ALERT | 🔴 | Concernés | Action urgente | URGENTE |

---

**Bon testing! 🎉**
