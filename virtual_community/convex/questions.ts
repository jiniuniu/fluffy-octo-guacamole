import { query, mutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = (await ctx.auth.getUserIdentity())?.subject;
    if (!userId) return [];
    return await ctx.db
      .query("questions")
      .order("desc")
      .filter((q) => q.eq(q.field("author"), userId))
      .collect();
  },
});

export const getById = query({
  args: { id: v.id("questions") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

const DAILY_LIMIT = 3;

export const create = mutation({
  args: { text: v.string() },
  handler: async (ctx, { text }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const isAdmin = (identity as any).metadata?.role === "admin";

    if (!isAdmin) {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const todayCount = await ctx.db
        .query("questions")
        .withIndex("by_author_time", (q) =>
          q
            .eq("author", identity.subject)
            .gte("created_at", startOfDay.getTime()),
        )
        .collect()
        .then((r) => r.length);

      if (todayCount >= DAILY_LIMIT) {
        throw new Error("DAILY_LIMIT_EXCEEDED");
      }
    }

    const id = await ctx.db.insert("questions", {
      text,
      author: identity.subject,
      status: "pending",
      created_at: Date.now(),
    });
    await ctx.scheduler.runAfter(0, internal.simulation.run, {
      question_id: id,
    });
    return id;
  },
});

export const dailyUsage = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { used: 0, limit: DAILY_LIMIT, isAdmin: false };

    const isAdmin = (identity as any).metadata?.role === "admin";
    if (isAdmin) return { used: 0, limit: DAILY_LIMIT, isAdmin: true };

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const used = await ctx.db
      .query("questions")
      .withIndex("by_author_time", (q) =>
        q
          .eq("author", identity.subject)
          .gte("created_at", startOfDay.getTime()),
      )
      .collect()
      .then((r) => r.length);

    return { used, limit: DAILY_LIMIT, isAdmin: false };
  },
});

export const updateEnriched = mutation({
  args: {
    id: v.id("questions"),
    title: v.string(),
    description: v.string(),
    simulation_size: v.number(),
  },
  handler: async (ctx, { id, title, description, simulation_size }) => {
    await ctx.db.patch(id, { title, description, simulation_size });
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("questions"),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("done"),
    ),
  },
  handler: async (ctx, { id, status }) => {
    await ctx.db.patch(id, { status });
  },
});

export const updateTopicVector = mutation({
  args: {
    id: v.id("questions"),
    topic_vector: v.object({
      SEQ01: v.optional(v.number()),
      SEQ02: v.optional(v.number()),
      SEQ03: v.optional(v.number()),
      SEQ05: v.optional(v.number()),
      OTQ01: v.optional(v.number()),
      OTQ02: v.optional(v.number()),
      OTQ03: v.optional(v.number()),
      OTQ04: v.optional(v.number()),
      OTQ05: v.optional(v.number()),
      OTQ06: v.optional(v.number()),
      OTQ07: v.optional(v.number()),
      OTQ08: v.optional(v.number()),
      OTQ10: v.optional(v.number()),
      GRQ01: v.optional(v.number()),
      GRQ02: v.optional(v.number()),
      GRQ07: v.optional(v.number()),
      GRQ08: v.optional(v.number()),
      GRQ09: v.optional(v.number()),
      MAQ01: v.optional(v.number()),
      MAQ02: v.optional(v.number()),
    }),
  },
  handler: async (ctx, { id, topic_vector }) => {
    await ctx.db.patch(id, { topic_vector });
  },
});

export const setPublic = mutation({
  args: { id: v.id("questions"), is_public: v.boolean() },
  handler: async (ctx, { id, is_public }) => {
    if (is_public) {
      // generate slug from first 6 chars of id + timestamp
      const existing = await ctx.db.get(id);
      const slug = existing?.slug ?? `q-${id.slice(0, 8)}`;
      await ctx.db.patch(id, { is_public: true, slug });
    } else {
      await ctx.db.patch(id, { is_public: false });
    }
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    return await ctx.db
      .query("questions")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
  },
});

export const listPublic = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("questions")
      .withIndex("by_public", (q) => q.eq("is_public", true))
      .order("desc")
      .collect();
  },
});

export const stats = query({
  args: { id: v.id("questions") },
  handler: async (ctx, { id }) => {
    const question = await ctx.db.get(id);
    const logs = await ctx.db
      .query("activity_log")
      .withIndex("by_question", (q) => q.eq("question_id", id))
      .collect();

    const answers = await ctx.db
      .query("answers")
      .withIndex("by_question", (q) => q.eq("question_id", id))
      .collect();

    // count unique personas that appeared in logs = "saw" the question
    const saw = new Set(logs.map((l) => l.persona_id)).size;

    const ignored = logs.filter((l) => l.action === "ignore").length;
    const likedQ = logs.filter((l) => l.action === "like_question").length;
    const answered = logs.filter((l) => l.action === "answer").length;
    const likedAnswer = logs.filter((l) => l.action === "like_answer").length;
    const replied = logs.filter((l) => l.action === "reply_answer").length;

    const support = answers.filter((a) => a.stance === "support").length;
    const oppose = answers.filter((a) => a.stance === "oppose").length;
    const neutral = answers.filter((a) => a.stance === "neutral").length;
    const totalLikes = answers.reduce((sum, a) => sum + a.like_count, 0);

    return {
      saw,
      simulation_size: question?.simulation_size ?? null,
      ignored,
      likedQ,
      answered,
      likedAnswer,
      replied,
      support,
      oppose,
      neutral,
      totalAnswers: answers.length,
      totalLikes,
    };
  },
});
