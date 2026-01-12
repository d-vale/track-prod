<script setup>
import { ref, computed, onUnmounted, onMounted, watch } from "vue";
import { v4 } from "uuid";
import { onDeviceStorageService } from "@/services/onDeviceStorageService.js";
import { haversine } from "@/utils/haversine.mjs";
import { calcPace } from "@/utils/paceCalculator.js";
import { activityBuilderService } from "@/services/activityBuilderService.js";
import { useFetchJson } from "@/composables/useFetchJson";

import Map from "@/components/Map.vue";
import { ChevronDown, Play, Pause } from "lucide-vue-next";

const { data, error, execute } = useFetchJson({
  url: "/api/activities",
  method: "POST",
  immediate: false,
});

const timeout = ref(null);
const ACTIVTIY_ID = ref(null);
const mapRef = ref(null);

const isTracking = ref(false);
const isDarkTheme = computed(() => mapRef.value?.mapStyle === 'night');
const isPaused = ref(false);
const time = ref(null);
const elapsedSeconds = ref(0);
const started_at = ref(0);
const stopped_at = ref(0);

const distance = ref(0);
const lastPoint = ref(null);
const currentPoint = ref(null);
const pace = ref("00:00"); // min/km

const lapDistance = ref(0);
const lapNumber = ref(1);
const lapElevationGain = ref(0);
const lapElevationLoss = ref(0);
const lapStartTimestamp = ref(null);

const currentHeight = ref(null);
const lastHeight = ref(null);
const elevationGain = ref(0);
const elevationLoss = ref(0);

const formattedTime = computed(() => {
  const hours = Math.floor(elapsedSeconds.value / 3600);
  const minutes = Math.floor((elapsedSeconds.value % 3600) / 60);
  const seconds = elapsedSeconds.value % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}:${String(seconds).padStart(2, "0")}`;
});

const formattedDistance = computed(() => {
  return (distance.value / 1000).toFixed(2);
});

const updateDistance = () => {
  if (lastPoint.value) {
    let d = haversine(lastPoint.value, currentPoint.value);
    d < 12.5 ? (distance.value += d) : distance.value; // vitesse max humaine running 12.42m/s (2009)

    lapDistance.value += d;

    if (lapDistance.value >= 1000) {
      saveLap();
    }
  }
};

const saveLap = () => {
  let started_at = lapStartTimestamp.value;
  let finished_at = Date.now();
  let time = finished_at - started_at;
  let pace = calcPace(time, lapDistance.value);

  let lap = {
    lap: lapNumber.value,
    distance: lapDistance.value,
    elevationGain: lapElevationGain.value,
    elevationLoss: lapElevationLoss.value,
    pace,
    started_at,
    finished_at,
  };

  lapDistance.value = 0;
  lapElevationGain.value = 0;
  lapElevationLoss.value = 0;
  lapNumber.value += 1;
  lapStartTimestamp.value = Date.now();
  stopped_at.value = finished_at;

  onDeviceStorageService.addLap(ACTIVTIY_ID.value, lap);
};

const updateElevationGainLoss = () => {
  console.log("Height : ", currentHeight.value);

  if (currentHeight.value != null && lastHeight.value != null) {
    let diff = currentHeight.value - lastHeight.value; // (-) = perte (+) = gain
    diff < 0
      ? (elevationLoss.value += Math.abs(diff))
      : (elevationGain.value += Math.abs(diff));

    diff < 0
      ? (lapElevationLoss.value += Math.abs(diff))
      : (lapElevationGain.value += Math.abs(diff));
  }

  console.log("D+ : ", elevationGain.value);
  console.log("D- : ", elevationLoss.value);
};

const startTracking = async () => {
  // Récupérer la position depuis Mapbox au lieu de geolocationService
  const position = mapRef.value?.getCurrentPosition();

  if (position) {
    currentPoint.value = position;

    // Ajouter le point à la trace sur la carte
    mapRef.value?.addPointToTrace(position);

    currentHeight.value = await onDeviceStorageService.addPoint(
      currentPoint.value,
      ACTIVTIY_ID.value
    ); // si connexion, addPoint() retourne la hauteur du point ajouté, sinon null
    updateDistance();
    updateElevationGainLoss();

    lastPoint.value = currentPoint.value;
    lastHeight.value = currentHeight.value;
  } else {
    console.warn(
      "Position non disponible, en attente de la géolocalisation..."
    );
  }

  elapsedSeconds.value++;

  timeout.value = setTimeout(() => startTracking(), 1000);
};

const stopTracking = () => {
  clearTimeout(timeout.value);
};

const togglePause = () => {
  !isPaused.value ? stopTracking() : startTracking();
  isPaused.value = !isPaused.value;
};

const toggleTracking = async () => {
  if (!isTracking.value) {
    isTracking.value = true;
    set();
    onDeviceStorageService.init(ACTIVTIY_ID.value, started_at.value);
    startTracking();
  } else {
    isTracking.value = false;
    try {
      saveLap();
      onDeviceStorageService.finish(ACTIVTIY_ID.value, stopped_at.value);
      stopTracking();
      await send();
    } catch (error) {
      console.error(error.message);
    } finally {
      reset();
    }
  }
};
const send = async () => {
  const activity = await activityBuilderService.create(
    ACTIVTIY_ID.value,
    elapsedSeconds.value
  );

  console.log("Sended activity: ", activity);

  if (navigator.onLine) {
    await execute(activity);

    if (data.value?.success) {
      localStorage.removeItem(ACTIVTIY_ID.value);
      console.log("Activity saved successfully");
    } else if (error.value) {
      console.error(
        `Network ERROR: ${error.value.status} - ${error.value.statusText}`
      );
    } else if (data.value?.success === false) {
      console.error(
        `API ERROR: ${data.value.error.code} - ${data.value.error.message}`
      );
    }
  } else {
    localStorage.setItem(
      ACTIVTIY_ID.value,
      JSON.stringify({ data: { ...activity }, toSend: true })
    );
    console.log("Activity saved offline, will sync when online");
  }
};

const set = () => {
  started_at.value = Date.now();
  lapStartTimestamp.value = started_at.value;
  ACTIVTIY_ID.value = v4();
};

const reset = () => {
  ACTIVTIY_ID.value = null;
  elapsedSeconds.value = 0;
  distance.value = 0;
  time.value = 0;
  lapNumber.value = 0;
  isPaused.value = false;
  mapRef.value.clearTrace();
};

onUnmounted(() => {
  stopTracking();
});

watch(elapsedSeconds, (newVal) => {
  pace.value = calcPace(newVal, distance.value);
});
</script>

<template>
  <div class="flex flex-col w-full justify-between min-h-screen">
    <div class="flex-1 bg-gray-200 relative">
      <Map ref="mapRef" :is-tracking="isTracking"></Map>
      <div class="absolute top-0 left-0 m-5">
        <router-link to="/home" class="chevron-button">
          <ChevronDown size="24" :color="isDarkTheme ? 'white' : '#1f2937'" />
        </router-link>
      </div>

      <div class="absolute bottom-0 left-0 right-0 mx-5 mb-5">
        <!-- Container rectangulaire toujours visible -->
        <div class="tracking-container">
          <!-- Métriques -->
          <div class="flex justify-around p-4 gap-3">
            <div class="flex flex-col items-center gap-0.5">
              <span :class="isDarkTheme ? 'text-white' : 'text-gray-900'" class="font-bold text-base text-shadow-lg">{{ formattedTime }}</span>
            </div>
            <div class="flex flex-col items-center gap-0.5">
              <span :class="isDarkTheme ? 'text-white' : 'text-gray-900'" class="font-bold text-base text-shadow-lg">{{ formattedDistance }}</span>
              <span :class="isDarkTheme ? 'text-white/80' : 'text-gray-700'" class="text-xs text-shadow-lg">km</span>
            </div>
            <div class="flex flex-col items-center gap-0.5">
              <span :class="isDarkTheme ? 'text-white' : 'text-gray-900'" class="font-bold text-base text-shadow-lg">{{ pace }}</span>
              <span :class="isDarkTheme ? 'text-white/80' : 'text-gray-700'" class="text-xs text-shadow-lg">min/km</span>
            </div>
          </div>

          <!-- Boutons: Start / Pause / Resume+Finish -->
          <div class="flex w-full">
            <!-- État non actif: bouton Start pleine largeur -->
            <button
              v-if="!isTracking"
              :class="isDarkTheme ? 'text-white' : 'text-gray-900'"
              class="flex-1 p-3.5 border-0 cursor-pointer font-semibold text-sm flex items-center justify-center gap-1.5 w-full bg-(--orange) opacity-85"
              @click="toggleTracking"
            >
              <Play :size="20" />
              <span>Start</span>
            </button>

            <!-- État actif non pausé: bouton Pause pleine largeur -->
            <button
              v-else-if="isTracking && !isPaused"
              :class="isDarkTheme ? 'text-white' : 'text-gray-900'"
              class="flex-1 p-3.5 border-0 cursor-pointer font-semibold text-sm flex items-center justify-center gap-1.5 w-full bg-white/20"
              @click="togglePause"
            >
              <Pause :size="20" />
              <span>Pause</span>
            </button>

            <!-- État actif en pause: boutons Finish et Resume -->
            <template v-else-if="isTracking && isPaused">
              <button
                :class="isDarkTheme ? 'text-white' : 'text-gray-900'"
                class="flex-1 p-3.5 border-0 cursor-pointer font-semibold text-sm flex items-center justify-center gap-1.5 bg-(--orange) opacity-85 border-r-[0.5px] border-white/20"
                @click="toggleTracking"
              >
                <span>Finish</span>
              </button>
              <button
                :class="isDarkTheme ? 'text-white' : 'text-gray-900'"
                class="flex-1 p-3.5 border-0 cursor-pointer font-semibold text-sm flex items-center justify-center gap-1.5 bg-white/20"
                @click="togglePause"
              >
                <Play :size="20" />
                <span>Resume</span>
              </button>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Glassmorphism pour le bouton chevron */
.chevron-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 0.5px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.2);
  cursor: pointer;
  transition: all 0.3s ease;
}


/* Container rectangulaire avec glassmorphism */
.tracking-container {
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 0.5px solid rgba(255, 255, 255, 0.3);
  border-radius: 16px;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.2);
  overflow: hidden;
  width: 100%;
}
</style>
