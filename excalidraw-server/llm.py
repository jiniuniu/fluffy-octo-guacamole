from config import settings
from langchain_openai import ChatOpenAI


def get_llm(temperature: float = 0.7) -> ChatOpenAI:

    llm_kwargs = {
        "api_key": settings.llm_api_key,
        "model": settings.llm_model,
        "temperature": temperature,
        "base_url": settings.llm_base_url,
    }

    return ChatOpenAI(**llm_kwargs)
