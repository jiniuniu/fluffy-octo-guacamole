"use node";

import { z } from "zod";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { getLLM } from "./client";

const EnrichSchema = z.object({
  title: z.string().describe("简洁的问题标题，15字以内，概括核心议题"),
  description: z.string().describe("2-3句话的背景描述，说明这个问题的社会背景和讨论价值，客观中性"),
  simulation_size: z.number().int().describe("建议参与模拟的虚拟人数，范围20-100。根据话题在中国社会语境下的争议程度决定：高争议/强价值观对立（如LGBT、孝道、移民）取80-100，中等争议（如996、躺平、全职太太）取40-60，低争议/偏事实性取20-30"),
});

const parser = StructuredOutputParser.fromZodSchema(EnrichSchema);

const prompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `你是一个社会议题编辑助手。根据用户的输入，提炼问题标题、背景描述，并评估话题的争议程度来决定模拟规模。

标题要求：简洁有力，15字以内，抓住核心争议点。
描述要求：2-3句话，说明问题的社会背景和讨论价值，保持客观中性，不带立场。
模拟规模：评估该话题在中国社会的争议烈度，给出20-100之间的整数。高争议话题（强价值观对立）取大值，低争议话题取小值。

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
