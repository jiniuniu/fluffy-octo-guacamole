import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const byQuestion = query({
  args: { question_id: v.id("questions") },
  handler: async (ctx, { question_id }) => {
    const logs = await ctx.db
      .query("activity_log")
      .withIndex("by_question", (q) => q.eq("question_id", question_id))
      .order("asc")
      .collect();

    return await Promise.all(
      logs.map(async (log) => {
        const persona = await ctx.db.get(log.persona_id);
        return { ...log, persona };
      }),
    );
  },
});

export const createInternal = internalMutation({
  args: {
    question_id: v.id("questions"),
    persona_id: v.id("personas"),
    action: v.union(
      v.literal("ignore"),
      v.literal("like_question"),
      v.literal("answer"),
      v.literal("like_answer"),
      v.literal("reply_answer"),
    ),
    target_id: v.optional(v.string()),
    score: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("activity_log", {
      ...args,
      created_at: Date.now(),
    });
  },
});

export const create = mutation({
  args: {
    question_id: v.id("questions"),
    persona_id: v.id("personas"),
    action: v.union(
      v.literal("ignore"),
      v.literal("like_question"),
      v.literal("answer"),
      v.literal("like_answer"),
      v.literal("reply_answer"),
    ),
    target_id: v.optional(v.string()),
    score: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("activity_log", {
      ...args,
      created_at: Date.now(),
    });
  },
});
