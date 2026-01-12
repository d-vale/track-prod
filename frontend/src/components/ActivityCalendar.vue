<script setup>
import { computed } from "vue";

const props = defineProps({
  activities: {
    type: Array,
    required: false,
    default: () => [],
  },
});

const daysOfWeek = ["L", "M", "M", "J", "V", "S", "D"];

// Obtenir le nombre de jours dans le mois
const getDaysInMonth = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  return new Date(year, month + 1, 0).getDate();
};

// Obtenir le premier jour du mois (0 = dimanche, 1 = lundi, etc.)
const getFirstDayOfMonth = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  // Convertir pour que lundi = 0
  return firstDay === 0 ? 6 : firstDay - 1;
};

// Vérifier si une activité existe pour une date
const hasActivityOnDate = (date) => {
  return props.activities.some((activity) => {
    const activityDate = new Date(activity.date);
    activityDate.setHours(0, 0, 0, 0);
    return activityDate.getTime() === date.getTime();
  });
};

// Générer les jours du calendrier pour le mois en cours
const calendarDays = computed(() => {
  const currentMonth = new Date();
  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days = [];

  // Ajouter des cellules vides pour les jours avant le début du mois
  for (let i = 0; i < firstDay; i++) {
    days.push({ day: null, hasActivity: false, isToday: false, isFuture: false });
  }

  // Ajouter les jours du mois
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    date.setHours(0, 0, 0, 0);

    days.push({
      day,
      hasActivity: hasActivityOnDate(date),
      isToday: date.getTime() === today.getTime(),
      isFuture: date > today,
    });
  }

  return days;
});
</script>

<template>
  <div class="w-full">
    <!-- Jours de la semaine -->
    <div class="grid grid-cols-7 gap-1 mb-2">
      <div
        v-for="day in daysOfWeek"
        :key="day"
        class="text-center text-xl font-semibold"
      >
        {{ day }}
      </div>
    </div>

    <!-- Grille du calendrier -->
    <div class="grid grid-cols-7 gap-2">
      <div
        v-for="(dayData, index) in calendarDays"
        :key="index"
        class="aspect-square flex items-center justify-center"
      >
        <!-- Jour avec activité -->
        <div
          v-if="dayData.day && dayData.hasActivity"
          class="w-10 h-10 bg-(--orange) rounded-3xl flex justify-center items-center"
        >
          <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 15 13" class="w-4 h-4 text-white">
            <path
              d="M14.3861 9.79083L12.3979 8.86065C11.843 8.60305 11.3762 8.20509 11.0506 7.71187C10.725 7.21864 10.5535 6.64989 10.5556 6.07009V4.15967C10.5556 4.02176 10.497 3.88949 10.3928 3.79196C10.2886 3.69444 10.1473 3.63965 10 3.63965C9.11622 3.63879 8.26891 3.30979 7.64399 2.72484C7.01907 2.13989 6.66758 1.34678 6.66666 0.519539C6.66657 0.422799 6.63765 0.328001 6.58315 0.245804C6.52865 0.163607 6.45073 0.0972689 6.35816 0.0542485C6.26559 0.0112282 6.16204 -0.00676897 6.05914 0.00228041C5.95624 0.0113298 5.85808 0.0470668 5.77569 0.105474L0.425694 3.89966L0.411805 3.91006C0.290796 4.00181 0.191741 4.11634 0.121065 4.24623C0.0503889 4.37611 0.00967073 4.51846 0.00155131 4.66402C-0.00656811 4.80959 0.0180926 4.95513 0.0739338 5.0912C0.129775 5.22727 0.21555 5.35083 0.325694 5.45387L8.22222 12.8479C8.27385 12.8962 8.33514 12.9345 8.40258 12.9605C8.47002 12.9866 8.5423 13.0001 8.61527 13H13.8889C14.1836 13 14.4662 12.8904 14.6746 12.6954C14.8829 12.5003 15 12.2358 15 11.96V10.721C15.0007 10.5278 14.9435 10.3382 14.835 10.1738C14.7265 10.0094 14.571 9.87677 14.3861 9.79083ZM13.8889 11.96H8.84513L1.11111 4.72064L2.00486 4.08622L4.69861 6.60766C4.80285 6.70541 4.94431 6.7604 5.09187 6.76052C5.23942 6.76064 5.38099 6.70589 5.48541 6.60831C5.58984 6.51074 5.64858 6.37833 5.64871 6.24021C5.64884 6.10209 5.59035 5.96959 5.48611 5.87184L2.89861 3.4518L5.67639 1.48157C5.88692 2.30488 6.36018 3.0487 7.03325 3.61416C7.70632 4.17962 8.54732 4.53993 9.44444 4.64719V6.07009C9.44168 6.84321 9.67041 7.60159 10.1047 8.25923C10.5389 8.91686 11.1614 9.44745 11.9014 9.79083L13.8889 10.721V11.96ZM3.25 10.9199H0.555555C0.408213 10.9199 0.266905 10.8651 0.162718 10.7676C0.0585315 10.6701 0 10.5378 0 10.3999C0 10.262 0.0585315 10.1297 0.162718 10.0322C0.266905 9.93467 0.408213 9.87988 0.555555 9.87988H3.25C3.39734 9.87988 3.53865 9.93467 3.64284 10.0322C3.74702 10.1297 3.80555 10.262 3.80555 10.3999C3.80555 10.5378 3.74702 10.6701 3.64284 10.7676C3.53865 10.8651 3.39734 10.9199 3.25 10.9199ZM6.02778 12.48C6.02778 12.6179 5.96924 12.7502 5.86506 12.8477C5.76087 12.9452 5.61956 13 5.47222 13H1.66667C1.51932 13 1.37802 12.9452 1.27383 12.8477C1.16964 12.7502 1.11111 12.6179 1.11111 12.48C1.11111 12.3421 1.16964 12.2098 1.27383 12.1123C1.37802 12.0147 1.51932 11.96 1.66667 11.96H5.47222C5.61956 11.96 5.76087 12.0147 5.86506 12.1123C5.96924 12.2098 6.02778 12.3421 6.02778 12.48Z"
              fill="currentColor"
            />
          </svg>
        </div>

        <!-- Jour d'aujourd'hui sans activité -->
        <div
          v-else-if="dayData.day && dayData.isToday"
          class="w-10 h-10 p-0.5 rounded-3xl outline-1 -outline-offset-1 outline-(--noir) flex justify-center items-center"
        >
          <span class="text-foreground text-xs font-semibold">{{ dayData.day }}</span>
        </div>

        <!-- Jour futur sans activité -->
        <div
          v-else-if="dayData.day && dayData.isFuture"
          class="w-10 h-10 p-0.5 rounded-3xl outline-1 -outline-offset-1 outline-(--secondary) flex justify-center items-center"
        >
          <span class="text-foreground text-xs font-semibold">{{ dayData.day }}</span>
        </div>

        <!-- Jour passé sans activité -->
        <div
          v-else-if="dayData.day"
          class="w-10 h-10 p-0.5 bg-(--secondary) rounded-3xl flex justify-center items-center"
        >
          <span class="text-foreground text-xs font-semibold">{{ dayData.day }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
