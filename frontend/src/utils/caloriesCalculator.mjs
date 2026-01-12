/**
 * Calculate calories burned during activity
 * @param {number} elevationGain - Elevation gain in meters
 * @param {number} distance - Distance in meters
 * @param {number} duration - Moving duration in milliseconds
 * @returns {number} Calories burned
 */
export const calculateCalories = (elevationGain, distance, moving_duration) => {
  if (!moving_duration || !distance) return 0;

  const weight = 70; // Average weight in kg
  const avgSpeed = (distance / 1000) / (moving_duration / 3600000); // km/h

  const baseMET = Math.max(2.3, Math.min(19.8, 2.3 + (avgSpeed - 3) * 1.0));
  const elevationAdjustment = (elevationGain / distance) * 50;
  const adjustedMET = baseMET + elevationAdjustment;

  return (adjustedMET * 3.5 * weight * moving_duration) / 12000000;
};
