"use node";

import { internalAction, action } from "./_generated/server";
import { api } from "./_generated/api";
import { v } from "convex/values";
import { computeScore, sampleAction, pickTargetAnswer } from "../lib/engine";
import { extractTopicVector } from "./chains/topicVectorChain";
import { generateAnswer } from "./chains/answerChain";
import { generateReply, generateReplyToUser } from "./chains/replyChain";

export const run = internalAction({
  args: { question_id: v.id("questions") },
  handler: async (ctx, { question_id }) => {
    await ctx.runMutation(api.questions.updateStatus, {
      id: question_id,
      status: "processing",
    });

    const question = await ctx.runQuery(api.questions.getById, { id: question_id });
    if (!question) return;

    // step 1: extract topic vector
    const topicVector = await extractTopicVector(question.text);
    await ctx.runMutation(api.questions.updateTopicVector, {
      id: question_id,
      topic_vector: topicVector,
    });

    // step 2: iterate personas serially
    const personas = await ctx.runQuery(api.personas.list, {});

    for (const persona of personas) {
      const score = computeScore(persona.vector, topicVector as Record<string, number>);

      const existingAnswers = await ctx.runQuery(api.answers.topByQuestion, {
        question_id,
        limit: 10,
      });

      const action = sampleAction(score, existingAnswers.length > 0);

      if (action === "answer") {
        const result = await generateAnswer(
          persona,
          question.text,
          existingAnswers.map((a) => ({ text: a.text, stance: a.stance }))
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
        const target = pickTargetAnswer(existingAnswers);
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
    }

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

    const question = await ctx.runQuery(api.questions.getById, { id: answer.question_id });
    if (!question) return;

    const persona = await ctx.runQuery(api.personas.getById, { id: answer.persona_id });
    if (!persona) return;

    const result = await generateReplyToUser(
      persona,
      question.text,
      answer.text,
      user_reply_text
    );

    await ctx.runMutation(api.replies.create, {
      answer_id,
      persona_id: persona._id,
      text: result.text,
    });

    await ctx.runMutation(api.activity_log.create, {
      question_id: answer.question_id,
      persona_id: persona._id,
      action: "reply_answer",
      target_id: answer_id,
      score: 0,
    });
  },
});

