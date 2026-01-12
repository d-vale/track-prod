<script setup>
const props = defineProps({
  laps: {
    type: Array,
    required: true,
  },
});

// Calculer la largeur relative de la barre orange
const getBarWidth = (lap, allLaps) => {
  if (!lap.pace || allLaps.length === 0) return 50;

  // Convertir les paces (format "5:02") en secondes pour comparaison
  const paceToSeconds = (paceStr) => {
    if (!paceStr) return 0;
    const [min, sec] = paceStr.split(':').map(Number);
    return min * 60 + sec;
  };

  const paces = allLaps.map((l) => paceToSeconds(l.pace));
  const maxPace = Math.max(...paces);
  const minPace = Math.min(...paces);

  if (maxPace === minPace) return 100;

  const currentPace = paceToSeconds(lap.pace);

  // Calculer un pourcentage entre 40% et 100% pour avoir une visualisation significative
  // Plus le pace est élevé (plus lent), plus la barre est longue
  const percentage =
    ((currentPace - minPace) / (maxPace - minPace)) * 60 + 40;
  return Math.round(percentage);
};
</script>

<template>
  <div class="w-full inline-flex flex-col justify-start items-start">
    <!-- Titre de la section -->
    <h3 class="text-lg font-bold mb-2">Allure</h3>

    <!-- En-tête du tableau -->
    <div
      class="self-stretch p-2.5 border-b border-separation inline-flex justify-between items-center"
    >
      <div class="pl-1.5 flex justify-start items-center gap-8">
        <div class="text-center justify-center text-[10px] font-medium leading-4">
          Km
        </div>
        <div class="text-center justify-center text-[10px] font-medium leading-4">
          Allure
        </div>
      </div>
      <div class="flex justify-end items-center gap-5">
        <div class="w-16 text-left justify-center text-[10px] font-medium leading-4">
          Rythme
        </div>
        <div class="w-9 text-center justify-center text-[10px] font-medium leading-4">
          D+
        </div>
        <div class="w-9 text-center justify-center text-[10px] font-medium leading-4">
          D-
        </div>
      </div>
    </div>

    <!-- Lignes du tableau -->
    <div
      v-for="(lap, index) in laps"
      :key="index"
      class="self-stretch p-2.5 inline-flex justify-between items-center border-b border-separation last:border-b-0"
      :class="{ 'pt-4': index === 0 }"
    >
      <!-- Kilomètre et Allure -->
      <div class="w-20 pl-2 flex justify-start items-center gap-10">
        <div class="text-center justify-center text-xs font-semibold leading-4">
          {{ index + 1 }}
        </div>
        <div class="text-center justify-center text-xs font-semibold leading-4">
          {{ lap.pace || "--:--" }}
        </div>
      </div>

      <!-- Barre de visualisation et statistiques -->
      <div class="flex justify-end items-center gap-5">
        <!-- Barre de visualisation -->
        <div class="w-16 rounded-[5px] inline-flex flex-col justify-center items-start">
          <div
            class="h-5 rounded bg-(--orange)"
            :style="{ width: `${getBarWidth(lap, laps)}%` }"
          ></div>
        </div>

        <!-- D+ -->
        <div class="w-9 text-center text-xs font-semibold leading-4">
          {{ Math.round(lap.elevationGain || 0) }}
        </div>

        <!-- D- -->
        <div class="w-9 text-center text-xs font-semibold leading-4">
          {{ Math.round(lap.elevationLoss || 0) }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
