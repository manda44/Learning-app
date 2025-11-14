# Guide de Test des Notifications

## 🚀 Prérequis

1. **Backend API en cours d'exécution** sur `https://localhost:7121`
   ```bash
   cd Back/LearningApp
   dotnet run
   ```

2. **Applications Frontend en cours d'exécution**
   ```bash
   # Terminal 1 - Admin App
   cd Front/Learning-app-v3
   npm run dev

   # Terminal 2 - Student App
   cd Front/Learning-app-v3-student
   npm run dev
   ```

3. **Authentification** - Connecté avec un compte valide

## 📋 Points de Test

### 1. **Cloche de Notifications (Header)**

#### Admin App
- **URL**: `http://localhost:5173`
- **Localisation**: Icône cloche dans le header (à côté du toggle thème)

#### Student App
- **URL**: `http://localhost:5174`
- **Localisation**: Icône cloche dans le header

#### Tests à effectuer:
```
✓ L'icône cloche s'affiche dans le header
✓ Un badge rouge avec le compte de notifications non-lues apparaît
✓ Le badge affiche "99+" si > 99 notifications
✓ Cliquer sur la cloche ouvre un popover
✓ Le popover affiche les 5 dernières notifications
✓ Un bouton "View all notifications" est présent au bas du popover
✓ Le compteur se met à jour automatiquement (polling 30s)
```

### 2. **Dropdown des Notifications**

#### Tests du popover:
```
✓ Titre "Notifications" en haut
✓ Liste des 5 dernières notifications
✓ Chaque notification affiche:
  - Icône colorée selon le type
  - Titre de la notification
  - Message
  - Date relative (ex: "il y a 2 heures")
  - Badge "New" pour les non-lues (bleu)
  - Niveau de priorité (Low, Medium, High, Urgent)

✓ Actions sur chaque notification:
  - Bouton marquer comme lu (✓)
  - Bouton supprimer (🗑️)

✓ Bouton "Mark all as read" pour marquer toutes comme lues
✓ Message "No notifications yet" si aucune notification
✓ Loading spinner pendant le chargement
```

### 3. **Page Notifications Complète**

#### Accès à la page:
```
Admin:   http://localhost:5173/notifications
Student: http://localhost:5174/notifications
```

#### Tests de la page:
```
✓ Titre "Notifications" ou "My Notifications"
✓ Compteur du nombre total de notifications
✓ Bouton "Mark all as read (X)" affiche le nombre de non-lues

✓ Panneau de filtrage avec:
  - Champ de recherche textuelle
  - Dropdown "Filter by type" (tous les types)
  - Dropdown "Filter by status" (Unread/Read)
  - Bouton "Clear filters"

✓ Liste paginée (10 notifications par page)
✓ Pagination affichée si > 10 notifications
✓ Chaque notification affiche les mêmes infos que le dropdown

✓ Actions sur les notifications:
  - Marquer comme lu
  - Supprimer
  - Cliquer pour naviguer (si actionUrl)

✓ Filtres fonctionnent correctement:
  - Recherche filtre par titre et message
  - Type filtre par type de notification
  - Status filtre lues/non-lues
  - Les filtres peuvent être combinés
```

### 4. **Types de Notifications Visibles**

Chaque type doit avoir une couleur distincte:

```
Type                        Couleur    Icône
─────────────────────────────────────────────
COURSE_UPDATE              Bleu       📧
ENROLLMENT_CONFIRMATION    Vert       📧
QUIZ_REMINDER             Orange      📧
GRADE_RECEIVED            Violet      🏆
PROJECT_FEEDBACK          Cyan        📧
ADMIN_MESSAGE             Indigo      📧
SYSTEM_ALERT              Rouge       ⚠️
```

### 5. **Test de Création de Notifications (Backend)**

#### Via Postman/cURL:

```bash
# 1. Authentifiez-vous et obtenez le token

# 2. Créez une notification de test
POST https://localhost:7121/api/notifications
Authorization: Bearer {TOKEN}
Content-Type: application/json

{
  "userId": 1,
  "type": "COURSE_UPDATE",
  "title": "Test Notification",
  "message": "Ceci est une notification de test",
  "priority": 1,
  "actionUrl": "/dashboard"
}

# 3. Vérifiez qu'elle apparaît dans le frontend
```

### 6. **Test des Opérations CRUD**

#### Via DevTools (Console):

```javascript
// 1. Accédez au store Zustand
const { useNotificationStore } = await import('../../store/notificationStore');
const store = useNotificationStore();

// 2. Consultez l'état actuel
console.log('Notifications:', store.notifications);
console.log('Unread count:', store.unreadCount);

// 3. Déclenchez une action
await store.fetchNotifications(1); // Récupère les notifications de l'utilisateur 1
await store.markAsRead(notificationId); // Marque comme lue
await store.markAllAsRead(1); // Marque toutes comme lues
await store.deleteNotification(notificationId); // Supprime
```

### 7. **Test des Performances**

```
✓ Le dropdown s'ouvre en < 1s
✓ La page notifications charge en < 2s
✓ Pas de lag lors du scroll
✓ Marquer comme lu répond en < 500ms
✓ Le polling 30s fonctionne en arrière-plan
✓ Pas de crash avec 1000+ notifications
```

### 8. **Test Responsive**

#### Sur mobile (DevTools):
```
✓ La cloche reste visible
✓ Le dropdown se positionne correctement
✓ Le texte ne déborde pas
✓ Les boutons sont tactiles (min 44px)
✓ La pagination s'affiche correctement
✓ Les filtres sont accessibles
```

### 9. **Test d'Authentification**

```
✓ Les notifications non autorisées affichent une erreur
✓ Le token Bearer est correctement envoyé
✓ Pas d'accès aux notifications d'autres utilisateurs
✓ Token expiré = redirection login
```

### 10. **Test d'Intégration avec les autres pages**

```
✓ Navigation vers /notifications par la cloche
✓ Breadcrumb correct: Dashboard > Notifications
✓ Retour vers la page précédente fonctionne
✓ Menu sidebar active sur Notifications
```

## 🧪 Scénarios de Test Complets

### Scénario 1: Flux de base
```
1. Connectez-vous (Admin ou Student)
2. Vérifiez que la cloche apparaît avec le badge
3. Cliquez sur la cloche
4. Vérifiez le dropdown
5. Cliquez "View all notifications"
6. Vérifiez la page complète
7. Cliquez sur une notification
8. Vérifiez qu'elle est marquée comme lue
```

### Scénario 2: Filtrage et recherche
```
1. Allez à /notifications
2. Recherchez un mot-clé
3. Vérifiez les résultats
4. Ajoutez un filtre par type
5. Ajoutez un filtre par statut
6. Combinez les filtres
7. Cliquez "Clear filters"
8. Vérifiez que tous les filtres sont réinitialisés
```

### Scénario 3: Gestion des notifications
```
1. Ouvrez le dropdown
2. Cliquez "Mark all as read"
3. Vérifiez que le badge disparaît
4. Allez à /notifications
5. Supprimez une notification
6. Vérifiez qu'elle disparaît de la liste
7. Actualisez la page
8. Vérifiez que la suppression persiste
```

### Scénario 4: Notifications en temps réel
```
1. Ouvrez deux navigateurs (Admin et Student)
2. Crééz une notification depuis le backend
3. Admin: Vérifiez qu'elle apparaît dans le dropdown
4. Attendez 30s (polling)
5. Student: Vérifiez qu'elle apparaît
6. Admin: Supprimez-la
7. Vérifiez qu'elle disparaît dans Student
```

## 🐛 Débogage

### Vérifier les appels API

1. **Ouvrez DevTools** (F12)
2. **Allez à l'onglet Network**
3. **Filtrez par "notifications"**
4. **Vérifiez les requêtes**:
   ```
   GET  /api/notifications/user/1
   GET  /api/notifications/user/1/unread-count
   PUT  /api/notifications/1/mark-as-read
   DELETE /api/notifications/1
   ```

### Vérifier le Store Zustand

```javascript
// Console Browser
// Admin App
import { useNotificationStore } from '/Front/Learning-app-v3/store/notificationStore';
const store = useNotificationStore();
console.log(store.getState());

// Student App
import { useNotificationStore } from '/Front/Learning-app-v3-student/src/store/notificationStore';
const store = useNotificationStore();
console.log(store.getState());
```

### Logs des erreurs

```javascript
// Dans le store, regardez les erreurs
const store = useNotificationStore();
console.log('Erreur:', store.error);
```

### Vérifier l'authentification

```javascript
// Vérifiez le token
console.log('Token:', localStorage.getItem('authToken'));
console.log('UserId:', localStorage.getItem('userId'));
```

## ✅ Checklist de Test

### Interface UI
- [ ] Cloche visible dans le header
- [ ] Badge rouge avec compteur
- [ ] Dropdown s'ouvre/ferme correctement
- [ ] Page notifications charge
- [ ] Filtres fonctionnent
- [ ] Pagination fonctionne
- [ ] Responsive design OK

### Fonctionnalités
- [ ] Fetch notifications
- [ ] Mark as read (individual)
- [ ] Mark all as read
- [ ] Delete notification
- [ ] Search/filter
- [ ] Pagination
- [ ] Auto-refresh (polling)

### Performance
- [ ] < 1s pour ouvrir dropdown
- [ ] < 2s pour charger la page
- [ ] Pas de lag
- [ ] Pas de crash
- [ ] Memory leak check

### Sécurité
- [ ] Token authentification
- [ ] Pas d'accès non autorisé
- [ ] XSS protection
- [ ] CSRF protection

### Cross-browser
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] Mobile (iOS/Android)

## 📞 Commandes Utiles

```bash
# Vérifier les logs du backend
dotnet run --project Back/LearningApp

# Compiler le TypeScript
npm run build

# Démarrer en dev mode
npm run dev

# Vérifier les types TypeScript
npm run type-check

# Nettoyer les caches
rm -rf node_modules/.vite
npm install
```

## 🎯 Points Clés à Tester

1. **Badge de compteur** - Mis à jour en temps réel
2. **Dropdown notifications** - Affiche les 5 dernières
3. **Page complète** - Liste paginée et filtrable
4. **Actions** - Mark read, delete, navigate
5. **Types** - Chaque type a sa couleur
6. **Recherche** - Filtre par texte
7. **Statut** - Filtre lues/non-lues
8. **Pagination** - 10 items par page
9. **Auto-refresh** - Polling 30s
10. **Responsive** - Mobile, tablet, desktop

---

**Bon testing! 🎉**
