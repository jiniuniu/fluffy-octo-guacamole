from typing import Literal

from core.chains import (
    PhysicsContent,
    SVGGeneration,
    create_content_chain,
    create_svg_chain,
)
from core.llm import get_llm


class AnimationGenerator:

    def __init__(self, model: Literal["claude", "qwen"] = "claude"):
        llm = get_llm(model=model)
        self.content_chain = create_content_chain(llm)
        self.svg_chain = create_svg_chain(llm)

    def answer_question(self, question: str) -> str:
        physics_content: PhysicsContent = self.content_chain.invoke(
            {"question": question}
        )
        return physics_content

    def generate_animation(
        self,
        question: str,
        physics_content: PhysicsContent,
    ) -> SVGGeneration:
        svg_generation = self.svg_chain.invoke(
            {
                "question": question,
                "explanation": physics_content.explanation,
            }
        )
        return svg_generation
