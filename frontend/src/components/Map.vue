<script setup>
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { onMounted, onBeforeUnmount, ref, toRefs } from "vue";
import { Navigation, NavigationOff, Sun, Moon } from "lucide-vue-next";

const props = defineProps({
  isTracking: {
    type: Boolean,
    default: false,
  },
});

const { isTracking } = toRefs(props);

const mapInstance = ref(null);
const geolocateControlRef = ref(null);
const currentPosition = ref(null);
const geolocateState = ref("ACTIVE_LOCK"); // "OFF", "BACKGROUND", "ACTIVE_LOCK"
const mapStyle = ref("night"); // "day", "night", "topo"
const showMapStyleModal = ref(false);
const trackingCoordinates = ref([]); // Coordonnées pour la trace

onMounted(() => {
  const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
  if (!token) {
    console.error("Mapbox access token is not defined in environment variables.");
    return;
  }
  initializeMap(token);
});

onBeforeUnmount(() => {
  if (mapInstance.value) {
    mapInstance.value.remove();
    mapInstance.value = null;
  }
});

const getMapStyleUrl = (style) => {
  const styles = {
    day: "mapbox://styles/mapbox/standard",
    night: "mapbox://styles/mapbox/standard",
    topo: "mapbox://styles/mapbox/outdoors-v12"
  };
  return styles[style] || styles.day;
};

const initializeMap = (token) => {
  mapboxgl.accessToken = token;
  mapInstance.value = new mapboxgl.Map({
    container: "map",
    style: getMapStyleUrl(mapStyle.value),
    center: [7.4474, 46.948],
    zoom: 6.5,
    attributionControl: false,
    config: {
      basemap: {
        lightPreset: mapStyle.value === "night" ? "night" : "day",
      },
    },
  });

  const map = mapInstance.value;

  // Ajouter le contrôle de géolocalisation
  const geolocateControl = new mapboxgl.GeolocateControl({
    positionOptions: {
      enableHighAccuracy: true,
    },
    trackUserLocation: true,
    showUserHeading: true,
  });

  geolocateControlRef.value = geolocateControl;

  map.addControl(geolocateControl, "bottom-right");

  // Gérer les événements de géolocalisation
  geolocateControl.on("geolocate", (position) => {
    const coords = [position.coords.longitude, position.coords.latitude];
    currentPosition.value = coords;

    // Ajouter à la trace seulement si on track
    if (isTracking.value) {
      trackingCoordinates.value.push(coords);

      // Mise à jour optimisée : on modifie directement la source sans recréer
      const source = mapInstance.value?.getSource("trace");
      if (source) {
        source.setData({
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: trackingCoordinates.value,
          },
        });
      }
    }

    // Si on obtient une position, on est soit en ACTIVE_LOCK soit en BACKGROUND
    // On vérifie si on est en train de suivre activement
    if (geolocateControl._watchState === "ACTIVE_LOCK") {
      geolocateState.value = "ACTIVE_LOCK";
    } else if (geolocateControl._watchState === "BACKGROUND") {
      geolocateState.value = "BACKGROUND";
    }
  });

  geolocateControl.on("error", (error) => {
    console.error("Erreur de géolocalisation:", error);
    geolocateState.value = "OFF";
  });

  // Quand l'utilisateur déplace la carte manuellement
  geolocateControl.on("trackuserlocationstart", () => {
    geolocateState.value = "ACTIVE_LOCK";
  });

  geolocateControl.on("trackuserlocationend", () => {
    if (geolocateControl._watchState === "BACKGROUND") {
      geolocateState.value = "BACKGROUND";
    } else {
      geolocateState.value = "OFF";
    }
  });

  // Quand on passe en mode background (user a bougé la carte)
  map.on("movestart", (e) => {
    if (
      geolocateControl._watchState === "ACTIVE_LOCK" &&
      !e.originalEvent?.type?.includes("touch")
    ) {
      // Si le mouvement n'est pas causé par la géolocalisation elle-même
      setTimeout(() => {
        if (geolocateControl._watchState === "BACKGROUND") {
          geolocateState.value = "BACKGROUND";
        }
      }, 100);
    }
  });

  // Activer automatiquement la géolocalisation dès que la carte est chargée
  map.on("load", () => {
    // Ajouter la source pour la trace (une seule fois au load)
    map.addSource("trace", {
      type: "geojson",
      data: {
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: [],
        },
      },
    });

    // Ajouter le layer pour la trace
    map.addLayer({
      id: "trace-line",
      type: "line",
      source: "trace",
      layout: {
        "line-join": "round",
        "line-cap": "round",
      },
      paint: {
        "line-color": "#FF3D00",
        "line-width": 4,
        "line-opacity": 0.9,
      },
    });

    geolocateControl.trigger();
  });
};

// Fonction pour obtenir la position actuelle
const getCurrentPosition = () => {
  return currentPosition.value;
};

// Fonction pour ajouter un point à la trace manuellement
const addPointToTrace = (coords) => {
  if (coords && isTracking.value) {
    trackingCoordinates.value.push(coords);

    const source = mapInstance.value?.getSource("trace");
    if (source) {
      source.setData({
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: trackingCoordinates.value,
        },
      });
    }
  }
};

// Fonction pour changer le style de carte
const changeMapStyle = (style) => {
  mapStyle.value = style;
  showMapStyleModal.value = false;

  if (mapInstance.value) {
    const center = mapInstance.value.getCenter();
    const zoom = mapInstance.value.getZoom();

    mapInstance.value.setStyle(getMapStyleUrl(style), {
      config: {
        basemap: {
          lightPreset: style === "night" ? "night" : "day",
        },
      },
    });

    // Réappliquer la trace après changement de style
    mapInstance.value.once('style.load', () => {
      mapInstance.value.setCenter(center);
      mapInstance.value.setZoom(zoom);

      // Recréer la source et le layer pour la trace
      mapInstance.value.addSource("trace", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: trackingCoordinates.value,
          },
        },
      });

      mapInstance.value.addLayer({
        id: "trace-line",
        type: "line",
        source: "trace",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#FF3D00",
          "line-width": 4,
          "line-opacity": 0.9,
        },
      });
    });
  }
};

const toggleMapStyleModal = () => {
  showMapStyleModal.value = !showMapStyleModal.value;
};

// Fonction pour déclencher la géolocalisation
const triggerGeolocate = () => {
  if (geolocateControlRef.value) {
    geolocateControlRef.value.trigger();
  }
};

// Fonction pour effacer la trace
const clearTrace = () => {
  trackingCoordinates.value = [];
  const source = mapInstance.value?.getSource("trace");
  if (source) {
    source.setData({
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates: [],
      },
    });
  }
};

defineExpose({
  getCurrentPosition,
  mapStyle,
  clearTrace,
  addPointToTrace,
});
</script>

<template>
  <div id="map"></div>

  <!-- Bouton de géolocalisation -->
  <button @click="triggerGeolocate" class="custom-geolocate-btn">
    <!-- Active tracking: flèche pleine -->
    <Navigation
      v-if="geolocateState === 'ACTIVE_LOCK'"
      :size="20"
      :strokeWidth="2.5"
      :fill="mapStyle === 'night' ? 'white' : '#1f2937'"
      :color="mapStyle === 'night' ? 'white' : '#1f2937'"
    />
    <!-- Background: flèche vide -->
    <Navigation
      v-else-if="geolocateState === 'BACKGROUND'"
      :size="20"
      :strokeWidth="2.5"
      :color="mapStyle === 'night' ? 'white' : '#1f2937'"
    />
    <!-- Off: flèche barrée -->
    <NavigationOff
      v-else
      :size="20"
      :strokeWidth="2.5"
      :color="mapStyle === 'night' ? 'white' : '#1f2937'"
    />
  </button>

  <!-- Bouton style de carte -->
  <button @click="toggleMapStyleModal" class="custom-mapstyle-btn">
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      :stroke="mapStyle === 'night' ? 'white' : '#1f2937'"
      stroke-width="2.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon>
      <line x1="9" y1="3" x2="9" y2="18"></line>
      <line x1="15" y1="6" x2="15" y2="21"></line>
    </svg>
  </button>

  <!-- Modale de sélection du style -->
  <Transition name="modal-fade">
    <div v-if="showMapStyleModal" class="map-style-modal">
      <button
        @click="changeMapStyle('day')"
        :class="['map-style-option', { active: mapStyle === 'day' }]"
        :style="{ color: mapStyle === 'night' ? 'white' : '#1f2937' }"
      >
        <Sun :size="20" :strokeWidth="2.5" />
        <span>Jour</span>
      </button>
      <button
        @click="changeMapStyle('night')"
        :class="['map-style-option', { active: mapStyle === 'night' }]"
        :style="{ color: mapStyle === 'night' ? 'white' : '#1f2937' }"
      >
        <Moon :size="20" :strokeWidth="2.5" />
        <span>Nuit</span>
      </button>
      <button
        @click="changeMapStyle('topo')"
        :class="['map-style-option', { active: mapStyle === 'topo' }]"
        :style="{ color: mapStyle === 'night' ? 'white' : '#1f2937' }"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
        <span>Topo</span>
      </button>
    </div>
  </Transition>
</template>

<style scoped>
#map {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 100%;
}

/* Cacher le bouton Mapbox natif */
:deep(.mapboxgl-ctrl-geolocate) {
  display: none !important;
}

/* Cacher le logo Mapbox */
:deep(.mapboxgl-ctrl-logo) {
  display: none !important;
}

/* Cacher les attributions Mapbox */
:deep(.mapboxgl-ctrl-attrib) {
  display: none !important;
}

/* Bouton personnalisé avec glassmorphism */
.custom-geolocate-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 0.5px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.2);
  cursor: pointer;
  transition: all 0.3s ease;
  color: white;
  z-index: 1000;
}

.custom-geolocate-btn:hover {
  background: rgba(255, 255, 255, 0.35);
  transform: scale(1.05);
}

.custom-geolocate-btn:active {
  transform: scale(0.98);
}

/* Bouton style de carte */
.custom-mapstyle-btn {
  position: absolute;
  top: 76px;
  right: 20px;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 0.5px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.2);
  cursor: pointer;
  transition: all 0.3s ease;
  color: white;
  z-index: 1000;
}

.custom-mapstyle-btn:hover {
  background: rgba(255, 255, 255, 0.35);
  transform: scale(1.05);
}

.custom-mapstyle-btn:active {
  transform: scale(0.98);
}

/* Modale de sélection du style */
.map-style-modal {
  position: absolute;
  top: 132px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 0.5px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.2);
  padding: 8px;
  z-index: 1001;
}

.map-style-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  font-weight: 500;
  min-width: 140px;
}

.map-style-option:hover {
  background: rgba(255, 255, 255, 0.15);
}

.map-style-option.active {
  background: rgba(255, 255, 255, 0.3);
}

.map-style-option span {
  flex: 1;
  text-align: left;
}

/* Animation de la modale */
.modal-fade-enter-active {
  animation: modal-slide-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-fade-leave-active {
  animation: modal-slide-out 0.2s cubic-bezier(0.4, 0, 1, 1);
}

@keyframes modal-slide-in {
  0% {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes modal-slide-out {
  0% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
  }
}
</style>
