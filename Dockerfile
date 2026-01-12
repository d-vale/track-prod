# Stage 1: Build frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Copier les fichiers de configuration frontend
COPY frontend/package*.json ./

# Installer les dépendances frontend
RUN npm ci

# Copier le code source frontend
COPY frontend/ ./

# Build le frontend pour la production
RUN npm run build

# Stage 2: Backend avec fichiers statiques
FROM node:20-alpine AS production

WORKDIR /app

# Copier les fichiers de configuration backend
COPY backend/package*.json ./

# Installer uniquement les dépendances de production
RUN npm ci --only=production

# Copier le code source backend
COPY backend/ ./

# Copier les fichiers buildés du frontend depuis le stage 1
# Le backend cherche ../frontend/dist depuis /app, donc on copie dans /frontend/dist
COPY --from=frontend-builder /app/frontend/dist /frontend/dist

# Exposer le port (3000 par défaut, ou PORT env variable)
EXPOSE 3000

# Définir les variables d'environnement par défaut
ENV NODE_ENV=production
ENV PORT=3000

# Démarrer l'application
CMD ["node", "./bin/start.mjs"]
