# Track Front

Application de suivi GPS en temps réel avec Vue 3 et WebSocket.

## Fonctionnalités

### Authentification
- Login avec token (localStorage)
- Protection des routes
- Déconnexion

### Tracking GPS
- Contrôles Start/Stop/Pause
- Chronomètre temps réel (HH:MM:SS)
- Distance et temps (**valeurs statiques temporaires** pour développer la logique frontend)
- Envoi GPS via WebSocket toutes les 5s
