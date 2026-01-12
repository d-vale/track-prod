<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import ActivityDetailNav from "@/components/ActivityDetailNav.vue";
import ToastNotification from "@/components/ToastNotification.vue";
import LapsTable from "@/components/LapsTable.vue";
import ConfirmModal from "@/components/ConfirmModal.vue";
import ChoiceModal from "@/components/ChoiceModal.vue";
import MapViewer from "@/components/MapViewer.vue";
import ActivityStats from "@/components/ActivityStats.vue";
import { useFetchJson } from "../composables/useFetchJson.js";
import { useToast } from "@/composables/useToast.js";
import { uploadAndAddMediaToActivity, getActivityMedias, deleteMediaFromActivity } from "@/helpers/mediaHelper.js";

const route = useRoute();
const router = useRouter();
const { addToast } = useToast();

// ID de l'activité depuis les paramètres de l'URL
const activityId = route.params.id;

// État de l'activité
const activity = ref(null);
const loading = ref(true);
const activityMedias = ref([]); // Médias de l'activité

// État des modales
const showDeleteModal = ref(false);
const showPhotoModal = ref(false);

// Refs pour les inputs file
const fileInputRef = ref(null);
const cameraInputRef = ref(null);
const isUploading = ref(false);

// Options pour le modal de photo
const photoChoices = [
  {
    label: "Importer une photo",
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M17 8L12 3L7 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M12 3V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
  },
  {
    label: "Prendre une photo",
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21071 2.46957 6 3 6H7L9 3H15L17 6H21C21.5304 6 22.0391 6.21071 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="12" cy="13" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
  },
];

// Fetch de l'activité spécifique
const { data, error, execute } = useFetchJson({
  url: `/api/activities/${activityId}`,
  method: "GET",
  immediate: false,
});

// Fetch pour la suppression de l'activité
const {
  data: deleteData,
  error: deleteError,
  execute: executeDelete
} = useFetchJson({
  url: `/api/activities/${activityId}`,
  method: "DELETE",
  immediate: false,
});

// URLs des médias (photos) de l'activité
const mediaUrls = computed(() => {
  if (!activityMedias.value || !Array.isArray(activityMedias.value) || activityMedias.value.length === 0) {
    return [];
  }
  // Les médias retournés sont directement des URLs (strings)
  // Si c'est un objet, on essaie de récupérer mediaUrl ou url
  const urls = activityMedias.value.map(media => {
    if (typeof media === 'string') {
      return media;
    }
    return media.mediaUrl || media.url || media;
  });
  console.log('URLs des médias:', urls);
  return urls;
});

// Charger les médias de l'activité
const loadActivityMedias = async () => {
  try {
    const response = await getActivityMedias(activityId);

    // L'API retourne { success: true, data: { medias: [...] } }
    let medias = [];
    if (response && response.data && Array.isArray(response.data.medias)) {
      medias = response.data.medias;
    } else if (Array.isArray(response)) {
      medias = response;
    } else if (response && Array.isArray(response.data)) {
      medias = response.data;
    } else if (response && response.medias && Array.isArray(response.medias)) {
      medias = response.medias;
    }

    console.log('Médias chargés:', medias);
    activityMedias.value = medias;
  } catch (error) {
    console.error('Erreur lors du chargement des médias:', error);
    activityMedias.value = [];
  }
};

// Charger l'activité
onMounted(async () => {
  loading.value = true;
  await execute();

  if (data.value) {
    // L'API retourne { success: true, data: {...} }
    activity.value = data.value.data || data.value;
  }
  console.log('Activité:', activity.value);

  // Charger les médias
  await loadActivityMedias();

  loading.value = false;
});

// Retour à la page précédente
const goBack = () => {
  router.back();
};

// Ouvrir le modal de suppression
const openDeleteModal = () => {
  showDeleteModal.value = true;
};

// Ouvrir le modal de photo
const openPhotoModal = () => {
  showPhotoModal.value = true;
};

// Confirmer la suppression de l'activité
const confirmDelete = async () => {
  try {
    console.log(`Envoi de la requête DELETE pour l'activité ${activityId}`);

    await executeDelete();

    console.log('Réponse DELETE:', {
      deleteData: deleteData.value,
      deleteError: deleteError.value
    });

    if (deleteError.value) {
      console.error('Échec de la suppression:', deleteError.value);
      addToast("Erreur lors de la suppression de l'activité", "error");
    } else {
      console.log('Suppression réussie, redirection vers /home');
      router.push({ path: "/home", query: { deleted: "true" } });
    }
  } catch (err) {
    console.error("Erreur lors de la suppression:", err);
    addToast("Erreur lors de la suppression de l'activité", "error");
  }
};

// Gérer le choix de photo
const handlePhotoChoice = ({ choice, index }) => {
  if (index === 0) {
    // Importer une photo
    handleImportPhoto();
  } else if (index === 1) {
    // Prendre une photo
    handleTakePhoto();
  }
};

// Fonction pour importer une photo
const handleImportPhoto = () => {
  fileInputRef.value.click();
};

// Fonction pour prendre une photo
const handleTakePhoto = () => {
  cameraInputRef.value.click();
};

// Gérer la sélection d'un fichier (import)
const onFileSelected = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  try {
    isUploading.value = true;
    await uploadAndAddMediaToActivity(file, activityId);
    addToast("Photo ajoutée avec succès", "success");
    // Recharger les médias pour afficher la nouvelle photo
    await loadActivityMedias();
  } catch (error) {
    console.error("Erreur lors de l'upload:", error);
    addToast("Erreur lors de l'ajout de la photo", "error");
  } finally {
    isUploading.value = false;
    event.target.value = '';
  }
};

// Gérer la capture d'une photo (caméra)
const onCameraCapture = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  try {
    isUploading.value = true;
    await uploadAndAddMediaToActivity(file, activityId);
    addToast("Photo ajoutée avec succès", "success");
    // Recharger les médias pour afficher la nouvelle photo
    await loadActivityMedias();
  } catch (error) {
    console.error("Erreur lors de l'upload:", error);
    addToast("Erreur lors de l'ajout de la photo", "error");
  } finally {
    isUploading.value = false;
    event.target.value = '';
  }
};

// Gérer la suppression d'une photo depuis le composant MapViewer
const handleDeletePhoto = async (photoUrl, photoIndex) => {
  try {
    await deleteMediaFromActivity(activityId, photoUrl);
    addToast("Photo supprimée avec succès", "success");
    // Recharger les médias
    await loadActivityMedias();
  } catch (error) {
    console.error("Erreur lors de la suppression de la photo:", error);
    addToast("Erreur lors de la suppression de la photo", "error");
  }
};
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <ToastNotification />

    <!-- Inputs file invisibles -->
    <input
      ref="fileInputRef"
      type="file"
      accept="image/*"
      class="hidden"
      @change="onFileSelected"
    />
    <input
      ref="cameraInputRef"
      type="file"
      accept="image/*"
      capture
      class="hidden"
      @change="onCameraCapture"
    />

    <!-- Modales -->
    <ConfirmModal
      :is-open="showDeleteModal"
      title="Supprimer l'activité"
      message="Êtes-vous sûr de vouloir supprimer cette activité ? Cette action est irréversible."
      confirm-text="Supprimer"
      cancel-text="Annuler"
      confirm-class="bg-red-500 hover:bg-red-600"
      @confirm="confirmDelete"
      @close="showDeleteModal = false"
    />

    <ChoiceModal
      :is-open="showPhotoModal"
      title="Ajouter une photo"
      :choices="photoChoices"
      @select="handlePhotoChoice"
      @close="showPhotoModal = false"
    />

    <!-- État de chargement -->
    <div v-if="loading" class="flex-1 flex items-center justify-center">
      <p class="text-sm font-medium">Chargement de l'activité...</p>
    </div>

    <!-- État d'erreur -->
    <div
      v-else-if="error"
      class="flex-1 flex items-center justify-center text-red-600"
    >
      <div class="text-center">
        <p class="text-sm font-medium mb-4">
          {{
            typeof error === "string"
              ? error
              : "Erreur lors du chargement de l'activité"
          }}
        </p>
        <button
          @click="goBack"
          class="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
        >
          Retour
        </button>
      </div>
    </div>

    <!-- Détail de l'activité -->
    <div v-else-if="activity" class="flex-1 pb-20">
      <!-- Image de la carte avec navigation en overlay -->
      <div class="relative w-full">
        <!-- Barre de navigation en position absolue -->
        <div class="absolute top-4 left-0 right-0 z-10">
          <ActivityDetailNav
            :on-back="goBack"
            :on-delete="openDeleteModal"
            :on-camera="openPhotoModal"
          />
        </div>

        <!-- Composant MapViewer pour la carte et le carrousel -->
        <MapViewer
          :encoded-polyline="activity.encodedPolyline"
          :photos="mediaUrls"
          @delete-photo="handleDeletePhoto"
        />
      </div>

      <!-- Composant ActivityStats pour les statistiques -->
      <ActivityStats :activity="activity" />

      <!-- Tableau des laps -->
      <div v-if="activity.laps && activity.laps.length > 0" class="px-6 py-6">
        <LapsTable :laps="activity.laps" />
      </div>
    </div>
  </div>
</template>
