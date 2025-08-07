import os

from dotenv import load_dotenv
from langchain_openai import ChatOpenAI

load_dotenv()


def get_llm(model: str = "claude", temperature: float = 0.2):
    if model == "claude":
        return ChatOpenAI(
            api_key=os.getenv("OPENROUTER_API_KEY"),
            model="anthropic/claude-sonnet-4",
            temperature=temperature,
            base_url="https://openrouter.ai/api/v1",
        )

    elif model == "qwen":
        return ChatOpenAI(
            api_key=os.getenv("QWEN_API_KEY"),
            model="qwen3-coder-plus",
            temperature=temperature,
            base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
        )
