<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useFetchJson } from "../composables/useFetchJson.js";
import polyline from "@mapbox/polyline";

const router = useRouter();
const route = useRoute();

// Déclaration du fetch pour récupérer toutes les activités
const { data, error, execute } = useFetchJson({
  url: "/api/activities",
  method: "GET",
  immediate: false,
});

// État des activités
const activities = ref([]);
const loading = ref(true);

const MAPBOX_ACCESS_TOKEN =
  "pk.eyJ1Ijoiay1zZWwiLCJhIjoiY21qcXlycDJ3M3hlcjNlcXhyMThlZWZydCJ9.uDpE5Dw1is7vJOmVzVXHGQ";

// Surveiller les changements de data et error
watch([data, error], async () => {
  loading.value = false;

  if (error.value) {
    console.error("Erreur API:", error.value);
    return;
  }

  if (data.value) {
    // Récupérer et trier les activités de la plus récente à la plus ancienne
    let activitiesArray = [];

    if (Array.isArray(data.value)) {
      activitiesArray = data.value;
    } else if (data.value.data && Array.isArray(data.value.data)) {
      activitiesArray = data.value.data;
    }

    if (activitiesArray.length > 0) {
      activities.value = activitiesArray.sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
      });
    }
  }
});

// Générer l'URL de l'image statique Mapbox pour un polyline
const getStaticMapUrl = (encodedPolyline) => {
  if (!encodedPolyline) return null;

  try {
    // Décoder le polyline pour obtenir les coordonnées
    const coordinates = polyline.decode(encodedPolyline);

    // Calculer les bounds
    let minLat = coordinates[0][0],
      maxLat = coordinates[0][0];
    let minLng = coordinates[0][1],
      maxLng = coordinates[0][1];

    coordinates.forEach(([lat, lng]) => {
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
    });

    // Calculer le centre
    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;

    // Calculer le zoom approprié basé sur les bounds
    const latDiff = maxLat - minLat;
    const lngDiff = maxLng - minLng;
    const maxDiff = Math.max(latDiff, lngDiff);

    let zoom = 13;
    if (maxDiff > 0.1) zoom = 11;
    if (maxDiff > 0.2) zoom = 10;
    if (maxDiff > 0.5) zoom = 9;
    if (maxDiff < 0.05) zoom = 14;
    if (maxDiff < 0.01) zoom = 15;

    // Construire le path encodé pour l'overlay
    const pathEncoded = encodeURIComponent(
      `path-3+FF8C00-0.9(${encodedPolyline})`
    );

    // URL de l'API Static Images de Mapbox
    const width = 800;
    const height = 600;
    const url = `https://api.mapbox.com/styles/v1/mapbox/outdoors-v12/static/${pathEncoded}/auto/${width}x${height}@2x?access_token=${MAPBOX_ACCESS_TOKEN}&attribution=false&logo=false`;

    return url;
  } catch (err) {
    console.error("Erreur lors de la génération de l'URL de la carte:", err);
    return null;
  }
};

// Formater la date et l'heure
const formatDateTime = (isoDate) => {
  const date = new Date(isoDate);
  const day = date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const time = date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${day} à ${time}`;
};

// Formater la distance en km
const formatDistance = (meters) => {
  return (meters / 1000).toFixed(2);
};

// Formater la durée
const formatDuration = (milliseconds) => {
  const seconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  }
  return `${minutes}m ${secs}s`;
};

// Lien vers la page de détail de l'activité (Avec paramêtre d'ID)
const goToActivityDetail = (activityId) => {
  router.push({ name: "ActivityDetail", params: { id: activityId } }); // = <router-link>
};

// Charger les activités au montage du composant
onMounted(async () => {
  loading.value = true;
  await execute();
});

// Recharger les activités quand on revient après une suppression
watch(() => route.query.deleted, async (newVal) => {
  if (newVal === 'true') {
    loading.value = true;
    await execute();
  }
});
</script>

<template>
  <div class="w-full">
    <!-- État de chargement -->
    <div v-if="loading" class="text-center py-8">
      <p class="text-sm font-medium">Chargement des activités...</p>
    </div>

    <!-- État d'erreur -->
    <div v-else-if="error" class="text-center py-8 text-red-600">
      <p class="text-sm font-medium">
        {{
          typeof error === "string"
            ? error
            : "Erreur lors du chargement des activités"
        }}
      </p>
    </div>

    <!-- Liste des activités -->
    <div v-else-if="activities.length > 0" class="space-y-4">
      <div
        v-for="activity in activities"
        :key="activity._id"
        class="w-full pt-2.5 border-t border-(--secondary) inline-flex flex-col justify-start items-start"
      >
        <div class="self-stretch px-6 inline-flex justify-between items-center">
          <div
            class="py-2.5 inline-flex flex-col justify-center items-start gap-0.5"
          >
            <div class="text-center justify-center font-bold leading-4">
              {{ activity.activityType === "run" ? "Footing" : "Activité" }}
            </div>
            <div class="self-stretch inline-flex justify-between items-center">
              <svg
                width="15"
                height="13"
                viewBox="0 0 20 13"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                class="w-3 h-3"
              >
                <path
                  d="M14.3861 9.79083L12.3979 8.86065C11.843 8.60305 11.3762 8.20509 11.0506 7.71187C10.725 7.21864 10.5535 6.64989 10.5556 6.07009V4.15967C10.5556 4.02176 10.497 3.88949 10.3928 3.79196C10.2886 3.69444 10.1473 3.63965 10 3.63965C9.11622 3.63879 8.26891 3.30979 7.64399 2.72484C7.01907 2.13989 6.66758 1.34678 6.66666 0.519539C6.66657 0.422799 6.63765 0.328001 6.58315 0.245804C6.52865 0.163607 6.45073 0.0972689 6.35816 0.0542485C6.26559 0.0112282 6.16204 -0.00676897 6.05914 0.00228041C5.95624 0.0113298 5.85808 0.0470668 5.77569 0.105474L0.425694 3.89966L0.411805 3.91006C0.290796 4.00181 0.191741 4.11634 0.121065 4.24623C0.0503889 4.37611 0.00967073 4.51846 0.00155131 4.66402C-0.00656811 4.80959 0.0180926 4.95513 0.0739338 5.0912C0.129775 5.22727 0.21555 5.35083 0.325694 5.45387L8.22222 12.8479C8.27385 12.8962 8.33514 12.9345 8.40258 12.9605C8.47002 12.9866 8.5423 13.0001 8.61527 13H13.8889C14.1836 13 14.4662 12.8904 14.6746 12.6954C14.8829 12.5003 15 12.2358 15 11.96V10.721C15.0007 10.5278 14.9435 10.3382 14.835 10.1738C14.7265 10.0094 14.571 9.87677 14.3861 9.79083ZM13.8889 11.96H8.84513L1.11111 4.72064L2.00486 4.08622L4.69861 6.60766C4.80285 6.70541 4.94431 6.7604 5.09187 6.76052C5.23942 6.76064 5.38099 6.70589 5.48541 6.60831C5.58984 6.51074 5.64858 6.37833 5.64871 6.24021C5.64884 6.10209 5.59035 5.96959 5.48611 5.87184L2.89861 3.4518L5.67639 1.48157C5.88692 2.30488 6.36018 3.0487 7.03325 3.61416C7.70632 4.17962 8.54732 4.53993 9.44444 4.64719V6.07009C9.44168 6.84321 9.67041 7.60159 10.1047 8.25923C10.5389 8.91686 11.1614 9.44745 11.9014 9.79083L13.8889 10.721V11.96ZM3.25 10.9199H0.555555C0.408213 10.9199 0.266905 10.8651 0.162718 10.7676C0.0585315 10.6701 0 10.5378 0 10.3999C0 10.262 0.0585315 10.1297 0.162718 10.0322C0.266905 9.93467 0.408213 9.87988 0.555555 9.87988H3.25C3.39734 9.87988 3.53865 9.93467 3.64284 10.0322C3.74702 10.1297 3.80555 10.262 3.80555 10.3999C3.80555 10.5378 3.74702 10.6701 3.64284 10.7676C3.53865 10.8651 3.39734 10.9199 3.25 10.9199ZM6.02778 12.48C6.02778 12.6179 5.96924 12.7502 5.86506 12.8477C5.76087 12.9452 5.61956 13 5.47222 13H1.66667C1.51932 13 1.37802 12.9452 1.27383 12.8477C1.16964 12.7502 1.11111 12.6179 1.11111 12.48C1.11111 12.3421 1.16964 12.2098 1.27383 12.1123C1.37802 12.0147 1.51932 11.96 1.66667 11.96H5.47222C5.61956 11.96 5.76087 12.0147 5.86506 12.1123C5.96924 12.2098 6.02778 12.3421 6.02778 12.48Z"
                  fill="currentColor"
                />
              </svg>
              <div
                class="text-center justify-center text-[10px] font-medium leading-4"
              >
                {{ formatDateTime(activity.date) }}
              </div>
            </div>
          </div>
          <div
            class="w-20 pl-2.5 py-2.5 flex justify-end items-center gap-2.5 cursor-pointer"
            @click="goToActivityDetail(activity._id)"
          >
            <div
              class="text-center justify-center text-xs font-medium leading-4"
            >
              Voir détail
            </div>
          </div>
        </div>
        <div
          class="self-stretch px-6 pb-4 inline-flex justify-between items-center"
        >
          <div
            class="py-2.5 inline-flex flex-col justify-center items-start gap-0.5"
          >
            <div
              class="text-center justify-center text-[10px] font-medium leading-4"
            >
              Distance
            </div>
            <div
              class="text-center justify-center text-base font-bold leading-4"
            >
              {{ formatDistance(activity.distance) }} km
            </div>
          </div>
          <div
            class="py-2.5 inline-flex flex-col justify-center items-start gap-0.5"
          >
            <div
              class="text-center justify-center text-[10px] font-medium leading-4"
            >
              Temps
            </div>
            <div
              class="text-center justify-center text-base font-bold leading-4"
            >
              {{ formatDuration(activity.duration) }}
            </div>
          </div>
          <div
            class="py-2.5 inline-flex flex-col justify-center items-start gap-0.5"
          >
            <div
              class="text-center justify-center text-[10px] font-medium leading-4"
            >
              Difficulté
            </div>
            <div
              class="text-center justify-center text-base font-bold leading-4"
            >
              {{ activity.difficultyScore }}
            </div>
          </div>
        </div>
        <div
          class="self-stretch px-6 pb-4 inline-flex justify-between items-center"
        >
          <div
            class="py-2.5 inline-flex flex-col justify-center items-start gap-0.5"
          >
            <div
              class="text-center justify-center text-[10px] font-medium leading-4"
            >
              Allure
            </div>
            <div
              class="text-center justify-center text-base font-bold leading-4"
            >
              {{ activity.avgPace }} min/km
            </div>
          </div>
          <div
            class="py-2.5 inline-flex flex-col justify-center items-start gap-0.5"
          >
            <div
              class="text-center justify-center text-[10px] font-medium leading-4"
            >
              Calories
            </div>
            <div
              class="text-center justify-center text-base font-bold leading-4"
            >
              {{ Math.round(activity.estimatedCalories) }} kcal
            </div>
          </div>
          <div
            class="py-2.5 inline-flex flex-col justify-center items-start gap-0.5"
          >
            <div
              class="text-center justify-center text-[10px] font-medium leading-4"
            >
              Denivelé
            </div>
            <div
              class="text-center justify-center text-base font-bold leading-4"
            >
              {{ (activity.elevationGain + activity.elevationLoss).toFixed(0) }}
              m
            </div>
          </div>
        </div>
        <!-- apercu carte -->
        <img
          v-if="activity.encodedPolyline"
          :src="getStaticMapUrl(activity.encodedPolyline)"
          :alt="`Carte de l'activité ${activity.activityType}`"
          class="self-stretch h-96 object-cover"
        />
        <img
          v-else
          class="self-stretch h-96"
          src="https://placehold.co/402x366"
        />
      </div>
    </div>

    <!-- Aucune activité -->
    <div v-else class="text-center py-8">
      <p class="text-sm font-medium">Aucune activité trouvée</p>
    </div>
  </div>
</template>

<style scoped></style>
