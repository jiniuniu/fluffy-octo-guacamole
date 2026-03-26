/**
 * Read all personas, group by cluster, print sort_key distribution.
 * Usage: node scripts/inspectSortKeys.mjs
 */

import { ConvexHttpClient } from "convex/browser";
import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const envPath = resolve(__dirname, "../.env.local");
for (const line of readFileSync(envPath, "utf-8").split("\n")) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) process.env[match[1].trim()] = match[2].trim();
}

const url = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!url) { console.error("Missing NEXT_PUBLIC_CONVEX_URL"); process.exit(1); }

const client = new ConvexHttpClient(url);
const { api } = await import("../convex/_generated/api.js");

const all = await client.query(api.personas.list);

const byCluster = {};
for (const p of all) {
  const c = p.cluster;
  (byCluster[c] ??= []).push(p.sort_key ?? null);
}

const summary = {};
for (const [c, keys] of Object.entries(byCluster).sort((a, b) => Number(a[0]) - Number(b[0]))) {
  const defined = keys.filter((k) => k !== null).sort((a, b) => a - b);
  summary[`cluster_${c}`] = {
    count: keys.length,
    with_sort_key: defined.length,
    min: defined[0] ?? null,
    max: defined[defined.length - 1] ?? null,
    missing: keys.length - defined.length,
  };
}

console.log(JSON.stringify(summary, null, 2));

const outPath = resolve(__dirname, "../data/sort_key_inspection.json");
writeFileSync(outPath, JSON.stringify({ summary, byCluster: Object.fromEntries(
  Object.entries(byCluster).map(([c, keys]) => [c, keys.filter(k => k !== null).sort((a,b) => a-b)])
)}, null, 2));
console.log(`Written to data/sort_key_inspection.json`);
