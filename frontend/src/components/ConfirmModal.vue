<script setup>
const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    default: 'Confirmation'
  },
  message: {
    type: String,
    required: true
  },
  confirmText: {
    type: String,
    default: 'Confirmer'
  },
  cancelText: {
    type: String,
    default: 'Annuler'
  },
  confirmClass: {
    type: String,
    default: 'bg-red-500 hover:bg-red-600'
  }
});

const emit = defineEmits(['confirm', 'cancel', 'close']);

const handleConfirm = () => {
  emit('confirm');
  emit('close');
};

const handleCancel = () => {
  emit('cancel');
  emit('close');
};

const handleBackdropClick = (e) => {
  if (e.target === e.currentTarget) {
    handleCancel();
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
        <h3 class="text-lg font-bold modal-title mb-4">
          {{ title }}
        </h3>

        <!-- Message -->
        <p class="text-sm modal-text mb-6">
          {{ message }}
        </p>

        <!-- Boutons d'action -->
        <div class="flex gap-3 justify-end">
          <button
            @click="handleCancel"
            class="px-4 py-2 text-sm font-medium modal-button rounded-lg hover:opacity-80 transition-opacity"
          >
            {{ cancelText }}
          </button>
          <button
            @click="handleConfirm"
            :class="['px-4 py-2 text-sm font-medium text-white rounded-lg transition-opacity hover:opacity-90', confirmClass]"
          >
            {{ confirmText }}
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

.modal-text {
  color: var(--secondary);
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
