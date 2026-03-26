import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("personas").collect();
  },
});

// Cluster size boundaries — populated by running scripts/assignSortKeys.mjs
// sort_key is 0-based within each cluster
// { cluster: size } — update if personas are re-imported
const CLUSTER_SIZES: Record<number, number> = {
  0: 148,
  1: 192,
  2: 139,
  3: 123,
  4: 280,
  5: 118,
};

const CLUSTER_PROPORTIONS: Record<number, number> = {
  0: 0.148,
  1: 0.192,
  2: 0.139,
  3: 0.123,
  4: 0.280,
  5: 0.118,
};

export const sample = query({
  args: { n: v.number() },
  handler: async (ctx, { n }) => {
    // Allocate seats per cluster
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
      const cluster = Number(c);
      const size = CLUSTER_SIZES[cluster] ?? 0;
      if (size === 0 || count === 0) continue;

      // Random start within cluster, wrap around if needed
      const start = Math.floor(Math.random() * size);
      const end = start + count;

      if (end <= size) {
        const rows = await ctx.db
          .query("personas")
          .withIndex("by_cluster_sort", (q) =>
            q.eq("cluster", cluster).gte("sort_key", start).lt("sort_key", end)
          )
          .collect();
        result.push(...rows);
      } else {
        // wrap: take from start→size, then 0→remainder
        const [a, b] = await Promise.all([
          ctx.db
            .query("personas")
            .withIndex("by_cluster_sort", (q) =>
              q.eq("cluster", cluster).gte("sort_key", start).lt("sort_key", size)
            )
            .collect(),
          ctx.db
            .query("personas")
            .withIndex("by_cluster_sort", (q) =>
              q.eq("cluster", cluster).gte("sort_key", 0).lt("sort_key", end - size)
            )
            .collect(),
        ]);
        result.push(...a, ...b);
      }
    }
    return result;
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

// One-time migration: assign sort_key per cluster (0-based within each cluster)
// Run once via script after schema deploy
export const assignSortKeys = mutation({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("personas").collect();
    const byCluster: Record<number, typeof all> = {};
    for (const p of all) {
      (byCluster[p.cluster] ??= []).push(p);
    }
    let total = 0;
    for (const [, personas] of Object.entries(byCluster).sort((a, b) => Number(a[0]) - Number(b[0]))) {
      for (let i = 0; i < personas.length; i++) {
        await ctx.db.patch(personas[i]._id, { sort_key: i });
        total++;
      }
    }
    return { patched: total };
  },
});

export const clear = mutation({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("personas").collect();
    await Promise.all(all.map((p) => ctx.db.delete(p._id)));
  },
});
