<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { Sun, Moon, CircleUserRound } from 'lucide-vue-next';
import { useFetchJson } from "@/composables/useFetchJson.js";

const router = useRouter();
const user = ref(null);
const theme = ref(
  document.querySelector("body").classList.contains("dark") ? "dark" : "light"
);

const toggleTheme = () => {
  document.querySelector("body").classList.toggle("dark");
  theme.value = document.querySelector("body").classList.contains("dark")
    ? "dark"
    : "light";
  localStorage.setItem("theme", theme.value);
};

const navigate = (path) => {
  router.push(path);
};

// Récupérer les informations de l'utilisateur
const fetchUser = async () => {
  const { data, error, execute } = useFetchJson({
    url: "/api/users/user",
    method: "GET",
    immediate: false,
  });

  await execute();

  if (!error.value && data.value?.data) {
    user.value = data.value.data;
  }
};

onMounted(() => {
  fetchUser();
});
</script>

<template>
  <header class="flex justify-between items-center px-2.5 py-4">
    <div class="flex items-center gap-3">
      <svg width="29" height="29" viewBox="0 0 29 29" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M14.5 14.5H29V4.17233e-07L14.5 14.5Z" fill="var(--noir)"/>
<path d="M14.5 29H29V14.5L14.5 29Z" fill="var(--noir)"/>
<path d="M0 29H14.5V14.5L0 29Z" fill="var(--noir)"/>
<path d="M0 14.5H14.5V4.17233e-07L0 14.5Z" fill="var(--noir)"/>
</svg>
      <h2 class="text-xl font-normal">Tracks</h2>
    </div>

    <div class="flex items-center gap-3">
      <button @click="toggleTheme()" class="p-2 rounded-lg">
        <Sun v-if="theme === 'light'" :size="20" />
        <Moon v-else :size="20" />
      </button>
      <button @click="navigate('/profile')" class="p-2 rounded-lg">
        <div class="shrink-0">
            <div class="w-[29px] h-[29px] rounded-full overflow-hidden bg-(--base) flex items-center justify-center">
              <img
                v-if="user?.profilePicture"
                :src="user.profilePicture"
                alt="Photo de profil"
                class="w-full h-full object-cover"
              />
              <CircleUserRound v-else :size="18" class="text-(--noir)" />
            </div>
          </div>
      </button>

    </div>
  </header>
</template>

<style scoped></style>
