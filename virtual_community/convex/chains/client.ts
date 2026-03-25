import { ChatOpenAI } from "@langchain/openai";

export function getLLM(temperature = 0.7) {
  const model = process.env.LLM_MODEL ?? "x-ai/grok-4.1-fast";
  return new ChatOpenAI({
    model,
    temperature,
    configuration: {
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY,
    },
    modelKwargs: {
      reasoning: { enabled: false },
    },
  });
}
