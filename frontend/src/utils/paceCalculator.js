export const calcPace = (timeMs, distanceMeters) => {
  if (distanceMeters === 0) return "0:00";

  const timeInSeconds = timeMs / 1000;
  const paceForOneKm = (timeInSeconds * 1000) / distanceMeters; // secondes par km

  // Si le pace est trop élevé (>99 min/km), afficher 00:00
  if (paceForOneKm > 99 * 60) return "00:00";

  const min = Math.floor(paceForOneKm / 60);
  const sec = Math.round(paceForOneKm % 60);

  return `${min}:${String(sec).padStart(2, "0")}`;
};