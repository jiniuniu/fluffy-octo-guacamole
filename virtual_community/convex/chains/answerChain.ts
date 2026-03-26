"use node";

import { z } from "zod";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { getLLM } from "./client";

const AnswerSchema = z.object({
  text: z.string().describe("回答正文，符合人物语气，不要透露自己的身份信息"),
  stance: z.string().describe("从提供的立场选项中选择一个最符合你观点的，必须完全匹配给定选项之一"),
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

// Per-cluster: [lengthBias, tempMin, tempMax]
// tempMin/tempMax define the sampling range for temperature
const CLUSTER_PROFILE: Record<string, { bias: number; tempMin: number; tempMax: number }> = {
  沉默中间派:  { bias: -1, tempMin: 0.6, tempMax: 0.8 },
  开放理性派:  { bias:  1, tempMin: 0.7, tempMax: 0.9 },
  现代进步派:  { bias:  0, tempMin: 0.75, tempMax: 0.95 },
  乐观爱国派:  { bias:  0, tempMin: 0.65, tempMax: 0.85 },
  传统全能派:  { bias:  0, tempMin: 0.6, tempMax: 0.8 },
  功利强权派:  { bias: -1, tempMin: 0.55, tempMax: 0.75 },
};

function sampleTemperature(clusterLabel: string): number {
  const { tempMin, tempMax } = CLUSTER_PROFILE[clusterLabel] ?? { tempMin: 0.9, tempMax: 1.2 };
  return tempMin + Math.random() * (tempMax - tempMin);
}

function sampleLengthStyle(clusterLabel: string): LengthStyle {
  const bias = CLUSTER_PROFILE[clusterLabel]?.bias ?? 0;
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

请完全以这个人物的身份、语气、教育背景和价值观来发言。不同年龄、职业、城市的人说话方式差异很大——一个50岁工厂工人和一个25岁互联网从业者的表达方式应该截然不同。直接表达这个人物会有的真实想法，不要试图客观或全面。不要透露任何关于你是AI或角色扮演的信息。

字数要求：{length_instruction}

立场选项（必须从以下选项中选一个）：{stances}

{format_instructions}`,
  ],
  ["user", "{user_prompt}"],
]);

function buildUserPrompt(
  questionText: string,
  description: string,
  existingAnswers: { text: string; stance: string }[],
): string {
  let prompt = `话题：${questionText}\n\n背景：${description}`;
  if (existingAnswers.length > 0) {
    prompt += `\n\n当前已有观点（按热度排序）：\n`;
    prompt += existingAnswers
      .slice(0, 10)
      .map((a, i) => `${i + 1}. [${a.stance}] ${a.text}`)
      .join("\n\n");
    prompt += `\n\n请以你自己的方式发表看法，可以回应已有观点，也可以提出新角度。`;
  }
  return prompt;
}

export async function generateAnswer(
  persona: Persona,
  questionText: string,
  description: string,
  existingAnswers: { text: string; stance: string }[],
  stances: string[],
) {
  const style = sampleLengthStyle(persona.cluster_label);
  const temperature = sampleTemperature(persona.cluster_label);
  const llm = getLLM(temperature);
  const chain = prompt.pipe(llm).pipe(parser);
  return await chain.invoke({
    bio: persona.bio,
    age: persona.demo.age,
    gender: persona.demo.gender === "male" ? "男" : "女",
    city: persona.demo.city,
    occupation: persona.demo.occupation,
    education: persona.demo.education,
    length_instruction: LENGTH_INSTRUCTION[style],
    stances: stances.join(" / "),
    user_prompt: buildUserPrompt(questionText, description, existingAnswers),
    format_instructions: parser.getFormatInstructions(),
  });
}
