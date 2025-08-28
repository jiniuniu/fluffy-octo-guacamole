from dotenv import load_dotenv
from pydantic import Field
from pydantic_settings import BaseSettings

load_dotenv()


class Settings(BaseSettings):
    llm_api_key: str = Field(..., env="LLM_API_KEY")
    llm_model: str = Field(..., env="LLM_MODEL")
    llm_base_url: str = Field(
        default="https://openrouter.ai/api/v1",
        env="LLM_BASE_URL",
    )

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
