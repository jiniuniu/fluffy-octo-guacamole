from core.llm.capabilities import ModelCapability
from core.llm.factory import LLMFactory
from core.llm.providers import OpenAIProvider

# Initialize factory
llm_factory = LLMFactory()
# Register providers
llm_factory.register_provider("openai", OpenAIProvider())
