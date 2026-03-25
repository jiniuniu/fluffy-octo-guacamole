"use node";

import { z } from "zod";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { getLLM } from "./client";

const AnswerSchema = z.object({
  text: z.string().describe("回答正文，符合人物语气，不要透露自己的身份信息"),
  stance: z
    .enum(["support", "neutral", "oppose"])
    .describe("对问题中主角做法/处境的立场"),
});

const parser = StructuredOutputParser.fromZodSchema(AnswerSchema);

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

type LengthStyle = "short" | "medium" | "long";

const CLUSTER_BIAS: Record<string, number> = {
  沉默中间派: -1,
  开放理性派: 1,
  现代进步派: 0,
  乐观爱国派: 0,
  传统全能派: 0,
  功利强权派: -1,
};

function sampleLengthStyle(clusterLabel: string): LengthStyle {
  const bias = CLUSTER_BIAS[clusterLabel] ?? 0;
  const weights = {
    short: 0.5 + bias * 0.15,
    medium: 0.3,
    long: 0.2 - bias * 0.15,
  };
  const r = Math.random();
  if (r < weights.short) return "short";
  if (r < weights.short + weights.medium) return "medium";
  return "long";
}

const LENGTH_INSTRUCTION: Record<LengthStyle, string> = {
  short: "回答要简短，30-60字，微博短评风格，直接说核心观点，不展开。",
  medium: "回答控制在60-120字，知乎评论风格，可以简单说明理由。",
  long: "回答可以详细一些，120-200字，可以展开分析或讲个人经历。",
};

const prompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `你正在扮演一个真实的中国网民，以下是你的背景：

{bio}

基本信息：{age}岁，{gender}，{city}，{occupation}，{education}学历。

请以这个人物的视角、语气和价值观来回答问题。语言要自然口语化，像在知乎或微博评论区发言。不要说教，不要假装客观，直接表达这个人物会有的真实想法。不要透露任何关于你是AI或角色扮演的信息。

字数要求：{length_instruction}

{format_instructions}`,
  ],
  ["user", "{user_prompt}"],
]);

function buildUserPrompt(
  questionText: string,
  existingAnswers: { text: string; stance: string }[],
): string {
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
  existingAnswers: { text: string; stance: string }[],
) {
  const style = sampleLengthStyle(persona.cluster_label);
  const llm = getLLM(0.9);
  const chain = prompt.pipe(llm).pipe(parser);
  return await chain.invoke({
    bio: persona.bio,
    age: persona.demo.age,
    gender: persona.demo.gender === "male" ? "男" : "女",
    city: persona.demo.city,
    occupation: persona.demo.occupation,
    education: persona.demo.education,
    length_instruction: LENGTH_INSTRUCTION[style],
    user_prompt: buildUserPrompt(questionText, existingAnswers),
    format_instructions: parser.getFormatInstructions(),
  });
}
