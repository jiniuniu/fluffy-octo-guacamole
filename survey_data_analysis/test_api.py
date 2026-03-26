"""
Test DashScope API connection and verify thinking mode is disabled.
Uses LangChain ChatOpenAI (same as generate_personas.py).

Usage:
    python test_api.py
"""

import os
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage

load_dotenv()

API_KEY = os.environ["LLM_API_KEY"]
BASE_URL = os.environ["LLM_BASE_URL"]
MODEL = os.environ["LLM_MODEL"]

print(f"Model:    {MODEL}")
print(f"Base URL: {BASE_URL}")
print()


def call(label: str, enable_thinking: bool):
    llm = ChatOpenAI(
        model=MODEL,
        api_key=API_KEY,
        base_url=BASE_URL,
        temperature=0,
        extra_body={"enable_thinking": enable_thinking},
    )

    print(f"=== {label} (enable_thinking={enable_thinking}) ===")
    resp = llm.invoke([HumanMessage(content="1+1等于几？只回答数字。")])

    # content
    print(f"content:           {resp.content!r}")

    # reasoning_content — check all possible locations LangChain might put it
    reasoning = (
        resp.additional_kwargs.get("reasoning_content")
        or resp.response_metadata.get("reasoning_content")
        # some LC versions nest it under the raw message
        or (resp.additional_kwargs.get("message") or {}).get("reasoning_content")
    )
    print(f"reasoning_content: {reasoning!r}")

    # token usage
    usage = resp.response_metadata.get("token_usage", {})
    prompt_tokens     = usage.get("prompt_tokens", "—")
    completion_tokens = usage.get("completion_tokens", "—")
    reasoning_tokens  = (usage.get("completion_tokens_details") or {}).get("reasoning_tokens")
    total_tokens      = usage.get("total_tokens", "—")

    print(f"tokens:            prompt={prompt_tokens}  completion={completion_tokens}  "
          f"reasoning={reasoning_tokens}  total={total_tokens}")
    print()

    return reasoning_tokens


rt1 = call("Test 1: thinking OFF", enable_thinking=False)
rt2 = call("Test 2: thinking ON",  enable_thinking=True)

print("=== Summary ===")
if not rt1 and rt2:
    print(f"✓ enable_thinking=False 有效：Test1 reasoning_tokens={rt1}，Test2 reasoning_tokens={rt2}")
elif not rt1 and not rt2:
    print("⚠ 两个测试 reasoning_tokens 均为空 —— 该模型可能不支持 thinking")
elif rt1 and rt2:
    print(f"✗ enable_thinking=False 未生效：Test1 reasoning_tokens={rt1}，Test2 reasoning_tokens={rt2}")
else:
    print("? 结果异常，请检查输出")
