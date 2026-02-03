import tidePredictor, {
  type TimeSpan,
  type ExtremesInput,
  type Extreme,
  type TimelinePoint,
} from "./index.js";
import type { HarmonicConstituent, ExtremeOffsets } from "./harmonics/index.js";

export type Units = "meters" | "feet";

export type Station = {
  id: string;
  name: string;
  continent: string;
  country: string;
  region?: string;
  timezone: string;
  disclaimers: string;
  latitude: number;
  longitude: number;

  // Data source information
  source: {
    name: string;
    id: string;
    url: string;
  };

  datums: Record<string, number>;
  type: "reference" | "subordinate";
  harmonic_constituents: HarmonicConstituent[];
  offsets?: { reference?: string } & ExtremeOffsets;
};

export type StationPredictionOptions = {
  /** Datum to return predictions in. Defaults to 'MLLW' if available for the nearest station. */
  datum?: string;

  /** Units for returned water levels. Defaults to 'meters'. */
  units?: Units;
};

export type StationExtremesOptions = ExtremesInput & StationPredictionOptions;
export type StationTimelineOptions = TimeSpan & StationPredictionOptions;
export type StationWaterLevelOptions = { time: Date } & StationPredictionOptions;

export type StationPrediction = {
  datum: string | undefined;
  units: Units;
  station: Station;
  distance?: number;
};

export type StationExtremesPrediction = StationPrediction & {
  extremes: Extreme[];
};

export type StationTimelinePrediction = StationPrediction & {
  timeline: TimelinePoint[];
};

export type StationWaterLevelPrediction = StationPrediction & TimelinePoint;

export type StationPredictor = Station & {
  distance?: number;
  defaultDatum?: string;
  harmonic_constituents: HarmonicConstituent[];
  getExtremesPrediction: (options: StationExtremesOptions) => StationExtremesPrediction;
  getTimelinePrediction: (options: StationTimelineOptions) => StationTimelinePrediction;
  getWaterLevelAtTime: (options: StationWaterLevelOptions) => StationWaterLevelPrediction;
};

const feetPerMeter = 3.2808399;
const defaultUnits: Units = "meters";

export function useStation(
  station: Station,
  distance?: number,
  findStation?: (query: string) => StationPredictor,
): StationPredictor {
  // If subordinate station, use the reference station for datums and constituents
  let reference = station;
  if (station.type === "subordinate" && station.offsets?.reference) {
    if (!findStation)
      throw new Error(
        "findStation function must be provided to resolve subordinate station references.",
      );
    reference = findStation(station.offsets?.reference);
  }

  const { datums, harmonic_constituents } = reference;

  // Use MLLW as the default datum if available
  const defaultDatum = "MLLW" in datums ? "MLLW" : undefined;

  function getPredictor({ datum = defaultDatum }: StationPredictionOptions = {}) {
    let offset = 0;

    if (datum) {
      const datumOffset = datums?.[datum];
      const mslOffset = datums?.["MSL"];

      if (typeof datumOffset !== "number") {
        throw new Error(
          `Station ${station.id} missing ${datum} datum. Available datums: ${Object.keys(datums).join(", ")}`,
        );
      }

      if (typeof mslOffset !== "number") {
        throw new Error(
          `Station ${station.id} missing MSL datum, so predictions can't be given in ${datum}.`,
        );
      }

      offset = mslOffset - datumOffset;
    }

    return tidePredictor(harmonic_constituents, { offset });
  }

  return {
    ...station,
    distance,
    datums,
    harmonic_constituents,
    defaultDatum,
    getExtremesPrediction({
      datum = defaultDatum,
      units = defaultUnits,
      ...options
    }: StationExtremesOptions) {
      const offsets = "offsets" in station ? station.offsets : undefined;

      const extremes = getPredictor({ datum })
        .getExtremesPrediction({ ...options, offsets })
        .map((e) => toPreferredUnits(e, units));

      return { datum, units, station, distance, extremes };
    },

    getTimelinePrediction({
      datum = defaultDatum,
      units = defaultUnits,
      ...options
    }: StationTimelineOptions) {
      if (station.type === "subordinate") {
        throw new Error(`Timeline predictions are not supported for subordinate stations.`);
      }
      const timeline = getPredictor({ datum })
        .getTimelinePrediction(options)
        .map((e) => toPreferredUnits(e, units));

      return { datum, units, station, distance, timeline };
    },

    getWaterLevelAtTime({
      time,
      datum = defaultDatum,
      units = defaultUnits,
    }: StationWaterLevelOptions) {
      if (station.type === "subordinate") {
        throw new Error(`Water level predictions are not supported for subordinate stations.`);
      }

      const prediction = toPreferredUnits(
        getPredictor({ datum }).getWaterLevelAtTime({ time }),
        units,
      );

      return { datum, units, station, distance, ...prediction };
    },
  };
}

function toPreferredUnits<T extends { level: number }>(prediction: T, units: Units): T {
  let { level } = prediction;
  if (units === "feet") level *= feetPerMeter;
  else if (units !== "meters") throw new Error(`Unsupported units: ${units}`);
  return { ...prediction, level };
}
