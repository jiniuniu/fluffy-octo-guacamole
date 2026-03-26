/**
 * One-time migration: assign sort_key to all personas grouped by cluster.
 * Usage: node scripts/assignSortKeys.mjs
 */

import { ConvexHttpClient } from "convex/browser";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

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
const { api } = await import("../convex/_generated/api.js");

console.log("Assigning sort_keys...");
const result = await client.mutation(api.personas.assignSortKeys);
console.log(`Done. Patched ${result.patched} personas.`);
