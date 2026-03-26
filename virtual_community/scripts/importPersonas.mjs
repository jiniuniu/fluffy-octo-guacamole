/**
 * Import personas from data/personas.json into Convex.
 * Usage: node scripts/importPersonas.mjs
 *
 * Requires CONVEX_URL in environment (set via .env.local or export).
 */

import { ConvexHttpClient } from "convex/browser";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// parse .env.local manually
const envPath = resolve(__dirname, "../.env.local");
for (const line of readFileSync(envPath, "utf-8").split("\n")) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) process.env[match[1].trim()] = match[2].trim();
}

const url = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!url) {
  console.error("Missing NEXT_PUBLIC_CONVEX_URL in .env.local");
  process.exit(1);
}

const client = new ConvexHttpClient(url);

const personas = JSON.parse(
  readFileSync(resolve(__dirname, "../data/personas.json"), "utf-8"),
);

// dynamic import of generated api
const { api } = await import("../convex/_generated/api.js");

const BATCH = 20; // concurrent mutations per wave

console.log(`Clearing existing personas...`);
await client.mutation(api.personas.clear);

console.log(`Inserting ${personas.length} personas (batch=${BATCH})...`);
let done = 0;
for (let i = 0; i < personas.length; i += BATCH) {
  const chunk = personas.slice(i, i + BATCH);
  await Promise.all(chunk.map((p) => client.mutation(api.personas.insert, p)));
  done += chunk.length;
  console.log(`  ${done}/${personas.length}`);
}

console.log("Done.");
