import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("personas").collect();
  },
});

// Cluster proportions from K-means analysis (output_cluster_profiles.json)
const CLUSTER_PROPORTIONS: Record<number, number> = {
  0: 0.14837606837606837,
  1: 0.19179487179487179,
  2: 0.13931623931623932,
  3: 0.12273504273504274,
  4: 0.27982905982905984,
  5: 0.11794871794871795,
};

function sampleByCluster(all: any[], n: number): any[] {
  const byCluster: Record<number, any[]> = {};
  for (const p of all) {
    (byCluster[p.cluster] ??= []).push(p);
  }

  // allocate seats per cluster, fix rounding drift on largest cluster
  const seats: Record<number, number> = {};
  let total = 0;
  for (const [c, prop] of Object.entries(CLUSTER_PROPORTIONS)) {
    seats[Number(c)] = Math.round(prop * n);
    total += seats[Number(c)];
  }
  const drift = n - total;
  if (drift !== 0) {
    const largest = Number(Object.entries(seats).sort((a, b) => b[1] - a[1])[0][0]);
    seats[largest] += drift;
  }

  const result: any[] = [];
  for (const [c, count] of Object.entries(seats)) {
    const pool = byCluster[Number(c)] ?? [];
    // Fisher-Yates shuffle
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    result.push(...pool.slice(0, count));
  }
  return result;
}

export const sample = query({
  args: { n: v.number() },
  handler: async (ctx, { n }) => {
    const all = await ctx.db.query("personas").collect();
    return sampleByCluster(all, n);
  },
});

export const getById = query({
  args: { id: v.id("personas") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const insert = mutation({
  args: {
    cluster: v.number(),
    cluster_label: v.string(),
    demo: v.object({
      age: v.number(),
      gender: v.string(),
      city: v.string(),
      education: v.string(),
      occupation: v.string(),
    }),
    bio: v.string(),
    vector: v.object({
      SEQ01: v.number(),
      SEQ02: v.number(),
      SEQ03: v.number(),
      SEQ05: v.number(),
      OTQ01: v.number(),
      OTQ02: v.number(),
      OTQ03: v.number(),
      OTQ04: v.number(),
      OTQ05: v.number(),
      OTQ06: v.number(),
      OTQ07: v.number(),
      OTQ08: v.number(),
      OTQ10: v.number(),
      GRQ01: v.number(),
      GRQ02: v.number(),
      GRQ07: v.number(),
      GRQ08: v.number(),
      GRQ09: v.number(),
      MAQ01: v.number(),
      MAQ02: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("personas", args);
  },
});

export const clear = mutation({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("personas").collect();
    await Promise.all(all.map((p) => ctx.db.delete(p._id)));
  },
});
