# Guide de Démarrage Rapide - Notifications

## ⚡ Démarrage en 5 minutes

### 1. **Démarrer le Backend** (Terminal 1)
```bash
cd Back/LearningApp
dotnet run
```
✓ Vérifiez: `https://localhost:7121` est accessible

### 2. **Démarrer l'App Admin** (Terminal 2)
```bash
cd Front/Learning-app-v3
npm run dev
```
✓ Ouvre: `http://localhost:5173`

### 3. **Démarrer l'App Étudiant** (Terminal 3)
```bash
cd Front/Learning-app-v3-student
npm run dev
```
✓ Ouvre: `http://localhost:5174`

### 4. **Créer des Notifications de Test**
```bash
# PowerShell (Windows)
.\create-test-notifications.ps1 -Token "YOUR_JWT_TOKEN" -UserId 1

# Ou via cURL
curl -X POST https://localhost:7121/api/notifications \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "type": "COURSE_UPDATE",
    "title": "Test",
    "message": "Ceci est une notification de test",
    "priority": 1
  }'
```

### 5. **Vérifier dans le Frontend**
- **Admin**: Cliquez sur la cloche 🔔 dans le header
- **Student**: Cliquez sur la cloche 🔔 dans le header

---

## 🎯 URLs Principales

| Page | Admin | Student |
|------|-------|---------|
| Dashboard | http://localhost:5173 | http://localhost:5174 |
| Notifications | http://localhost:5173/notifications | http://localhost:5174/notifications |

---

## 🧪 Test Rapide (2 minutes)

### Checklist minimale:
```
□ Backend API répond
□ Frontend admin charge
□ Frontend student charge
□ Cloche visible dans le header admin
□ Cloche visible dans le header student
□ Créer une notification
□ Badge cloche mis à jour
□ Page /notifications charge
□ Notification visible dans la liste
□ Marquer comme lue fonctionne
□ Supprimer fonctionne
```

---

## 🔐 Obtenir le JWT Token

### Méthode 1: Via Login (Frontend)
1. Allez à `http://localhost:5173` ou `http://localhost:5174`
2. Connectez-vous avec un compte valide
3. Ouvrez DevTools (F12)
4. Onglet Console:
```javascript
console.log(localStorage.getItem('authToken'))
```
5. Copier le token

### Méthode 2: Via API
```bash
curl -X POST https://localhost:7121/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password"
  }'
```

### Méthode 3: REST Client (VS Code)
1. Installez l'extension "REST Client"
2. Éditez `test-notifications.http`
3. Remplacez `YOUR_JWT_TOKEN_HERE` par votre token
4. Cliquez "Send Request"

---

## 🚀 Premier Test Complet

### 1. Connectez-vous (Admin)
```
- Allez à http://localhost:5173
- Email: admin@example.com
- Mot de passe: ****
- Cliquez Login
```

### 2. Créez une notification
```powershell
$token = "VOTRE_TOKEN_ICI"
.\create-test-notifications.ps1 -Token $token -UserId 1
```

### 3. Vérifiez dans l'Admin
```
- Regardez la cloche 🔔 dans le header
- Vous devez voir un badge rouge avec le nombre
- Cliquez sur la cloche
- Vérifiez le dropdown
- Cliquez "View all notifications"
- Vérifiez la page complète
```

### 4. Testez les actions
```
- Marquez comme lue: ✓
- Supprimez: 🗑️
- Recherchez: Tapez du texte
- Filtrez par type: Sélectionnez un type
- Filtrez par statut: Sélectionnez Lues/Non-lues
```

### 5. Testez dans l'Étudiant
```
- Allez à http://localhost:5174
- Connectez-vous avec un compte étudiant
- Les mêmes notifications doivent être visibles
- Vérifiez le même comportement
```

---

## ⚙️ Configuration des URLs

Si les ports sont différents, modifier:

**Admin App** (`.env`)
```
VITE_API_URL=https://localhost:7121/api
```

**Student App** (`.env`)
```
VITE_API_URL=https://localhost:7121/api
```

---

## 🐛 Dépannage Rapide

### La cloche n'apparaît pas
```
1. Vérifiez que vous êtes connecté
2. Ouvrez la console (F12)
3. Vérifiez localStorage:
   console.log(localStorage.getItem('userId'))
   console.log(localStorage.getItem('authToken'))
4. Si vide: reconnectez-vous
```

### Les notifications ne chargent pas
```
1. Vérifiez que le backend est en cours d'exécution
2. Ouvrez DevTools > Network > Filtre "notifications"
3. Vérifiez la réponse HTTP (200, 401, 500?)
4. Si 401: token expiré, reconnectez-vous
5. Si 500: problème backend
```

### Erreur CORS
```
1. Le backend doit accepter les requêtes depuis localhost:5173/5174
2. Vérifiez la configuration CORS dans Program.cs
3. Doit inclure les headers Authorization
```

### Pas de badges/compteurs mis à jour
```
1. Le polling est 30 secondes
2. Attendez 30 secondes ou actualisez F5
3. Ouvrez Console > Allez à Network
4. Vous devez voir des GET /api/notifications/user/1/unread-count
```

---

## 📝 Notes Importantes

1. **Authentification**: Toutes les requêtes nécessitent un JWT valide
2. **UserId**: Les notifications sont filtrées par userId
3. **Polling**: Auto-refresh toutes les 30 secondes
4. **Stockage**: Utilise localStorage pour le token et userId
5. **Responsive**: Testé sur desktop et mobile

---

## 🔗 Ressources

- **Documentation complète**: [NOTIFICATIONS.md](./NOTIFICATIONS.md)
- **Guide de test détaillé**: [TESTING_NOTIFICATIONS.md](./TESTING_NOTIFICATIONS.md)
- **Fichier HTTP**: [test-notifications.http](./test-notifications.http)
- **Script PowerShell**: [create-test-notifications.ps1](./create-test-notifications.ps1)

---

## ✅ Succès

Quand tout fonctionne:
- ✓ Badge rouge avec compteur dans le header
- ✓ Dropdown avec les 5 dernières notifications
- ✓ Page complète avec pagination et filtres
- ✓ Actions (marquer lue, supprimer) fonctionnent
- ✓ Couleurs distinctes pour chaque type
- ✓ Responsive sur mobile

---

**Bon testing! 🎉**
