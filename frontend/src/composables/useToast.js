import { ref } from 'vue';

const toasts = ref([]);
let toastIdCounter = 0;

export function useToast() {
  const addToast = (message, type = 'success', duration = 3000) => {
    const id = toastIdCounter++;
    const toast = {
      id,
      message,
      type, // 'success', 'error', 'info'
      visible: true
    };

    toasts.value.push(toast);

    // Auto-remove après la durée spécifiée
    setTimeout(() => {
      removeToast(id);
    }, duration);

    return id;
  };

  const removeToast = (id) => {
    const index = toasts.value.findIndex(t => t.id === id);
    if (index !== -1) {
      toasts.value.splice(index, 1);
    }
  };

  return {
    toasts,
    addToast,
    removeToast
  };
}
