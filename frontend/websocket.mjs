import { WSClient } from "wsmini";
import { ref } from "vue";

// Récupération des variables d'env et création du serveur websocket
const wsHost = import.meta.env.VITE_WS_HOST ?? "localhost";
const wsPort = import.meta.env.VITE_WS_PORT ?? "8080";
const wsProtocol = import.meta.env.VITE_WS_PROTOCOL ?? "wss";

const wsUrl = import.meta.env.PROD
  ? `${wsProtocol}://${wsHost}`
  : `${wsProtocol}://${wsHost}:${wsPort}`;

export const ws = new WSClient(wsUrl);

// Refs vue pour l'affichage
export const users_count_connected = ref(0);
export const total_km_ever = ref(0);
export const total_activities_ever = ref(0);
export const total_elevation_ever = ref(0);
export const total_users_community = ref(0);
export const total_time_ever = ref(0);

// Initialisation de la connection websocket
export async function connect() {
  try {
    await ws.connect();

    await ws.sub(import.meta.env.VITE_WS_CHANNEL_NAME, (msg) => {
      if (msg.type == "users_count") {
        users_count_connected.value = msg.count;
      } else if (msg.type == "community_totals") {
        total_km_ever.value = msg.data.totalKmEver;
        total_activities_ever.value = msg.data.totalActivitiesEver;
        total_elevation_ever.value = msg.data.totalElevationEver;
        total_users_community.value = msg.data.totalUsers;
        total_time_ever.value = msg.data.totalTimeEver;
      }
    });

    return true;
  } catch (err) {
    console.error("Connection failed:", err);
    return false;
  }
}
