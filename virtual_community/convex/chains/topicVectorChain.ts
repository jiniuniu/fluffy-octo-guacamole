"use node";

import { z } from "zod";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { getLLM } from "./client";

const DIMENSIONS: Record<string, string> = {
  SEQ01: "对自己的看法和评价",
  SEQ02: "对自己各方面的看法",
  SEQ03: "对健康的看法",
  SEQ05: "人生目标",
  OTQ01: "对社会和他人",
  OTQ02: "对生活的看法",
  OTQ03: "对权力的看法",
  OTQ04: "和他人比较",
  OTQ05: "性别观",
  OTQ06: "婚姻观",
  OTQ07: "生育观",
  OTQ08: "对老人的看法",
  OTQ10: "对性少数的看法",
  GRQ01: "工作和集体",
  GRQ02: "对当今社会",
  GRQ07: "对中国的看法",
  GRQ08: "国际形势",
  GRQ09: "传统文化",
  MAQ01: "财富观（一）",
  MAQ02: "财富观（二）",
};

const TopicVectorSchema = z.object({
  SEQ01: z.number().min(0).max(1).optional(),
  SEQ02: z.number().min(0).max(1).optional(),
  SEQ03: z.number().min(0).max(1).optional(),
  SEQ05: z.number().min(0).max(1).optional(),
  OTQ01: z.number().min(0).max(1).optional(),
  OTQ02: z.number().min(0).max(1).optional(),
  OTQ03: z.number().min(0).max(1).optional(),
  OTQ04: z.number().min(0).max(1).optional(),
  OTQ05: z.number().min(0).max(1).optional(),
  OTQ06: z.number().min(0).max(1).optional(),
  OTQ07: z.number().min(0).max(1).optional(),
  OTQ08: z.number().min(0).max(1).optional(),
  OTQ10: z.number().min(0).max(1).optional(),
  GRQ01: z.number().min(0).max(1).optional(),
  GRQ02: z.number().min(0).max(1).optional(),
  GRQ07: z.number().min(0).max(1).optional(),
  GRQ08: z.number().min(0).max(1).optional(),
  GRQ09: z.number().min(0).max(1).optional(),
  MAQ01: z.number().min(0).max(1).optional(),
  MAQ02: z.number().min(0).max(1).optional(),
});

const parser = StructuredOutputParser.fromZodSchema(TopicVectorSchema);

const prompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `你是一个社会学分析助手。给定一个用户问题，分析它涉及哪些价值观维度，并给出每个维度的相关度分数（0=完全无关，1=高度相关）。

可用维度：
${Object.entries(DIMENSIONS)
  .map(([k, v]) => `- ${k}: ${v}`)
  .join("\n")}

只输出相关度大于0.1的维度，不相关的维度省略。

{format_instructions}`,
  ],
  ["user", "{question}"],
]);

export async function extractTopicVector(questionText: string) {
  const llm = getLLM(0);
  const chain = prompt.pipe(llm).pipe(parser);
  return await chain.invoke({
    question: questionText,
    format_instructions: parser.getFormatInstructions(),
  });
}
