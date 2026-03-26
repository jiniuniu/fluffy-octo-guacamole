"""
Print the final prompt that would be sent to the LLM for one persona.

Usage:
    python print_prompt.py [cluster_id]

    cluster_id: 0-5 (default: 0)
"""

import sys
import random
from generate_personas import build_prompt, CLUSTER_LABELS
from demographics import pick_demo
from langchain_core.output_parsers import PydanticOutputParser
from generate_personas import PersonaOutput

cluster = int(sys.argv[1]) if len(sys.argv) > 1 else 0

parser = PydanticOutputParser(pydantic_object=PersonaOutput)
format_instructions = parser.get_format_instructions()

used_combos: set = set()
demo = pick_demo(cluster, used_combos)
prompt = build_prompt(cluster, demo, format_instructions)

print(f"=== Cluster {cluster}: {CLUSTER_LABELS[cluster]} ===")
print(f"Demo: {demo}")
print()
print("--- PROMPT ---")
print(prompt)
