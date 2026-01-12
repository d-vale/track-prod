<script setup>
const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  choices: {
    type: Array,
    required: true,
    validator: (value) => {
      return value.every(choice =>
        typeof choice.label === 'string'
      );
    }
  }
});

const emit = defineEmits(['select', 'close']);

const handleChoice = (choice, index) => {
  emit('select', { choice, index });
  emit('close');
};

const handleBackdropClick = (e) => {
  if (e.target === e.currentTarget) {
    emit('close');
  }
};
</script>

<template>
  <Transition name="modal">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm px-4 modal-backdrop"
      @click="handleBackdropClick"
    >
      <div class="modal-content rounded-lg shadow-xl max-w-md w-full p-6 transform transition-all">
        <!-- Titre -->
        <h3 class="text-lg font-bold modal-title mb-6">
          {{ title }}
        </h3>

        <!-- Choix -->
        <div class="flex flex-col gap-3">
          <button
            v-for="(choice, index) in choices"
            :key="index"
            @click="handleChoice(choice, index)"
            class="flex items-center gap-4 px-4 py-4 text-left modal-choice rounded-lg hover:opacity-80 transition-opacity group"
          >
            <!-- Icône -->
            <div class="flex items-center justify-center w-12 h-12 modal-icon rounded-full shadow-sm group-hover:shadow-md transition-shadow">
              <div v-html="choice.icon" class="w-6 h-6"></div>
            </div>
            <!-- Label -->
            <span class="text-sm font-medium modal-label">
              {{ choice.label }}
            </span>
          </button>
        </div>

        <!-- Bouton annuler -->
        <div class="mt-6 flex justify-end">
          <button
            @click="emit('close')"
            class="px-4 py-2 text-sm font-medium modal-button rounded-lg hover:opacity-80 transition-opacity"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.modal-backdrop {
  background-color: rgba(var(--base-rgb, 255, 255, 255), 0.2);
}

.modal-content {
  background-color: var(--base);
  border: 1px solid var(--separation-grise-opacity);
}

.modal-title {
  color: var(--noir);
}

.modal-choice {
  background-color: var(--base);
  border: 1px solid var(--separation-grise-opacity);
}

.modal-icon {
  background-color: var(--base);
  border: 1px solid var(--separation-grise-opacity);
  color: var(--noir);
}

.modal-label {
  color: var(--noir);
}

.modal-button {
  color: var(--noir);
  background-color: var(--base);
  border: 1px solid var(--separation-grise-opacity);
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
  transition: transform 0.2s ease;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.95);
}
</style>
