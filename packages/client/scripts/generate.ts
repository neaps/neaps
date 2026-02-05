import openapiTS, { astToString } from "openapi-typescript";
import type { OpenAPI3 } from "openapi-typescript";
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import the spec directly from api source. tsx handles .ts resolution
// and the JSON import assertion inside openapi.ts.
const { default: openapi } = await import(resolve(__dirname, "../../api/src/openapi.ts"));

const outputDir = resolve(__dirname, "../src/generated");
const outputFile = resolve(outputDir, "types.ts");

mkdirSync(outputDir, { recursive: true });

const ast = await openapiTS(openapi as OpenAPI3);
writeFileSync(outputFile, astToString(ast));

console.log(`[generate] wrote ${outputFile}`);
