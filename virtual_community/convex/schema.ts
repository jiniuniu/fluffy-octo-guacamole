import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const personaVector = v.object({
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
});

const topicVector = v.object({
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
});

export default defineSchema({
  personas: defineTable({
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
    vector: personaVector,
  }),

  questions: defineTable({
    text: v.string(),
    author: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("done"),
    ),
    topic_vector: v.optional(topicVector),
    is_public: v.optional(v.boolean()),
    slug: v.optional(v.string()),
    created_at: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_public", ["is_public"])
    .index("by_author_time", ["author", "created_at"]),

  answers: defineTable({
    question_id: v.id("questions"),
    persona_id: v.id("personas"),
    text: v.string(),
    stance: v.union(
      v.literal("support"),
      v.literal("neutral"),
      v.literal("oppose"),
    ),
    like_count: v.number(),
    liked_by: v.array(v.id("personas")),
    created_at: v.number(),
  })
    .index("by_question", ["question_id"])
    .index("by_question_likes", ["question_id", "like_count"]),

  replies: defineTable({
    answer_id: v.id("answers"),
    // "user" = real user, persona _id string = virtual persona
    author: v.string(),
    persona_id: v.optional(v.id("personas")),
    text: v.string(),
    created_at: v.number(),
  })
    .index("by_answer", ["answer_id"])
    .index("by_author", ["author"]),

  activity_log: defineTable({
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
    created_at: v.number(),
  }).index("by_question", ["question_id"]),
});
