"use node";

import { action } from "./_generated/server";
import { ChatOpenAI } from "@langchain/openai";

const SYSTEM = "你正在扮演一个真实的中国网民，32岁，男，上海，互联网从业者。说话直接，30-60字，微博短评风格。";
const USER = "话题：年轻人该不该买房？";

async function call(label: string, reasoningEnabled: boolean) {
  const model = process.env.LLM_MODEL ?? "x-ai/grok-4.1-fast";
  const llm = new ChatOpenAI({
    model,
    temperature: 0.7,
    configuration: {
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY,
    },
    modelKwargs: {
      reasoning: { enabled: reasoningEnabled },
    },
  });

  const result = await llm.invoke([
    { role: "system", content: SYSTEM },
    { role: "user", content: USER },
  ]);

  const usage = result.response_metadata?.tokenUsage ?? result.usage_metadata ?? {};
  console.log(`\n[${label}]`);
  console.log(`  output: ${result.content}`);
  console.log(`  tokens:`, JSON.stringify(usage));
}

export const testLLM = action({
  args: {},
  handler: async () => {
    await call("reasoning=off", false);
    await call("reasoning=on ", true);
  },
});
