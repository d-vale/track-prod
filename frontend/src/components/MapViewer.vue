<script setup>
import { ref, computed } from 'vue';
import PhotoGallery from './PhotoGallery.vue';
import polyline from '@mapbox/polyline';

const props = defineProps({
  encodedPolyline: {
    type: String,
    default: null
  },
  photos: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['delete-photo']);

const TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
const showingPhotos = ref(false);

// Générer l'URL de l'image statique Mapbox
const getStaticMapUrl = (encodedPolyline) => {
  if (!encodedPolyline) return null;

  try {
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

    const latDiff = maxLat - minLat;
    const lngDiff = maxLng - minLng;
    const maxDiff = Math.max(latDiff, lngDiff);

    let zoom = 13;
    if (maxDiff > 0.1) zoom = 11;
    if (maxDiff > 0.2) zoom = 10;
    if (maxDiff > 0.5) zoom = 9;
    if (maxDiff < 0.05) zoom = 14;
    if (maxDiff < 0.01) zoom = 15;

    const pathEncoded = encodeURIComponent(
      `path-3+FF8C00-0.9(${encodedPolyline})`
    );
    const width = 1200;
    const height = 800;
    const url = `https://api.mapbox.com/styles/v1/mapbox/outdoors-v12/static/${pathEncoded}/auto/${width}x${height}@2x?access_token=${TOKEN}&attribution=false&logo=false`;

    return url;
  } catch (err) {
    console.error('Erreur lors de la génération de l\'URL de la carte:', err);
    return null;
  }
};

// Image de la carte
const mapImageUrl = computed(() => {
  if (props.encodedPolyline) {
    return getStaticMapUrl(props.encodedPolyline);
  }
  return null;
});

// Vérifier si l'activité a des photos
const hasPhotos = computed(() => props.photos.length > 0);

// Basculer entre la carte et le carrousel de photos
const toggleView = () => {
  showingPhotos.value = !showingPhotos.value;
};

// Gérer la suppression de photo
const handleDeletePhoto = (photoUrl, photoIndex) => {
  emit('delete-photo', photoUrl, photoIndex);

  // Si plus de photos, revenir à la carte
  if (props.photos.length === 1) {
    showingPhotos.value = false;
  }
};
</script>

<template>
  <div class="relative w-full">
    <!-- Mode Carte -->
    <div v-if="!showingPhotos && mapImageUrl" class="w-full">
      <img
        :src="mapImageUrl"
        alt="Carte de l'activité"
        class="w-full h-96 object-cover"
      />
    </div>
    <div
      v-else-if="!showingPhotos && !mapImageUrl"
      class="w-full h-96 bg-gray-200 flex items-center justify-center"
    >
      <p class="text-gray-500">Carte non disponible</p>
    </div>

    <!-- Mode Carrousel de photos -->
    <PhotoGallery
      v-if="showingPhotos && hasPhotos"
      :photos="photos"
      @delete-photo="handleDeletePhoto"
    />

    <!-- Miniature d'aperçu en bas à gauche (seulement si il y a des photos) -->
    <div
      v-if="hasPhotos"
      @click="toggleView"
      class="absolute bottom-4 left-4 w-20 h-20 rounded-lg overflow-hidden cursor-pointer select-none shadow-lg border-2 border-white hover:scale-105 hover:shadow-2xl transition-all duration-200 z-20"
    >
      <!-- Afficher la miniature de la première photo si on est en mode carte -->
      <img
        v-if="!showingPhotos"
        :src="photos[0]"
        alt="Aperçu photos"
        class="w-full h-full object-cover"
      />
      <!-- Afficher la miniature de la carte si on est en mode carrousel -->
      <img
        v-else-if="mapImageUrl"
        :src="mapImageUrl"
        alt="Aperçu carte"
        class="w-full h-full object-cover"
      />
    </div>
  </div>
</template>
