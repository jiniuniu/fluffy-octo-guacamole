from langchain_core.output_parsers import PydanticOutputParser
from langchain_core.prompts import ChatPromptTemplate
from llm import get_llm
from models import GraphInput
from prompts import SYSTEM, TIPS, USER_TMPL


def build_chain():
    """构建LangChain处理链 - 使用PydanticOutputParser"""
    llm = get_llm()

    # 创建Pydantic解析器
    parser = PydanticOutputParser(pydantic_object=GraphInput)

    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", SYSTEM),
            ("system", TIPS),
            ("user", USER_TMPL),
        ]
    )

    # LCEL: prompt | model | parser
    chain = prompt | llm | parser
    return chain, parser


def generate_graph_sync(prompt: str, rankdir: str = "LR") -> GraphInput:
    """同步生成图结构"""
    chain, parser = build_chain()

    result: GraphInput = chain.invoke(
        {
            "prompt": prompt,
            "rankdir": rankdir,
            "format_instructions": parser.get_format_instructions(),
        }
    )
    return result
