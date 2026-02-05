# @neaps/client

Typed HTTP client for [@neaps/api](../api). Types are generated at build time from the [OpenAPI spec](../api/src/openapi.ts) — changes to the API automatically flow into the client at the next build.

## Installation

```sh
npm install @neaps/client
```

## Usage

```typescript
import { createClient } from "@neaps/client";

const client = createClient(); // defaults to https://api.openwaters.io
// const client = createClient("http://localhost:3000"); // or point at a local server
```

### Get high and low tides

```typescript
const { data, error } = await client.GET("/tides/extremes", {
  params: {
    query: {
      latitude: 26.772,
      longitude: -80.05,
      start: "2025-12-17T00:00:00Z",
      end: "2025-12-18T00:00:00Z",
      units: "feet",
    },
  },
});

// data is typed as ExtremesResponse | undefined
// error is typed as ApiError | undefined
if (data) {
  console.log(`Station: ${data.station?.name}`);
  data.extremes?.forEach((e) => {
    console.log(`  ${e.label} — ${e.level} ft at ${e.time}`);
  });
}
```

### Get a water level timeline

```typescript
const { data } = await client.GET("/tides/timeline", {
  params: {
    query: {
      latitude: 26.772,
      longitude: -80.05,
      start: "2025-12-17T00:00:00Z",
      end: "2025-12-17T12:00:00Z",
    },
  },
});

data?.timeline?.forEach((entry) => {
  console.log(`  ${entry.time} — ${entry.level} m`);
});
```

### Search stations

```typescript
// Text search
const { data: results } = await client.GET("/tides/stations", {
  params: { query: { query: "miami" } },
});

// Find stations near a location
const { data: nearby } = await client.GET("/tides/stations", {
  params: {
    query: { latitude: 26.772, longitude: -80.05, maxResults: 5 },
  },
});
```

### Get predictions for a specific station

```typescript
const { data: extremes } = await client.GET("/tides/stations/{source}/{id}/extremes", {
  params: {
    path: { source: "noaa", id: "8722588" },
    query: {
      start: "2025-12-17T00:00:00Z",
      end: "2025-12-18T00:00:00Z",
    },
  },
});
```

## Types

All response types are exported by name:

```typescript
import type {
  Station,
  StationSummary,
  Extreme,
  ExtremesResponse,
  TimelineEntry,
  TimelineResponse,
  ApiError,
} from "@neaps/client";
```

## License

MIT
