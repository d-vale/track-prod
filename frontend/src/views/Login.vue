<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useFetchJson } from "@/composables/useFetchJson";
import { setDefaultHeaders } from "@/libs/fetchJson";
import { connect } from "../../websocket.mjs";
import { useToast } from "@/composables/useToast";
import ToastNotification from "@/components/ToastNotification.vue";

const route = useRoute();
const router = useRouter();
const { addToast } = useToast();
const email = ref("");
const password = ref("");

// Vérifier si on vient de la page register avec succès
onMounted(() => {
  if (route.query.registered === "true") {
    addToast("Compte créé avec succès! Vous pouvez maintenant vous connecter.", "success", 4000);
    // Nettoyer le paramètre de l'URL
    router.replace({ query: {} });
  }
});

const { data, error, execute } = useFetchJson({
  url: "/api/auth/login",
  method: "POST",
  immediate: false,
});

const handleLogin = async () => {
  await execute({
    email: email.value,
    password: password.value,
  });

  if (data.value?.success) {
    const token = data.value.data.token;
    localStorage.setItem("token", token);
    setDefaultHeaders({ Authorization: `Bearer ${token}` });
    connect(); // websocket connection
    router.push("/home");
  } else if (error.value) {
    console.error(
      `ERROR : ${error.value.status} - MESSAGE : ${error.value.statusText}`
    );
    addToast("Nom d'utilisateur ou mot de passe erroné", "error", 4000);
  } else if (data.value) {
    console.error(
      `ERROR : ${data.value.data.error.code} - MESSAGE : ${data.value.data.error.message}`
    );
    addToast("Nom d'utilisateur ou mot de passe erroné", "error", 4000);
  }
};
</script>

<template>
  <div class="flex flex-col items-center gap-8 min-h-screen justify-center">
    <ToastNotification />
    <img class="h-10" src="/logo.svg" alt="" />
    <div class="flex flex-col items-center gap-2">
      <h2 class="text-2xl font-medium leading-tight">Se connecter</h2>
      <p class="text-md leading-tight text-gray-400 font-light">Veuillez entrer vos identifiants</p>
    </div>

    <form
      @submit.prevent="handleLogin()"
      class="flex flex-col gap-4 w-full px-2 max-w-sm"
    >
      <input
        type="email"
        v-model="email"
        placeholder="Email"
        class="px-4 py-2 rounded-lg border border-gray-600 bg-transparent focus:outline-none focus:border-indigo-500"
      />
      <input
        type="password"
        v-model="password"
        placeholder="Password"
        class="px-4 py-2 rounded-lg border border-gray-600 bg-transparent focus:outline-none focus:border-indigo-500"
      />
      <button
        type="submit"
        class="rounded-lg border border-transparent px-5 py-2.5 text-base font-medium bg-gray-800 dark:bg-[#1a1a1a] text-white cursor-pointer transition-colors hover:border-[#646cff]"
      >
        Login
      </button>
    </form>
    <p class="text-sm text-gray-400">
      Vous n'avez pas de compte?
      <router-link to="/register" class="text-indigo-500 hover:text-indigo-400">
        En créer un
      </router-link>
    </p>
  </div>
</template>

<style scoped></style>
