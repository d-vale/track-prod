<script setup>
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

const navItems = [
  { label: 'Accueil', path: '/home', icon: 'home' },
  { label: 'Enregistrer', path: '/tracking', icon: 'tracking' },
  { label: 'Historique', path: '/history', icon: 'history' },
  { label: 'Profil', path: '/profile', icon: 'profile' }
];

const isActive = (path) => route.path === path;

const navigate = (path) => {
  router.push(path);
};

const getStrokeColor = (path) => {
  return isActive(path) ? 'var(--orange)' : 'var(--noir)';
};

</script>

<template>
  <div class="w-full bg-(--base) px-4 py-3 shadow-lg fixed bottom-0 left-0 right-0 z-50">
    <div class="flex justify-around items-center w-full">
      <!-- Accueil -->
      <button @click="navigate('/home')" class="flex flex-col justify-center items-center hover:opacity-80 transition-opacity cursor-pointer">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 sm:w-6 sm:h-6">
              <path d="M15 21V13C15 12.7348 14.8946 12.4804 14.7071 12.2929C14.5196 12.1054 14.2652 12 14 12H10C9.73478 12 9.48043 12.1054 9.29289 12.2929C9.10536 12.4804 9 12.7348 9 13V21" :stroke="getStrokeColor('/home')" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M3 10C2.99993 9.70907 3.06333 9.42163 3.18579 9.15772C3.30824 8.89382 3.4868 8.6598 3.709 8.47201L10.709 2.47201C11.07 2.16692 11.5274 1.99953 12 1.99953C12.4726 1.99953 12.93 2.16692 13.291 2.47201L20.291 8.47201C20.5132 8.6598 20.6918 8.89382 20.8142 9.15772C20.9367 9.42163 21.0001 9.70907 21 10V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V10Z" :stroke="getStrokeColor('/home')" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <div :style="{ color: isActive('/home') ? 'var(--orange)' : 'var(--noir)' }" class="text-center text-xs font-semibold font-inter mt-1">Accueil</div>
      </button>
      <!-- Enregistrer -->
      <button @click="navigate('/tracking')" class="flex flex-col justify-center items-center hover:opacity-80 transition-opacity cursor-pointer">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 sm:w-6 sm:h-6">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" :stroke="getStrokeColor('/tracking')" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 18.5C15.5899 18.5 18.5 15.5899 18.5 12C18.5 8.41015 15.5899 5.5 12 5.5C8.41015 5.5 5.5 8.41015 5.5 12C5.5 15.5899 8.41015 18.5 12 18.5Z" :fill="getStrokeColor('/tracking')"/>
          </svg>
          <div :style="{ color: isActive('/tracking') ? 'var(--orange)' : 'var(--noir)' }" class="text-center text-xs font-semibold font-inter mt-1">Enregistrer</div>
      </button>
      <!-- Profil -->
      <button @click="navigate('/profile')" class="flex flex-col justify-center items-center hover:opacity-80 transition-opacity cursor-pointer">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 sm:w-6 sm:h-6">
              <path d="M19 21V19C19 17.9391 18.5786 16.9217 17.8284 16.1716C17.0783 15.4214 16.0609 15 15 15H9C7.93913 15 6.92172 15.4214 6.17157 16.1716C5.42143 16.9217 5 17.9391 5 19V21" :stroke="getStrokeColor('/profile')" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" :stroke="getStrokeColor('/profile')" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <div :style="{ color: isActive('/profile') ? 'var(--orange)' : 'var(--noir)' }" class="text-center text-xs font-semibold font-inter mt-1">Profil</div>
      </button>
    </div>
  </div>
</template>

<style scoped>
</style>