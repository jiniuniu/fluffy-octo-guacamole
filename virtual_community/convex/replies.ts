import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const byAnswer = query({
  args: { answer_id: v.id("answers") },
  handler: async (ctx, { answer_id }) => {
    return await ctx.db
      .query("replies")
      .withIndex("by_answer", (q) => q.eq("answer_id", answer_id))
      .collect();
  },
});

// called by simulation internally
export const create = mutation({
  args: {
    answer_id: v.id("answers"),
    persona_id: v.id("personas"),
    text: v.string(),
  },
  handler: async (ctx, { answer_id, persona_id, text }) => {
    return await ctx.db.insert("replies", {
      answer_id,
      author: persona_id,
      persona_id,
      text,
      created_at: Date.now(),
    });
  },
});

// called by frontend when user replies
export const createUserReply = mutation({
  args: {
    answer_id: v.id("answers"),
    text: v.string(),
  },
  handler: async (ctx, { answer_id, text }) => {
    return await ctx.db.insert("replies", {
      answer_id,
      author: "user",
      text,
      created_at: Date.now(),
    });
  },
});
