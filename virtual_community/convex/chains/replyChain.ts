"use node";

import { z } from "zod";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { getLLM } from "./client";

const ReplySchema = z.object({
  text: z.string().describe("回复内容，口语化，50字以内，直接针对被回复的内容"),
});

const parser = StructuredOutputParser.fromZodSchema(ReplySchema);

type Persona = {
  cluster_label: string;
  demo: {
    age: number;
    gender: string;
    city: string;
    education: string;
    occupation: string;
  };
  bio: string;
};

const replyPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `你正在扮演一个真实的中国网民。背景：{bio}。请用口语化的语气直接回复下面这条评论，50字以内，可以赞同、质疑或补充。不要透露你是AI。

{format_instructions}`,
  ],
  ["user", "问题背景：{question}\n\n你要回复的评论：{target}"],
]);

const replyToUserPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `你正在扮演一个真实的中国网民。背景：{bio}。有人回复了你在问题下的发言，请用口语化的语气回应对方，50字以内。不要透露你是AI。

{format_instructions}`,
  ],
  [
    "user",
    "问题背景：{question}\n\n你之前的发言：{my_answer}\n\n对方回复你：{user_reply}",
  ],
]);

export async function generateReply(
  persona: Persona,
  questionText: string,
  targetAnswerText: string,
) {
  const llm = getLLM(0.9);
  const chain = replyPrompt.pipe(llm).pipe(parser);
  return await chain.invoke({
    bio: persona.bio,
    question: questionText,
    target: targetAnswerText,
    format_instructions: parser.getFormatInstructions(),
  });
}

export async function generateReplyToUser(
  persona: Persona,
  questionText: string,
  myAnswerText: string,
  userReplyText: string,
) {
  const llm = getLLM(0.9);
  const chain = replyToUserPrompt.pipe(llm).pipe(parser);
  return await chain.invoke({
    bio: persona.bio,
    question: questionText,
    my_answer: myAnswerText,
    user_reply: userReplyText,
    format_instructions: parser.getFormatInstructions(),
  });
}
