<script setup>
import { ref, onMounted, computed } from "vue";
import { useFetchJson } from "../composables/useFetchJson";

const performances = ref([]);
const loading = ref(true);
const error = ref(null);

// Configuration des distances avec leurs labels
const distanceConfig = {
  5000: { label: "5 km", order: 1 },
  10000: { label: "10 km", order: 2 },
  21097.5: { label: "Semi-marathon", order: 3 },
  42195: { label: "Marathon", order: 4 },
};

// Formater le chrono en format mm:ss ou hh:mm:ss
const formatChrono = (seconds) => {
  if (!seconds) return "N/A";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}h ${String(minutes).padStart(2, "0")}m ${String(secs).padStart(2, "0")}s`;
  }
  return `${minutes}m ${String(secs).padStart(2, "0")}s`;
};

// Calculer l'allure (min/km)
const calculatePace = (seconds, distanceMeters) => {
  if (!seconds || !distanceMeters) return "N/A";

  const distanceKm = distanceMeters / 1000;
  const paceSecondsPerKm = seconds / distanceKm;
  const paceMinutes = Math.floor(paceSecondsPerKm / 60);
  const paceSeconds = Math.floor(paceSecondsPerKm % 60);

  return `${paceMinutes}:${String(paceSeconds).padStart(2, "0")} /km`;
};

// Formater la date
const formatDate = (isoDate) => {
  if (!isoDate) return "N/A";
  return new Date(isoDate).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

// Trier et formater les performances
const sortedPerformances = computed(() => {
  return performances.value
    .map((perf) => ({
      ...perf,
      config: distanceConfig[perf.distance],
    }))
    .filter((perf) => perf.config) // Filtrer uniquement les distances configurées
    .sort((a, b) => a.config.order - b.config.order);
});

// Récupérer les meilleures performances
const fetchBestPerformances = async () => {
  loading.value = true;
  error.value = null;

  const { data, error: fetchError, execute } = useFetchJson({
    url: "/api/users/best-performances",
    method: "GET",
    immediate: false,
  });

  await execute();

  if (!fetchError.value && data.value && data.value.data) {
    performances.value = data.value.data;
  } else {
    error.value = fetchError.value;
    console.error("Error fetching best performances:", fetchError.value);
  }

  loading.value = false;
};

onMounted(() => {
  fetchBestPerformances();
});
</script>

<template>
  <div class="w-full">
    <!-- État de chargement -->
    <div v-if="loading" class="text-center py-4">
      <p class="text-sm text-secondary">Chargement...</p>
    </div>

    <!-- État d'erreur -->
    <div v-else-if="error" class="text-center py-4">
      <p class="text-sm text-red-600">Erreur lors du chargement des performances</p>
    </div>

    <!-- Liste des performances -->
    <div v-else class="space-y-3">
      <div
        v-for="perf in sortedPerformances"
        :key="perf._id"
        class="border border-separation rounded-lg p-4 hover:shadow-sm transition-shadow"
      >
        <div class="flex justify-between items-start mb-3">
          <div>
            <h4 class="font-semibold text-lg">{{ perf.config.label }}</h4>
            <p class="text-xs text-secondary mt-1">
              {{ formatDate(perf.bestPerformance?.date) }}
            </p>
          </div>
          <div class="text-right">
            <p class="font-bold text-xl text-primary">
              {{ formatChrono(perf.bestPerformance?.chrono) }}
            </p>
          </div>
        </div>

        <div class="flex justify-between items-center pt-3 border-t border-separation">
          <div class="text-center">
            <p class="text-xs text-secondary">Allure</p>
            <p class="text-sm font-medium">
              {{ calculatePace(perf.bestPerformance?.chrono, perf.distance) }}
            </p>
          </div>
          <div class="text-center">
            <p class="text-xs text-secondary">Distance</p>
            <p class="text-sm font-medium">
              {{ (perf.distance / 1000).toFixed(perf.distance === 21097.5 ? 1 : 0) }} km
            </p>
          </div>
        </div>
      </div>

      <!-- Message si aucune performance -->
      <div v-if="sortedPerformances.length === 0" class="text-center py-8">
        <p class="text-sm text-secondary">Aucune performance enregistrée</p>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
