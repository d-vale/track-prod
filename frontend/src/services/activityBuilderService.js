import { getAltitude } from "../utils/getAltitude";
import { haversine } from "../utils/haversine.mjs";
import { calcPace } from "../utils/paceCalculator";
import { calculateCalories } from "../utils/caloriesCalculator.mjs";
import polyline from "@mapbox/polyline";

export const activityBuilderService = {
  create: async (id) => {
    const localActivity = JSON.parse(localStorage.getItem(id));

    if (!localActivity) return;

    const date = new Date();

    const startedAt = localActivity.started_at;
    const stoppedAt = localActivity.stopped_at;
    const duration = localActivity.stopped_at - localActivity.started_at;
    const moving_duration = (localActivity.trace.length - 1) * 1000; // sampling 1/s donc moving duration = nombre de points

    const distance = calc_distance(localActivity.trace);
    const avgPace = calcPace(moving_duration, distance);
    const laps = localActivity.laps;

    const gain_loss = get_elevation_gain_loss(laps);
    const min_max_avg = await get_a_min_max_avg(localActivity.trace);

    const elevationGain = gain_loss[0];
    const elevationLoss = gain_loss[1];
    const altitude_min = min_max_avg[0];
    const altitude_max = min_max_avg[1];
    const altitude_avg = min_max_avg[2];

    const startPosition = localActivity.trace.at(0);
    const endPosition = localActivity.trace.at(-1);

    const encodedPolyline = encode_trace(localActivity.trace);
    const totalPoints = localActivity.trace.length;
    const samplingRate = 1;

    const estimatedCalories = calculateCalories(
      elevationGain,
      distance,
      moving_duration
    );

    const finalActiviy = {
      date,

      startedAt,
      stoppedAt,
      duration,
      moving_duration,

      distance,
      avgPace,
      laps,

      elevationGain,
      elevationLoss,
      altitude_min,
      altitude_max,
      altitude_avg,

      startPosition,
      endPosition,

      encodedPolyline,
      totalPoints,
      samplingRate,

      estimatedCalories,
    };

    return finalActiviy;
  },
};

function encode_trace(trace) {
  const coordinates = trace.map((point) => [
    point.geometry.coordinates[1], // latitude
    point.geometry.coordinates[0], // longitude
  ]);

  const encodedPolyline = polyline.encode(coordinates);

  return encodedPolyline;
}

function calc_distance(trace) {
  let distance = 0;
  let i;
  for (i = 1; i < trace.length; i++) {
    let point1 = trace[i - 1].geometry.coordinates;
    let point2 = trace[i].geometry.coordinates;

    distance += haversine(point1, point2);
  }

  return distance;
}

function get_elevation_gain_loss(laps) {
  let gain = 0;
  let loss = 0;
  for (let lap of laps) {
    gain += lap.elevationGain;
    loss += lap.elevationLoss;
  }

  return [gain, loss];
}

async function get_a_min_max_avg(trace) {
  let max = null;
  let min = null;
  let avg = 0;
  let count = 0;

  for (let point of trace) {
    if (point.altitude == null && navigator.onLine) {
      point.altitude = await getAltitude(point.geometry.coordinates);
    }

    if (point.altitude != null) {
      if (max == null || point.altitude > max) {
        max = point.altitude;
      }
      if (min == null || point.altitude < min) {
        min = point.altitude;
      }
      avg += parseFloat(point.altitude);
      count++;
    }
  }

  avg = count > 0 ? (avg / count).toFixed(2) : 0;

  return [min, max, avg];
}
