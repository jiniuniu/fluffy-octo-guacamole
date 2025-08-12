from core.prompts import (
    CONTENT_PROMPT_TEMPLATE,
    SVG_MODIFY_PROMPT_TEMPLATE,
    SVG_PROMPT_TEMPLATE,
    SVG_PROMPT_TEMPLATE_STATIC,
)
from langchain_core.output_parsers import PydanticOutputParser
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import Runnable
from langchain_openai import ChatOpenAI
from pydantic import BaseModel, Field


class PhysicsContent(BaseModel):
    """物理内容响应模型"""

    explanation: str = Field(min_length=50, description="物理解释必须至少50个字符")


def create_content_chain(llm: ChatOpenAI) -> Runnable:
    parser = PydanticOutputParser(pydantic_object=PhysicsContent)

    prompt = PromptTemplate(
        template=CONTENT_PROMPT_TEMPLATE,
        input_variables=["question"],
        partial_variables={"format_instructions": parser.get_format_instructions()},
    )

    chain = prompt | llm | parser

    return chain


class SVGGeneration(BaseModel):
    """SVG生成响应模型"""

    svgCode: str = Field(min_length=100, description="SVG代码必须有实质内容")


def create_svg_chain(llm: ChatOpenAI, svg_type: str = "dynamic") -> Runnable:
    parser = PydanticOutputParser(pydantic_object=SVGGeneration)

    # 根据 svg_type 选择不同的 prompt 模板
    if svg_type == "static":
        template = SVG_PROMPT_TEMPLATE_STATIC
    else:
        template = SVG_PROMPT_TEMPLATE

    prompt = PromptTemplate(
        template=template,
        input_variables=["question", "explanation"],
        partial_variables={"format_instructions": parser.get_format_instructions()},
    )

    chain = prompt | llm | parser
    return chain


class SVGModification(BaseModel):
    """SVG修改响应模型"""

    svgCode: str = Field(min_length=100, description="修改后的SVG代码必须有实质内容")


def create_svg_modify_chain(llm: ChatOpenAI) -> Runnable:
    """创建SVG修改chain"""
    parser = PydanticOutputParser(pydantic_object=SVGModification)

    prompt = PromptTemplate(
        template=SVG_MODIFY_PROMPT_TEMPLATE,
        input_variables=[
            "question",
            "explanation",
            "current_svg",
            "user_feedback",
            "recent_modifications_text",
        ],
        partial_variables={"format_instructions": parser.get_format_instructions()},
    )

    chain = prompt | llm | parser
    return chain
