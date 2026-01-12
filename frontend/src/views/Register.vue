<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useFetchJson } from "@/composables/useFetchJson";

const router = useRouter();
const username = ref("");
const firstname = ref("");
const lastname = ref("");
const email = ref("");
const password = ref("");
const passwordConfirm = ref("");
const age = ref("");
const weight = ref("");
const errorMessage = ref("");

const { data, error, execute } = useFetchJson({
  url: "/api/auth/create-account",
  method: "POST",
  immediate: false,
});

const handleRegister = async () => {
  errorMessage.value = "";
  
  // Validation basique
  if (!username.value || !firstname.value || !lastname.value || !email.value || !password.value || !age.value || !weight.value) {
    errorMessage.value = "Veuillez remplir tous les champs";
    return;
  }

  // Validation username (3-30 caractères)
  if (username.value.length < 3 || username.value.length > 30) {
    errorMessage.value = "Le nom d'utilisateur doit contenir entre 3 et 30 caractères";
    return;
  }

  // Validation firstname (2-50 caractères)
  if (firstname.value.length < 2 || firstname.value.length > 50) {
    errorMessage.value = "Le prénom doit contenir entre 2 et 50 caractères";
    return;
  }

  // Validation lastname (2-50 caractères)
  if (lastname.value.length < 2 || lastname.value.length > 50) {
    errorMessage.value = "Le nom doit contenir entre 2 et 50 caractères";
    return;
  }

  // Validation password (>= 10 caractères)
  if (password.value.length < 10) {
    errorMessage.value = "Le mot de passe doit contenir au moins 10 caractères";
    return;
  }

  if (password.value !== passwordConfirm.value) {
    errorMessage.value = "Les mots de passe ne correspondent pas";
    return;
  }

  // Validation age (13-120)
  const ageNum = parseInt(age.value);
  if (ageNum < 13 || ageNum > 120) {
    errorMessage.value = "L'âge doit être entre 13 et 120 ans";
    return;
  }

  // Validation weight (0-500)
  const weightNum = parseFloat(weight.value);
  if (weightNum < 0 || weightNum > 500) {
    errorMessage.value = "Le poids doit être entre 0 et 500 kg";
    return;
  }

  console.log("Envoi de l'inscription avec les données:", {
    username: username.value,
    firstname: firstname.value,
    lastname: lastname.value,
    email: email.value,
    age: ageNum,
    weight: weightNum,
  });

  await execute({
    email: email.value,
    password: password.value,
    username: username.value,
    firstname: firstname.value,
    lastname: lastname.value,
    weight: weightNum,
    age: ageNum,
  });

  console.log("Réponse de l'API - Data:", data.value, "Error:", error.value);

  if (data.value?.success) {
    router.push({ path: "/login", query: { registered: "true" } });
  } else if (error.value) {
    console.error(`Erreur API: ${error.value.status} - ${error.value.statusText}`);
    errorMessage.value = `Erreur ${error.value.status}: ${error.value.statusText}. Vérifiez que l'API est accessible.`;
  } else if (data.value?.data?.error) {
    console.error(`Erreur serveur: ${data.value.data.error.code} - ${data.value.data.error.message}`);
    errorMessage.value = data.value.data.error.message;
  } else if (data.value) {
    console.error("Réponse inattendue:", data.value);
    errorMessage.value = "Une erreur est survenue lors de l'inscription";
  }
};
</script>

<template>
  <div class="flex flex-col items-center gap-8 min-h-screen justify-center">
    <img class="h-10" src="/logo.svg" alt="" />
    <div class="flex flex-col items-center gap-2">
      <h2 class="text-2xl font-medium leading-tight">Créer un compte</h2>
      <p class="text-md leading-tight text-gray-400 font-light">Bienvenue sur tracks, veuillez créer votre compte</p>
    </div>

    <form
      @submit.prevent="handleRegister()"
      class="flex flex-col gap-4 w-full px-2 max-w-sm"
    >
      <div v-if="errorMessage" class="p-3 bg-red-900 border border-red-700 rounded-lg text-red-100 text-sm">
        {{ errorMessage }}
      </div>
      <input
        type="text"
        v-model="username"
        placeholder="Nom d'utilisateur"
        class="px-4 py-2 rounded-lg border border-gray-600 bg-transparent focus:outline-none focus:border-indigo-500"
      />
      <input
        type="text"
        v-model="firstname"
        placeholder="Prénom"
        class="px-4 py-2 rounded-lg border border-gray-600 bg-transparent focus:outline-none focus:border-indigo-500"
      />
      <input
        type="text"
        v-model="lastname"
        placeholder="Nom"
        class="px-4 py-2 rounded-lg border border-gray-600 bg-transparent focus:outline-none focus:border-indigo-500"
      />
      <input
        type="email"
        v-model="email"
        placeholder="Email"
        class="px-4 py-2 rounded-lg border border-gray-600 bg-transparent focus:outline-none focus:border-indigo-500"
      />
      <input
        type="number"
        v-model="age"
        placeholder="Âge"
        min="14"
        max="100"
        class="px-4 py-2 rounded-lg border border-gray-600 bg-transparent focus:outline-none focus:border-indigo-500"
      />
      <input
        type="number"
        v-model="weight"
        placeholder="Poids"
        min="1"
        max="120"
        class="px-4 py-2 rounded-lg border border-gray-600 bg-transparent focus:outline-none focus:border-indigo-500"
      />
      <input
        type="password"
        v-model="password"
        placeholder="Mot de passe (≥ 10 caractères)"
        class="px-4 py-2 rounded-lg border border-gray-600 bg-transparent focus:outline-none focus:border-indigo-500"
      />
      <input
        type="password"
        v-model="passwordConfirm"
        placeholder="Confirmer le mot de passe"
        class="px-4 py-2 rounded-lg border border-gray-600 bg-transparent focus:outline-none focus:border-indigo-500"
      />
      <button
        type="submit"
        class="rounded-lg border border-transparent px-5 py-2.5 text-base font-medium bg-gray-800 dark:bg-[#1a1a1a] text-white cursor-pointer transition-colors hover:border-[#646cff]"
      >
        S'inscrire
      </button>
    </form>
    <p class="text-sm text-gray-400">
      Vous avez déjà un compte?
      <router-link to="/login" class="text-indigo-500 hover:text-indigo-400">
        Se connecter
      </router-link>
    </p>
  </div>
</template>

<style scoped></style>
