"use node";

import { internalAction, action } from "./_generated/server";
import { api, internal } from "./_generated/api";

const SIMULATION_SIZE = 20;
import { v } from "convex/values";
import { computeScore, sampleAction, pickTargetAnswer } from "../lib/engine";
import { enrichQuestion } from "./chains/enrichChain";
import { extractTopicVector } from "./chains/topicVectorChain";
import { generateAnswer } from "./chains/answerChain";
import { generateReply, generateReplyToUser } from "./chains/replyChain";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function runPersonas(
  ctx: any,
  question_id: any,
  question: { text: string },
  enriched: { description: string },
  topicVector: Record<string, number>,
  personas: any[],
  seenPersonaIds: Set<string>,
) {
  for (const persona of personas) {
    if (seenPersonaIds.has(persona._id)) continue;

    const score = computeScore(
      persona.vector,
      topicVector,
    );

    const existingAnswers = await ctx.runQuery(api.answers.topByQuestion, {
      question_id,
      limit: 10,
    });

    const action = sampleAction(score, existingAnswers.length > 0);

    try {
      if (action === "answer") {
        const result = await generateAnswer(
          persona,
          question.text,
          enriched.description,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          existingAnswers.map((a: any) => ({ text: a.text, stance: a.stance })),
        );
        const answerId = await ctx.runMutation(api.answers.create, {
          question_id,
          persona_id: persona._id,
          text: result.text,
          stance: result.stance,
        });
        await ctx.runMutation(api.activity_log.create, {
          question_id,
          persona_id: persona._id,
          action: "answer",
          target_id: answerId,
          score,
        });
      } else if (action === "like_answer" && existingAnswers.length > 0) {
        const target = pickTargetAnswer(existingAnswers);
        await ctx.runMutation(api.answers.addLike, {
          answer_id: target._id,
          persona_id: persona._id,
        });
        await ctx.runMutation(api.activity_log.create, {
          question_id,
          persona_id: persona._id,
          action: "like_answer",
          target_id: target._id,
          score,
        });
      } else if (action === "reply_answer" && existingAnswers.length > 0) {
        const target = pickTargetAnswer(existingAnswers) as any;
        const result = await generateReply(persona, question.text, target.text);
        const replyId = await ctx.runMutation(api.replies.create, {
          answer_id: target._id,
          persona_id: persona._id,
          text: result.text,
        });
        await ctx.runMutation(api.activity_log.create, {
          question_id,
          persona_id: persona._id,
          action: "reply_answer",
          target_id: replyId,
          score,
        });
      } else {
        await ctx.runMutation(api.activity_log.create, {
          question_id,
          persona_id: persona._id,
          action: action === "like_question" ? "like_question" : "ignore",
          score,
        });
      }
    } catch (err) {
      console.error(`Skipping persona ${persona._id} due to error:`, err);
      // Record as ignore so progress tracking stays accurate
      await ctx.runMutation(api.activity_log.create, {
        question_id,
        persona_id: persona._id,
        action: "ignore",
        score,
      });
    }
  }
}

export const run = internalAction({
  args: { question_id: v.id("questions") },
  handler: async (ctx, { question_id }) => {
    await ctx.runMutation(api.questions.updateStatus, {
      id: question_id,
      status: "processing",
    });

    const question = await ctx.runQuery(api.questions.getById, {
      id: question_id,
    });
    if (!question) return;

    let enriched: { title: string; description: string; simulation_size?: number };
    let topicVector: Record<string, number>;

    try {
      // step 1: enrich user input → title + description + simulation_size
      enriched = await enrichQuestion(question.text);
      const simulationSize = Math.max(20, Math.min(100, enriched.simulation_size ?? SIMULATION_SIZE));
      await ctx.runMutation(api.questions.updateEnriched, {
        id: question_id,
        title: enriched.title,
        description: enriched.description,
        simulation_size: simulationSize,
      });

      // step 2: extract topic vector
      topicVector = await extractTopicVector(question.text) as Record<string, number>;
      await ctx.runMutation(api.questions.updateTopicVector, {
        id: question_id,
        topic_vector: topicVector,
      });
    } catch (err) {
      console.error("Pipeline failed at enrich/topicVector step:", err);
      await ctx.runMutation(api.questions.updateStatus, {
        id: question_id,
        status: "failed",
      });
      return;
    }

    const simulationSize = Math.max(20, Math.min(100, enriched.simulation_size ?? SIMULATION_SIZE));

    // step 3: sample personas by dynamic size and save for resume
    const personas = await ctx.runQuery(api.personas.sample, { n: simulationSize });
    await ctx.runMutation(api.questions.updatePersonaIds, {
      id: question_id,
      persona_ids: personas.map((p: any) => p._id),
    });

    await runPersonas(ctx, question_id, question, enriched, topicVector, personas, new Set());

    await ctx.runMutation(api.questions.updateStatus, {
      id: question_id,
      status: "done",
    });
  },
});

// Resume from where we left off — skip personas already in activity_log
export const resume = internalAction({
  args: { question_id: v.id("questions") },
  handler: async (ctx, { question_id }) => {
    const question = await ctx.runQuery(api.questions.getById, { id: question_id });
    if (!question) return;

    // Must have enriched data to resume — otherwise restart from scratch
    if (!question.description || !question.topic_vector) {
      await ctx.runAction(internal.simulation.run, { question_id });
      return;
    }

    const enriched = {
      title: question.title ?? question.text,
      description: question.description,
      simulation_size: question.simulation_size,
    };
    const topicVector = question.topic_vector as Record<string, number>;

    // Find already-processed persona IDs from activity_log
    const seenIds = await ctx.runQuery(api.questions.getActivityPersonaIds, { id: question_id });
    const seenPersonaIds = new Set(seenIds);

    // Use the exact same persona list from the original run; fall back to fresh sample
    let personas: any[];
    if (question.persona_ids && question.persona_ids.length > 0) {
      personas = await Promise.all(
        question.persona_ids.map((pid: any) => ctx.runQuery(api.personas.getById, { id: pid }))
      );
      personas = personas.filter(Boolean);
    } else {
      const simulationSize = Math.max(20, Math.min(100, question.simulation_size ?? SIMULATION_SIZE));
      personas = await ctx.runQuery(api.personas.sample, { n: simulationSize });
    }

    await runPersonas(ctx, question_id, question, enriched, topicVector, personas, seenPersonaIds);

    await ctx.runMutation(api.questions.updateStatus, {
      id: question_id,
      status: "done",
    });
  },
});

// triggered when user replies to a virtual persona's answer
export const replyToUser = action({
  args: {
    answer_id: v.id("answers"),
    user_reply_text: v.string(),
  },
  handler: async (ctx, { answer_id, user_reply_text }) => {
    const answer = await ctx.runQuery(api.answers.getById, { id: answer_id });
    if (!answer) return;

    const question = await ctx.runQuery(api.questions.getById, {
      id: answer.question_id,
    });
    if (!question) return;

    const persona = await ctx.runQuery(api.personas.getById, {
      id: answer.persona_id,
    });
    if (!persona) return;

    const result = await generateReplyToUser(
      persona,
      question.text,
      answer.text,
      user_reply_text,
    );

    await ctx.runMutation(internal.replies.createInternal, {
      answer_id,
      persona_id: persona._id,
      text: result.text,
    });

    await ctx.runMutation(internal.activity_log.createInternal, {
      question_id: answer.question_id,
      persona_id: persona._id,
      action: "reply_answer",
      target_id: answer_id,
      score: 0,
    });
  },
});
