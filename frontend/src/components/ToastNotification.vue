<script setup>
import { useToast } from '@/composables/useToast';

const { toasts, removeToast } = useToast();
</script>

<template>
  <div class="fixed top-20 right-4 z-[9999] flex flex-col gap-2">
    <TransitionGroup name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="[
          'min-w-[280px] max-w-[400px] px-4 py-3 rounded-lg shadow-lg flex items-center gap-3',
          'backdrop-blur-sm transition-all duration-300',
          {
            'bg-green-500/90 text-white': toast.type === 'success',
            'bg-red-500/90 text-white': toast.type === 'error',
            'bg-blue-500/90 text-white': toast.type === 'info'
          }
        ]"
      >
        <!-- Icône -->
        <div class="flex-shrink-0">
          <svg
            v-if="toast.type === 'success'"
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
          <svg
            v-else-if="toast.type === 'error'"
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
          <svg
            v-else
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <!-- Message -->
        <span class="flex-1 text-sm font-medium">{{ toast.message }}</span>

        <!-- Bouton fermer -->
        <button
          @click="removeToast(toast.id)"
          class="flex-shrink-0 hover:opacity-70 transition-opacity"
          aria-label="Fermer"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
