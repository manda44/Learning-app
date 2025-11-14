# Intégration des Notifications - Admin et Étudiant

## 📋 Vue d'ensemble

Les notifications ont été entièrement intégrées côté front pour les deux applications (Admin et Étudiant). Le système utilise l'API backend existante et Zustand pour la gestion d'état.

## 🏗️ Architecture

### Backend API (Déjà existant)
- **Endpoint**: `GET /api/notifications/user/{userId}`
- **Endpoint**: `GET /api/notifications/user/{userId}/unread-count`
- **Endpoint**: `PUT /api/notifications/{id}/mark-as-read`
- **Endpoint**: `PUT /api/notifications/user/{userId}/mark-all-as-read`
- **Endpoint**: `DELETE /api/notifications/{id}`
- **Endpoint**: `GET /api/notifications/preferences/{userId}`
- **Endpoint**: `PUT /api/notifications/preferences/{userId}/{notificationType}`

### Types de Notifications
```typescript
enum NotificationType {
  COURSE_UPDATE = 'COURSE_UPDATE',
  ENROLLMENT_CONFIRMATION = 'ENROLLMENT_CONFIRMATION',
  QUIZ_REMINDER = 'QUIZ_REMINDER',
  GRADE_RECEIVED = 'GRADE_RECEIVED',
  PROJECT_FEEDBACK = 'PROJECT_FEEDBACK',
  ADMIN_MESSAGE = 'ADMIN_MESSAGE',
  SYSTEM_ALERT = 'SYSTEM_ALERT',
}
```

## 📦 Fichiers créés

### Application Admin (`Learning-app-v3`)

#### Services
- `services/notificationService.ts` - Service API pour les appels notifications

#### Types
- `types/notification.ts` - Types TypeScript pour les notifications

#### State Management
- `store/notificationStore.tsx` - Zustand store avec actions

#### Composants
- `components/NotificationBell.tsx` - Cloche de notifications avec dropdown
- `components/NotificationItem.tsx` - Composant d'affichage d'une notification

#### Pages
- `pages/notifications/NotificationsPage.tsx` - Page complète des notifications

#### Modifications
- `layout/MainLayout.tsx` - Intégration de la cloche dans le header
- `src/App.tsx` - Ajout de la route `/notifications`

### Application Étudiant (`Learning-app-v3-student`)

#### Services
- `src/services/notificationService.ts` - Service API

#### Types
- `src/types/notification.ts` - Types TypeScript

#### State Management
- `src/store/notificationStore.ts` - Zustand store

#### Composants
- `src/components/NotificationBell.tsx` - Cloche de notifications
- `src/components/NotificationItem.tsx` - Item de notification

#### Pages
- `src/pages/NotificationsPage.tsx` - Page des notifications

#### Modifications
- `layout/StudentLayout.tsx` - Intégration de la cloche dans le header
- `src/App.tsx` - Mise à jour de la route `/notifications`

## 🎯 Fonctionnalités implémentées

### 1. Cloche de Notifications (NotificationBell)
- Badge rouge avec le nombre de notifications non-lues
- Popover affichant les 5 dernières notifications
- Lien "View all notifications" pour aller à la page complète
- Polling automatique toutes les 30 secondes pour les mises à jour
- Bouton "Mark all as read" pour marquer toutes comme lues

### 2. Page Notifications Complète
- Liste paginée (10 notifications par page)
- Filtrage par:
  - Type de notification
  - Statut (lues/non-lues)
  - Recherche textuelle
- Tri chronologique
- Actions par notification:
  - Marquer comme lue
  - Supprimer
- Compteur du nombre total de notifications

### 3. Item de Notification
- Icône colorée selon le type
- Badge "New" pour les non-lues
- Affichage:
  - Titre
  - Message
  - Date relative (ex: "il y a 2 heures")
  - Niveau de priorité (Low, Medium, High, Urgent)
- Actions:
  - Marquer comme lu
  - Supprimer
  - Clic pour naviguer (si actionUrl existe)

### 4. Gestion d'État (Zustand Store)
```typescript
// État
- notifications: NotificationDto[]
- unreadCount: number
- preferences: NotificationPreferenceDto[]
- isLoading: boolean
- error: string | null

// Actions
- fetchNotifications(userId, unreadOnly?)
- fetchUnreadCount(userId)
- fetchPreferences(userId)
- markAsRead(notificationId)
- markAllAsRead(userId)
- deleteNotification(notificationId)
- updatePreference(userId, type, enabled, method?)
```

## 🚀 Utilisation

### Afficher la cloche dans le header
```typescript
import { NotificationBell } from '../components/NotificationBell';

// Dans le layout
{userId > 0 && <NotificationBell userId={userId} />}
```

### Accéder aux notifications en page complète
- Admin: `http://localhost:5173/notifications`
- Étudiant: `http://localhost:5174/notifications`

### Utiliser le store dans un composant
```typescript
import { useNotificationStore } from '../store/notificationStore';

export function MyComponent() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    deleteNotification,
  } = useNotificationStore();

  // Utiliser les données et fonctions
}
```

## 🎨 Couleurs et Icônes

Les notifications utilisent des couleurs distinctes selon le type:
- **COURSE_UPDATE**: Bleu
- **ENROLLMENT_CONFIRMATION**: Vert
- **QUIZ_REMINDER**: Orange
- **GRADE_RECEIVED**: Violet
- **PROJECT_FEEDBACK**: Cyan
- **ADMIN_MESSAGE**: Indigo
- **SYSTEM_ALERT**: Rouge

## 📱 Responsive Design
- Dropdown adapté aux écrans mobiles
- Pagination pour les listes longues
- Filtres collapsibles sur mobile
- Texte fluide avec ellipsis sur petits écrans

## 🔄 Synchronisation Real-time (Optionnel)

Actuellement, le système utilise le polling (30 secondes).
Pour implémenter SignalR (WebSockets) à l'avenir:

```typescript
// Dans le useEffect du NotificationBell
const setupSignalR = async () => {
  const connection = new HubConnectionBuilder()
    .withUrl('/notificationHub')
    .withAutomaticReconnect()
    .build();

  connection.on('NotificationReceived', (notification) => {
    // Mettre à jour le store
  });

  await connection.start();
};
```

## 🔐 Sécurité

- Authentification requise (token Bearer)
- Les notifications sont filtrées par userId côté backend
- Validation des permissions d'accès
- XSRF protection via Mantine

## 🐛 Debugging

### Logger les notifications
```typescript
const { notifications } = useNotificationStore();
console.log('Notifications:', notifications);
```

### Vérifier les appels API
Utiliser les DevTools du navigateur pour voir:
- `GET /api/notifications/user/{userId}`
- Les erreurs d'authentification
- Les timeouts de requête

## 📝 Notes

1. **Date-fns**: La formatage des dates utilise `date-fns` avec locale française
2. **Mantine Notifications**: Le package est déjà installé mais n'est pas utilisé actuellement (on utilise des composants personnalisés)
3. **Performance**: Le polling peut être remplacé par WebSockets pour une meilleure performance
4. **Préférences**: La page des préférences peut être ajoutée ultérieurement dans les settings

## ✅ Checklist d'intégration

- [x] Service API créé
- [x] Types TypeScript définis
- [x] Zustand store implémenté
- [x] NotificationBell component créé
- [x] NotificationItem component créé
- [x] Page notifications créée
- [x] Intégration MainLayout (Admin)
- [x] Intégration StudentLayout (Étudiant)
- [x] Routes ajoutées aux deux apps
- [x] Tests manuels possibles

## 🚧 Future Enhancements

1. **SignalR WebSockets** pour les notifications en temps réel
2. **Page de Préférences** pour gérer les paramètres de notifications
3. **Notifications par Email** (déjà supporté par le backend)
4. **Notifications par Navigateur** (Web Push API)
5. **Groupement** des notifications par catégorie
6. **Archive** des notifications anciennes
7. **Templates** personnalisables pour les messages

## 📞 Support

Pour toute question ou problème:
1. Vérifier que l'API backend est accessible
2. Vérifier le token d'authentification
3. Consulter les logs du navigateur
4. Vérifier que `userId` est correctement défini
