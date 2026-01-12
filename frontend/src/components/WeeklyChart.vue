<script setup>
import { computed, ref, onMounted } from "vue";

const props = defineProps({
  data: {
    type: Array,
    required: true,
  },
  selectedIndex: {
    type: Number,
    default: null,
  },
});

const emit = defineEmits(["select", "week-label"]);

// État pour le drag
const isDragging = ref(false);
const svgRef = ref(null);

// Sélectionner la semaine actuelle par défaut au montage
onMounted(() => {
  if (props.selectedIndex === null && props.data.length > 0) {
    const now = new Date();
    // Trouver l'index de la semaine actuelle
    const currentWeekIndex = props.data.findIndex((d) => {
      if (!d.startDate || !d.endDate) return false;
      const start = new Date(d.startDate);
      const end = new Date(d.endDate);
      return now >= start && now <= end;
    });

    // Si trouvée, sélectionner la semaine actuelle, sinon sélectionner la dernière
    const indexToSelect = currentWeekIndex !== -1 ? currentWeekIndex : props.data.length - 1;
    handlePointClick(indexToSelect);
  }
});

// Variables globales de couleur pour un réglage facile
const COLORS = {
  line: "#ea580c", // Couleur de la ligne principale
  lineSelected: "#ea580c", // Couleur de la ligne quand sélectionnée
  gradientStart: "#ea580c", // Couleur de départ du gradient
  gradientStartOpacity: 0.5, // Opacité de départ du gradient
  gradientEndOpacity: 0.1, // Opacité de fin du gradient
  gridLines: "#e5e7eb", // Couleur des lignes de grille
  axisLabels: "var(--secondary)", // Couleur gris clair pour les labels d'axe
  monthLabels: "var(--secondary)", // Couleur gris clair pour les labels de mois
  pointFill: "var(--base)", // Couleur de remplissage des points (utilise la couleur de fond de la page)
  pointStroke: "#ea580c", // Couleur du contour des points
  pointStrokeSelected: "#ea580c", // Couleur du contour des points sélectionnés
};

// Calcul des valeurs pour l'axe Y
const maxDistance = computed(() => {
  if (!props.data || props.data.length === 0) return 0;
  const max = Math.max(...props.data.map((d) => d.distance || 0));
  return max;
});
const midDistance = computed(() => Math.round(maxDistance.value / 2));

// Dimensions du graphique
const width = 360;
const height = 180;
const padding = { top: 20, right: 50, bottom: 40, left: 8};
const chartWidth = width - padding.left - padding.right;
const chartHeight = height - padding.top - padding.bottom;

// Fonction pour convertir une distance en position Y
const getY = (distance) => {
  if (maxDistance.value === 0) {
    // Si pas de données, tout est en bas
    return padding.top + chartHeight;
  }
  const ratio = distance / maxDistance.value;
  return padding.top + chartHeight - ratio * chartHeight;
};

// Fonction pour obtenir la position X d'un point
const getX = (index) => {
  const spacing = chartWidth / (props.data.length - 1);
  return padding.left + index * spacing;
};

// Génération du path SVG pour la ligne
const linePath = computed(() => {
  if (!props.data || props.data.length === 0) return "";

  return props.data
    .map((d, i) => {
      const x = getX(i);
      const y = getY(d.distance);
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");
});

// Génération du path pour la zone avec gradient (area)
const areaPath = computed(() => {
  if (!props.data || props.data.length === 0) return "";

  const linePoints = props.data
    .map((d, i) => {
      const x = getX(i);
      const y = getY(d.distance);
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  // Fermer le path en revenant à la ligne de base
  const lastX = getX(props.data.length - 1);
  const baseY = padding.top + chartHeight;
  const firstX = getX(0);

  return `${linePoints} L ${lastX} ${baseY} L ${firstX} ${baseY} Z`;
});

// Points du graphique
const points = computed(() => {
  return props.data.map((d, i) => ({
    x: getX(i),
    y: getY(d.distance),
    distance: d.distance,
    index: i,
    month: d.month,
    startDate: d.startDate,
    endDate: d.endDate,
  }));
});

// Point sélectionné
const selectedPoint = computed(() => {
  if (props.selectedIndex === null) return null;
  return points.value[props.selectedIndex];
});

// Formater les dates pour l'affichage "17 nov. - 23 nov. 2025"
const formatWeekLabel = (startDate, endDate) => {
  if (!startDate || !endDate) return "";

  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date();

  // Vérifier si c'est la semaine actuelle
  const isCurrentWeek = now >= start && now <= end;
  if (isCurrentWeek) {
    return "Cette semaine";
  }

  const months = [
    "jan.",
    "fév.",
    "mars",
    "avr.",
    "mai",
    "juin",
    "juil.",
    "août",
    "sept.",
    "oct.",
    "nov.",
    "déc.",
  ];

  const startDay = start.getDate();
  const startMonth = months[start.getMonth()];
  const endDay = end.getDate();
  const endMonth = months[end.getMonth()];
  const year = end.getFullYear();

  return `${startDay} ${startMonth} - ${endDay} ${endMonth} ${year}`;
};

// Labels des mois (afficher seulement quand le mois change, sauf le premier)
const monthLabels = computed(() => {
  const labels = [];
  let lastMonth = null;

  props.data.forEach((d, i) => {
    // Ignorer le premier mois pour éviter l'overflow à gauche
    if (d.month !== lastMonth && i > 0) {
      const x = getX(i);
      labels.push({
        month: d.month,
        x: x,
      });
      lastMonth = d.month;
    } else if (i === 0) {
      lastMonth = d.month;
    }
  });

  return labels;
});

const handlePointClick = (index) => {
  emit("select", index);

  // Émettre aussi le label formaté de la semaine
  const point = points.value[index];
  if (point.startDate && point.endDate) {
    const label = formatWeekLabel(point.startDate, point.endDate);
    emit("week-label", label);
  }
};

// Fonction utilitaire pour trouver le point le plus proche basé sur l'axe X
const findClosestPointByX = (clientX) => {
  if (!svgRef.value) return 0;

  const rect = svgRef.value.getBoundingClientRect();
  const clickX = clientX - rect.left;

  let closestIndex = 0;
  let minDistance = Infinity;

  points.value.forEach((point, index) => {
    const distance = Math.abs(point.x - clickX);
    if (distance < minDistance) {
      minDistance = distance;
      closestIndex = index;
    }
  });

  return closestIndex;
};

// Gestion du mousedown
const handleMouseDown = (event) => {
  event.preventDefault(); // Empêcher le comportement par défaut
  isDragging.value = true;
  const index = findClosestPointByX(event.clientX);
  handlePointClick(index);
};

// Gestion du mousemove
const handleMouseMove = (event) => {
  if (!isDragging.value) return;
  event.preventDefault();
  const index = findClosestPointByX(event.clientX);
  handlePointClick(index);
};

// Gestion du mouseup et mouseleave
const handleMouseUp = () => {
  isDragging.value = false;
};

// Gestion tactile (touch events)
const handleTouchStart = (event) => {
  event.preventDefault();
  isDragging.value = true;
  const touch = event.touches[0];
  const index = findClosestPointByX(touch.clientX);
  handlePointClick(index);
};

const handleTouchMove = (event) => {
  if (!isDragging.value) return;
  event.preventDefault();
  const touch = event.touches[0];
  const index = findClosestPointByX(touch.clientX);
  handlePointClick(index);
};

const handleTouchEnd = () => {
  isDragging.value = false;
};
</script>

<template>
  <div class="w-full overflow-hidden">
    <svg
      ref="svgRef"
      :width="width"
      :height="height"
      class="w-full cursor-pointer"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      @mouseleave="handleMouseUp"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
      @touchcancel="handleTouchEnd"
    >
      <!-- Définition du gradient -->
      <defs>
        <linearGradient id="areaGradient" x1="0" x2="0" y1="0" y2="1">
          <stop
            offset="0%"
            :stop-color="COLORS.gradientStart"
            :stop-opacity="COLORS.gradientStartOpacity"
          />
          <stop
            offset="100%"
            :stop-color="COLORS.gradientStart"
            :stop-opacity="COLORS.gradientEndOpacity"
          />
        </linearGradient>
      </defs>

      <!-- Lignes horizontales de référence -->
      <line
        :x1="padding.left"
        :y1="padding.top + chartHeight"
        :x2="width - padding.right"
        :y2="padding.top + chartHeight"
        :stroke="COLORS.gridLines"
        stroke-width="1"
      />
      <line
        :x1="padding.left"
        :y1="padding.top + chartHeight / 2"
        :x2="width - padding.right"
        :y2="padding.top + chartHeight / 2"
        :stroke="COLORS.gridLines"
        stroke-width="1"
      />
      <line
        :x1="padding.left"
        :y1="padding.top"
        :x2="width - padding.right"
        :y2="padding.top"
        :stroke="COLORS.gridLines"
        stroke-width="1"
      />

      <!-- Labels de l'axe Y -->
      <text
        :x="width - padding.right + 10"
        :y="padding.top + chartHeight + 5"
        text-anchor="start"
        class="text-xs"
        :fill="COLORS.axisLabels"
      >
        0 km
      </text>
      <text
        :x="width - padding.right + 10"
        :y="padding.top + chartHeight / 2 + 5"
        text-anchor="start"
        class="text-xs"
        :fill="COLORS.axisLabels"
      >
        {{ midDistance }} km
      </text>
      <text
        :x="width - padding.right + 10"
        :y="padding.top + 5"
        text-anchor="start"
        class="text-xs"
        :fill="COLORS.axisLabels"
      >
        {{ maxDistance }} km
      </text>

      <!-- Zone avec gradient -->
      <path :d="areaPath" fill="url(#areaGradient)" />

      <!-- Ligne verticale discrète au point sélectionné -->
      <line
        v-if="selectedPoint"
        :x1="selectedPoint.x"
        :y1="selectedPoint.y"
        :x2="selectedPoint.x"
        :y2="padding.top + chartHeight"
        :stroke="COLORS.pointStrokeSelected"
        stroke-width="1"
        stroke-dasharray="3,3"
        opacity="0.4"
        class="pointer-events-none"
      />

      <!-- Ligne orange -->
      <path
        :d="linePath"
        fill="none"
        :stroke="COLORS.line"
        stroke-width="2.5"
      />

      <!-- Points -->
      <g v-for="point in points" :key="point.index">
        <!-- Point creux (hollow) -->
        <circle
          :cx="point.x"
          :cy="point.y"
          :r="selectedIndex === point.index ? 6 : 3.75"
          :fill="
            selectedIndex === point.index
              ? COLORS.pointStrokeSelected
              : COLORS.pointFill
          "
          :stroke="
            selectedIndex === point.index
              ? COLORS.pointStrokeSelected
              : COLORS.pointStroke
          "
          :stroke-width="selectedIndex === point.index ? 3 : 1.875"
          class="pointer-events-none transition-all"
        />
      </g>

      <!-- Labels des mois -->
      <g v-for="label in monthLabels" :key="label.month">
        <text
          :x="label.x"
          :y="height - 10"
          text-anchor="middle"
          class="text-sm font-medium"
          :fill="COLORS.monthLabels"
        >
          {{ label.month }}
        </text>
      </g>
    </svg>
  </div>
</template>
