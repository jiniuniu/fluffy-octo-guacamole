import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("personas").collect();
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
      SEQ01: v.number(), SEQ02: v.number(), SEQ03: v.number(), SEQ05: v.number(),
      OTQ01: v.number(), OTQ02: v.number(), OTQ03: v.number(), OTQ04: v.number(),
      OTQ05: v.number(), OTQ06: v.number(), OTQ07: v.number(), OTQ08: v.number(),
      OTQ10: v.number(), GRQ01: v.number(), GRQ02: v.number(), GRQ07: v.number(),
      GRQ08: v.number(), GRQ09: v.number(), MAQ01: v.number(), MAQ02: v.number(),
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
