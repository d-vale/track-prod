<script setup>
import {
  users_count_connected,
  total_km_ever,
  total_activities_ever,
  total_elevation_ever,
  total_users_community,
  total_time_ever
} from "../../websocket.mjs";
</script>

<template>
    <div class="w-full px-2.5 pb-4 inline-flex flex-col justify-start items-start gap-2.5">
    <div class="py-2.5 flex justify-start items-center gap-2.5">
        <div class="text-center justify-center text-noir text-xl font-semibold leading-4">Communauté</div>
    </div>

    <div class="w-full px-2.5 inline-flex justify-between items-center">
      <div class="text-center justify-center text-sm font-medium leading-4">Coureurs connectés</div>
      <div class="text-center justify-center text-(--gris-fonce) text-xs font-medium leading-4">{{ users_count_connected }}</div>
    </div>

    <div class="w-full px-2.5 inline-flex justify-between items-center">
      <div class="text-center justify-center text-sm font-medium leading-4">Membres de la communauté</div>
      <div class="text-center justify-center text-(--gris-fonce) text-xs font-medium leading-4">{{ total_users_community }}</div>
    </div>

    <div class="w-full px-2.5 inline-flex justify-between items-center">
      <div class="text-center justify-center text-sm font-medium leading-4">Nombre de kilomètres parcourus</div>
      <div class="text-center justify-center text-(--gris-fonce) text-xs font-medium leading-4">{{ total_km_ever.toFixed(2) }} km</div>
    </div>

    <div class="w-full px-2.5 inline-flex justify-between items-center">
      <div class="text-center justify-center text-sm font-medium leading-4">Dénivelé total</div>
      <div class="text-center justify-center text-(--gris-fonce) text-xs font-medium leading-4">{{ total_elevation_ever.toFixed(0) }} m</div>
    </div>

    <div class="w-full px-2.5 inline-flex justify-between items-center">
      <div class="text-center justify-center text-sm font-medium leading-4">Nombre d'activités</div>
      <div class="text-center justify-center text-(--gris-fonce) text-xs font-medium leading-4">{{ total_activities_ever }}</div>
    </div>

    <div class="w-full px-2.5 inline-flex justify-between items-center">
      <div class="text-center justify-center text-sm font-medium leading-4">Temps total</div>
      <div class="text-center justify-center text-(--gris-fonce) text-xs font-medium leading-4">{{ Math.floor(total_time_ever / 3600000) }} h {{ Math.floor((total_time_ever % 3600000) / 60000) }} min</div>
    </div>
</div>
</template>
<style scoped></style>
