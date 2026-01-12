# Stage 1: Build frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Copier les fichiers de configuration frontend
COPY frontend/package*.json ./

# Installer les dépendances frontend
RUN npm ci

# Copier le code source frontend
COPY frontend/ ./

# Accepter les variables d'environnement comme build args avec valeurs par défaut
ARG VITE_API_BASE_URL=https://tracks-xy4b.onrender.com
ARG VITE_CLOUDINARY_CLOUD_NAME=dqbyulp69
ARG VITE_CLOUDINARY_UPLOAD_PRESET="Unsigned Preset"
ARG VITE_WS_CHANNEL_NAME=users
ARG VITE_WS_HOST=tracks-xy4b.onrender.com
ARG VITE_WS_PORT=443
ARG VITE_WS_PROTOCOL=wss
ARG VITE_MAPBOX_ACCESS_TOKEN

# Les rendre disponibles pour le build Vite
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_CLOUDINARY_CLOUD_NAME=${VITE_CLOUDINARY_CLOUD_NAME}
ENV VITE_CLOUDINARY_UPLOAD_PRESET=${VITE_CLOUDINARY_UPLOAD_PRESET}
ENV VITE_WS_CHANNEL_NAME=${VITE_WS_CHANNEL_NAME}
ENV VITE_WS_HOST=${VITE_WS_HOST}
ENV VITE_WS_PORT=${VITE_WS_PORT}
ENV VITE_WS_PROTOCOL=${VITE_WS_PROTOCOL}
ENV VITE_MAPBOX_ACCESS_TOKEN=${VITE_MAPBOX_ACCESS_TOKEN}

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
