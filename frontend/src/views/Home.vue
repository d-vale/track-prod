<script setup>
import { onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import TheHeader from "@/components/TheHeader.vue";
import TheNavBar from "@/components/TheNavBar.vue";
import ActivityPreview from "@/components/ActivityPreview.vue";
import WeekPreview from "../components/WeekPreview.vue";
import CommunityWidget from "@/components/CommunityWidget.vue";
import ToastNotification from "@/components/ToastNotification.vue";
import { useToast } from "@/composables/useToast.js";
import { useFetchJson } from "@/composables/useFetchJson.js";

const route = useRoute();
const router = useRouter();
const { addToast } = useToast();

// Récupération des activités pour WeekPreview
const { data, error, execute } = useFetchJson({
  url: "/api/activities",
  method: "GET",
  immediate: false,
});

const activities = ref([]);

// Surveiller les changements de data et error
watch([data, error], () => {
  if (error.value) {
    console.error("Erreur API:", error.value);
    return;
  }

  if (data.value) {
    let activitiesArray = [];
    if (Array.isArray(data.value)) {
      activitiesArray = data.value;
    } else if (data.value.data && Array.isArray(data.value.data)) {
      activitiesArray = data.value.data;
    }
    activities.value = activitiesArray;
  }
});

// Vérifier si on revient d'une suppression
onMounted(async () => {
  await execute();
  if (route.query.deleted === "true") {
    addToast("Activité supprimée avec succès", "success");
    // Nettoyer le paramètre de l'URL
    router.replace({ query: {} });
  }
});
</script>

<template>
  <div class="flex flex-col h-screen">
    <TheHeader class="shrink-0" />
    <ToastNotification />
    <main class="flex-1 overflow-y-auto">
      <WeekPreview :activities="activities" />
      <CommunityWidget />
      <ActivityPreview />
    </main>
    <TheNavBar class="shrink-0" />
  </div>
</template>

<style scoped></style>
