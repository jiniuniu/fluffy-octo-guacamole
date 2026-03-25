"use node";

import { z } from "zod";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { getLLM } from "./client";

const EnrichSchema = z.object({
  title: z.string().describe("简洁的问题标题，15字以内，概括核心议题"),
  description: z.string().describe("2-3句话的背景描述，说明这个问题的社会背景和讨论价值，客观中性"),
});

const parser = StructuredOutputParser.fromZodSchema(EnrichSchema);

const prompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `你是一个社会议题编辑助手。根据用户的输入，提炼出一个清晰的问题标题和简短的背景描述。

标题要求：简洁有力，15字以内，抓住核心争议点。
描述要求：2-3句话，说明问题的社会背景和讨论价值，保持客观中性，不带立场。

{format_instructions}`,
  ],
  ["user", "{input}"],
]);

export async function enrichQuestion(userInput: string) {
  const llm = getLLM(0.3);
  const chain = prompt.pipe(llm).pipe(parser);
  return await chain.invoke({
    input: userInput,
    format_instructions: parser.getFormatInstructions(),
  });
}
