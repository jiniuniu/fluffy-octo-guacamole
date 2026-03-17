"use node";

import { z } from "zod";
import { getLLM } from "./client";

const AnswerSchema = z.object({
  text: z.string().describe("回答正文，符合人物语气，100-300字，不要透露自己的身份信息"),
  stance: z.enum(["support", "neutral", "oppose"]).describe("对问题中主角做法/处境的立场"),
});

type Persona = {
  cluster_label: string;
  demo: { age: number; gender: string; city: string; education: string; occupation: string };
  bio: string;
};

function buildSystemPrompt(persona: Persona): string {
  return `你正在扮演一个真实的中国网民，以下是你的背景：

${persona.bio}

基本信息：${persona.demo.age}岁，${persona.demo.gender === "male" ? "男" : "女"}，${persona.demo.city}，${persona.demo.occupation}，${persona.demo.education}学历。

请以这个人物的视角、语气和价值观来回答问题。语言要自然口语化，像在知乎或微博评论区发言。不要说教，不要假装客观，直接表达这个人物会有的真实想法。不要透露任何关于你是AI或角色扮演的信息。`;
}

function buildUserPrompt(questionText: string, existingAnswers: { text: string; stance: string }[]): string {
  let prompt = `问题：${questionText}`;
  if (existingAnswers.length > 0) {
    prompt += `\n\n已有回答（按热度排序）：\n`;
    prompt += existingAnswers
      .slice(0, 10)
      .map((a, i) => `${i + 1}. ${a.text}`)
      .join("\n\n");
    prompt += `\n\n请发表你的看法，可以回应已有观点，也可以提出新角度。`;
  }
  return prompt;
}

export async function generateAnswer(
  persona: Persona,
  questionText: string,
  existingAnswers: { text: string; stance: string }[]
) {
  const llm = getLLM(0.9);
  const structured = llm.withStructuredOutput(AnswerSchema);
  return await structured.invoke([
    { role: "system", content: buildSystemPrompt(persona) },
    { role: "user", content: buildUserPrompt(questionText, existingAnswers) },
  ]);
}
