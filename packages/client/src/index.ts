import createClientBase, { type ClientOptions } from "openapi-fetch";
import type { paths, components } from "./generated/types.js";

export type { paths };

export type StationSummary = components["schemas"]["StationSummary"];
export type Station = components["schemas"]["Station"];
export type HarmonicConstituent = components["schemas"]["HarmonicConstituent"];
export type Offsets = components["schemas"]["Offsets"];
export type Extreme = components["schemas"]["Extreme"];
export type PredictionResponse = components["schemas"]["PredictionResponse"];
export type ExtremesResponse = components["schemas"]["ExtremesResponse"];
export type TimelineEntry = components["schemas"]["TimelineEntry"];
export type TimelineResponse = components["schemas"]["TimelineResponse"];
export type ApiError = components["schemas"]["Error"];

/**
 * Create a typed client for the Neaps Tide Prediction API.
 *
 * @example
 * ```ts
 * import { createClient } from "@neaps/client";
 *
 * const client = createClient(); // baseUrl defaults to https://api.openwaters.io
 * const local = createClient({ baseUrl: "http://localhost:3000" });
 *
 * const { data, error } = await client.GET("/tides/extremes", {
 *   params: { query: { latitude: 26.772, longitude: -80.05 } },
 * });
 * ```
 */
export function createClient(options: ClientOptions = {}) {
  return createClientBase<paths>({ baseUrl: "https://api.openwaters.io", ...options });
}
