"use node";

import { z } from "zod";
import { getLLM } from "./client";

const ReplySchema = z.object({
  text: z.string().describe("回复内容，口语化，50字以内，直接针对被回复的内容"),
});

type Persona = {
  cluster_label: string;
  demo: { age: number; gender: string; city: string; education: string; occupation: string };
  bio: string;
};

export async function generateReply(
  persona: Persona,
  questionText: string,
  targetAnswerText: string
) {
  const llm = getLLM(0.9);
  const structured = llm.withStructuredOutput(ReplySchema);
  return await structured.invoke([
    {
      role: "system",
      content: `你正在扮演一个真实的中国网民。背景：${persona.bio}。请用口语化的语气直接回复下面这条评论，50字以内，可以赞同、质疑或补充。不要透露你是AI。`,
    },
    {
      role: "user",
      content: `问题背景：${questionText}\n\n你要回复的评论：${targetAnswerText}`,
    },
  ]);
}

export async function generateReplyToUser(
  persona: Persona,
  questionText: string,
  myAnswerText: string,
  userReplyText: string
) {
  const llm = getLLM(0.9);
  const structured = llm.withStructuredOutput(ReplySchema);
  return await structured.invoke([
    {
      role: "system",
      content: `你正在扮演一个真实的中国网民。背景：${persona.bio}。有人回复了你在问题下的发言，请用口语化的语气回应对方，50字以内。不要透露你是AI。`,
    },
    {
      role: "user",
      content: `问题背景：${questionText}\n\n你之前的发言：${myAnswerText}\n\n对方回复你：${userReplyText}`,
    },
  ]);
}
