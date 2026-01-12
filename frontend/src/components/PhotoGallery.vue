<script setup>
import { ref, computed } from 'vue';
import ConfirmModal from './ConfirmModal.vue';

const props = defineProps({
  photos: {
    type: Array,
    required: true,
    default: () => []
  },
  initialIndex: {
    type: Number,
    default: 0
  }
});

const emit = defineEmits(['delete-photo']);

// État local
const currentPhotoIndex = ref(props.initialIndex);
const showDeletePhotoModal = ref(false);
const touchStartX = ref(0);
const touchEndX = ref(0);

// Photo actuelle
const currentPhotoUrl = computed(() => {
  if (props.photos.length === 0) return null;
  return props.photos[currentPhotoIndex.value];
});

// Navigation dans le carrousel
const nextPhoto = () => {
  if (currentPhotoIndex.value < props.photos.length - 1) {
    currentPhotoIndex.value++;
  }
};

const previousPhoto = () => {
  if (currentPhotoIndex.value > 0) {
    currentPhotoIndex.value--;
  }
};

// Gestion du swipe pour mobile
const handleTouchStart = (e) => {
  touchStartX.value = e.touches[0].clientX;
};

const handleTouchMove = (e) => {
  touchEndX.value = e.touches[0].clientX;
};

const handleTouchEnd = () => {
  const swipeThreshold = 50;
  const diff = touchStartX.value - touchEndX.value;

  if (Math.abs(diff) > swipeThreshold) {
    if (diff > 0) {
      nextPhoto();
    } else {
      previousPhoto();
    }
  }

  touchStartX.value = 0;
  touchEndX.value = 0;
};

// Suppression de photo
const openDeletePhotoModal = () => {
  showDeletePhotoModal.value = true;
};

const confirmDeletePhoto = () => {
  emit('delete-photo', currentPhotoUrl.value, currentPhotoIndex.value);
  showDeletePhotoModal.value = false;

  // Ajuster l'index si nécessaire
  if (currentPhotoIndex.value >= props.photos.length - 1 && currentPhotoIndex.value > 0) {
    currentPhotoIndex.value--;
  }
};
</script>

<template>
  <div
    class="relative w-full h-96 bg-black"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
  >
    <!-- Photo actuelle -->
    <img
      :src="currentPhotoUrl"
      :alt="`Photo ${currentPhotoIndex + 1}`"
      class="w-full h-full object-cover"
    />

    <!-- Bouton de suppression -->
    <button
      @click.stop="openDeletePhotoModal"
      @touchstart.stop
      @touchmove.stop
      @touchend.stop
      class="absolute bottom-4 right-4 bg-red-500/80 hover:bg-red-600/90 text-white rounded-full p-3 transition-all duration-200 active:scale-95 shadow-lg z-30 backdrop-blur-sm"
      aria-label="Supprimer la photo"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M3 6H5H21"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M10 11V17"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M14 11V17"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>

    <!-- Boutons de navigation (desktop) -->
    <button
      v-if="currentPhotoIndex > 0"
      @click="previousPhoto"
      class="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-3 transition-all duration-200 active:scale-95 md:block hidden z-20"
      aria-label="Photo précédente"
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M15 18L9 12L15 6"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>

    <button
      v-if="currentPhotoIndex < photos.length - 1"
      @click="nextPhoto"
      class="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-3 transition-all duration-200 active:scale-95 md:block hidden z-20"
      aria-label="Photo suivante"
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M9 18L15 12L9 6"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>

    <!-- Indicateur de position -->
    <div class="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium md:text-sm text-xs md:px-3 md:py-1 px-2 py-0.5 z-20">
      {{ currentPhotoIndex + 1 }} / {{ photos.length }}
    </div>

    <!-- Modal de confirmation de suppression -->
    <ConfirmModal
      :is-open="showDeletePhotoModal"
      title="Supprimer la photo"
      message="Êtes-vous sûr de vouloir supprimer cette photo ? Cette action est irréversible."
      confirm-text="Supprimer"
      cancel-text="Annuler"
      confirm-class="bg-red-500 hover:bg-red-600"
      @confirm="confirmDeletePhoto"
      @close="showDeletePhotoModal = false"
    />
  </div>
</template>
