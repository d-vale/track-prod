# Track - Application Monolithique

Application complète de suivi d'activités combinant backend (Express.js) et frontend (Vue.js) dans une seule structure monolithique, optimisée pour un déploiement facile sur Render.

## 📁 Structure du Projet

```
track-prod/
├── backend/              # Code backend Express.js
│   ├── bin/             # Scripts de démarrage
│   ├── controllers/     # Contrôleurs
│   ├── models/          # Modèles MongoDB
│   ├── routes/          # Routes API
│   ├── websocket/       # Configuration WebSocket
│   └── app.mjs          # Application Express
├── frontend/            # Code frontend Vue.js
│   ├── src/            # Code source Vue
│   ├── public/         # Fichiers publics
│   └── dist/           # Build de production (généré)
├── Dockerfile          # Configuration Docker multi-stage
├── docker-compose.yml  # MongoDB pour développement local
└── package.json        # Scripts root
```

## 🚀 Déploiement sur Render

### Prérequis

1. **Compte Render** : Créez un compte sur [render.com](https://render.com)
2. **MongoDB Atlas** : Créez une base de données gratuite sur [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)

### Étapes de Déploiement

1. **Créer un nouveau Web Service sur Render**
   - Connectez votre repository GitHub
   - Sélectionnez le repo `track-prod`

2. **Configuration du Service**
   - **Name**: `track-prod` (ou votre choix)
   - **Environment**: `Docker`
   - **Region**: Choisissez la plus proche
   - **Branch**: `main`
   - **Dockerfile Path**: `./Dockerfile`

3. **Variables d'Environnement**

   Ajoutez ces variables dans l'onglet "Environment" de Render :

   ```bash
   NODE_ENV=production
   PORT=3000
   DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/track-prod
   SECRET_KEY=votre-cle-secrete-tres-longue-et-complexe
   FRONTEND_URL=https://track-prod.onrender.com

   # Frontend vars (VITE_*)
   VITE_API_BASE_URL=https://track-prod.onrender.com
   VITE_CLOUDINARY_CLOUD_NAME=dqbyulp69
   VITE_CLOUDINARY_UPLOAD_PRESET=Unsigned Preset
   VITE_WS_CHANNEL_NAME=users
   VITE_WS_HOST=track-prod.onrender.com
   VITE_WS_PORT=443
   VITE_WS_PROTOCOL=wss
   VITE_MAPBOX_ACCESS_TOKEN=votre-token-mapbox
   ```

4. **Déployer**
   - Cliquez sur "Create Web Service"
   - Render va automatiquement build et déployer votre application
   - L'URL sera : `https://track-prod.onrender.com` (ou votre nom choisi)

### Configuration MongoDB Atlas

1. Créez un cluster gratuit sur MongoDB Atlas
2. Créez un utilisateur de base de données
3. Ajoutez l'adresse IP `0.0.0.0/0` dans Network Access (pour Render)
4. Copiez la connection string dans `DATABASE_URL`

## 💻 Développement Local

### Installation

```bash
# Cloner le repo
git clone <votre-repo>
cd track-prod

# Installer toutes les dépendances (backend + frontend)
npm run install:all
```

### Configuration Locale

1. **Backend** : Créez `backend/.env`
   ```bash
   NODE_ENV=development
   PORT=3030
   DATABASE_URL=mongodb://localhost:27017/track-dev
   SECRET_KEY=dev-secret-key
   ```

2. **Frontend** : Créez `frontend/.env`
   ```bash
   VITE_API_BASE_URL=http://localhost:3030
   VITE_CLOUDINARY_CLOUD_NAME=dqbyulp69
   VITE_CLOUDINARY_UPLOAD_PRESET=Unsigned Preset
   VITE_WS_CHANNEL_NAME=users
   VITE_WS_HOST=localhost
   VITE_WS_PORT=3030
   VITE_WS_PROTOCOL=ws
   VITE_MAPBOX_ACCESS_TOKEN=votre-token-mapbox
   ```

### Démarrer MongoDB (avec Docker)

```bash
# Démarrer MongoDB
npm run docker:dev

# Arrêter MongoDB
npm run docker:down
```

Ou installez MongoDB localement : [mongodb.com/docs/manual/installation](https://www.mongodb.com/docs/manual/installation/)

### Lancer l'Application

```bash
# Option 1: Lancer backend et frontend ensemble
npm run dev

# Option 2: Lancer séparément (dans 2 terminaux)
npm run dev:backend    # Terminal 1 - http://localhost:3030
npm run dev:frontend   # Terminal 2 - http://localhost:5173
```

### Accès

- **Frontend** : http://localhost:5173
- **Backend API** : http://localhost:3030/api
- **API Documentation** : http://localhost:3030/api-docs

## 🧪 Tests

```bash
# Tests backend
npm run test:backend
```

## 🏗️ Build de Production (Local)

```bash
# Build le frontend
npm run build:frontend

# Le backend servira automatiquement les fichiers statiques
# depuis frontend/dist/ en mode production
```

## 🔧 Comment ça Fonctionne ?

### Architecture Monolithique

En **production** (`NODE_ENV=production`):
1. Le frontend est buildé en fichiers statiques dans `frontend/dist/`
2. Le backend Express sert ces fichiers statiques
3. Les requêtes API sont servies par `/api/*`
4. Toutes les autres requêtes retournent `index.html` (SPA routing)
5. WebSocket fonctionne sur le même serveur HTTP

En **développement** :
- Frontend : Vite dev server sur port 5173 avec HMR
- Backend : Express sur port 3030
- Proxy configuré dans `vite.config.js` pour `/api`

### Dockerfile Multi-Stage

```dockerfile
Stage 1: Build du frontend Vue.js
Stage 2: Backend + fichiers statiques du frontend
```

Cela optimise la taille de l'image finale et le temps de build.

## 📝 Scripts Disponibles

```bash
npm run install:all     # Installer toutes les dépendances
npm run dev             # Démarrer backend + frontend en dev
npm run dev:backend     # Démarrer uniquement le backend
npm run dev:frontend    # Démarrer uniquement le frontend
npm run build:frontend  # Build le frontend pour production
npm start               # Démarrer en production
npm run test:backend    # Lancer les tests backend
npm run docker:dev      # Démarrer MongoDB avec Docker
npm run docker:down     # Arrêter Docker
```

## 🔐 Sécurité

- ⚠️ Ne committez JAMAIS de fichier `.env` avec des secrets
- Utilisez des clés secrètes fortes en production
- Configurez CORS correctement
- Utilisez HTTPS en production (automatique sur Render)

## 🐛 Troubleshooting

### L'app ne démarre pas sur Render

- Vérifiez que toutes les variables d'environnement sont configurées
- Vérifiez les logs de build dans Render
- Assurez-vous que `DATABASE_URL` est correcte

### Problèmes de CORS

- En production monolithique, CORS devrait être minimal
- Vérifiez que `FRONTEND_URL` correspond à l'URL Render

### WebSocket ne fonctionne pas

- Vérifiez que `VITE_WS_PROTOCOL=wss` en production
- Vérifiez que `VITE_WS_HOST` correspond à votre domaine Render
- Vérifiez que `VITE_WS_PORT=443` en production

## 📚 Technologies

- **Backend**: Express.js, MongoDB, WebSocket (wsmini)
- **Frontend**: Vue.js 3, Vite, TailwindCSS, MapBox
- **Déploiement**: Docker, Render
- **Base de données**: MongoDB Atlas

## 📄 Licence

Ce projet est à usage éducatif.
