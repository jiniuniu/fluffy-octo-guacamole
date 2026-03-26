import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getById = query({
  args: { id: v.id("answers") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const byQuestion = query({
  args: { question_id: v.id("questions") },
  handler: async (ctx, { question_id }) => {
    const answers = await ctx.db
      .query("answers")
      .withIndex("by_question", (q) => q.eq("question_id", question_id))
      .collect();

    answers.sort((a, b) => b.like_count - a.like_count);

    const withReplies = await Promise.all(
      answers.map(async (answer) => {
        const persona = await ctx.db.get(answer.persona_id);
        const replies = await ctx.db
          .query("replies")
          .withIndex("by_answer", (q) => q.eq("answer_id", answer._id))
          .collect();

        const repliesWithPersona = await Promise.all(
          replies.map(async (reply) => {
            const rPersona = reply.persona_id ? await ctx.db.get(reply.persona_id) : null;
            return { ...reply, persona: rPersona };
          }),
        );

        return { ...answer, persona, replies: repliesWithPersona };
      }),
    );

    return withReplies;
  },
});

export const create = mutation({
  args: {
    question_id: v.id("questions"),
    persona_id: v.id("personas"),
    text: v.string(),
    stance: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("answers", {
      ...args,
      like_count: 0,
      liked_by: [],
      created_at: Date.now(),
    });
  },
});

export const addLike = mutation({
  args: {
    answer_id: v.id("answers"),
    persona_id: v.id("personas"),
  },
  handler: async (ctx, { answer_id, persona_id }) => {
    const answer = await ctx.db.get(answer_id);
    if (!answer) return;
    if (answer.liked_by.includes(persona_id)) return;
    await ctx.db.patch(answer_id, {
      like_count: answer.like_count + 1,
      liked_by: [...answer.liked_by, persona_id],
    });
  },
});

// returns top N answers sorted by likes, used as context for LLM
export const topByQuestion = query({
  args: { question_id: v.id("questions"), limit: v.number() },
  handler: async (ctx, { question_id, limit }) => {
    const answers = await ctx.db
      .query("answers")
      .withIndex("by_question", (q) => q.eq("question_id", question_id))
      .collect();
    answers.sort((a, b) => b.like_count - a.like_count);
    return answers.slice(0, limit);
  },
});
