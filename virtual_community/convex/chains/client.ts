import { ChatOpenAI } from "@langchain/openai";

export function getLLM(temperature = 0.7) {
  return new ChatOpenAI({
    model: "google/gemini-3.1-flash-lite-preview",
    temperature,
    configuration: {
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY,
    },
  });
}
