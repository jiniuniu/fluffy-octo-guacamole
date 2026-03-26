"""
Generate virtual personas from cluster profiles using LangChain + DashScope.

Usage:
    python generate_personas.py            # full run (TOTAL personas)
    python generate_personas.py --test 5   # smoke test, no file output

Output: ../virtual_community/data/personas.json
Checkpoint: data/personas_checkpoint.jsonl  (delete to start fresh)
"""

import asyncio
import json
import os
import random
from pathlib import Path

from dotenv import load_dotenv
from langchain.output_parsers import OutputFixingParser
from langchain_core.output_parsers import PydanticOutputParser
from langchain_openai import ChatOpenAI
from pydantic import BaseModel, Field
from demographics import pick_demo

load_dotenv()

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

PROFILES_FILE = Path("data/output_cluster_profiles.json")
OUTPUT_FILE = Path("data/personas.json")
CHECKPOINT_FILE = Path("data/personas_checkpoint.jsonl")  # one JSON object per line
TOTAL = 1000
MODEL = os.environ.get("LLM_MODEL", "qwen3.5-flash")
API_KEY = os.environ.get("LLM_API_KEY") or os.environ.get("OPENROUTER_API_KEY")
BASE_URL = os.environ.get("LLM_BASE_URL", "https://dashscope.aliyuncs.com/compatible-mode/v1")
CONCURRENCY = 10  # parallel LLM calls
CHUNK_SIZE = 20   # flush to checkpoint after every N personas

CLUSTER_LABELS = {
    0: "现代进步派",
    1: "乐观爱国派",
    2: "传统全能派",
    3: "开放理性派",
    4: "沉默中间派",
    5: "功利强权派",
}

GROUP_LABELS = {
    "SEQ01": "对自己的看法和评价",
    "SEQ02": "对自己各方面的看法",
    "SEQ03": "对健康的看法",
    "SEQ05": "人生目标",
    "OTQ01": "对社会和他人",
    "OTQ02": "对生活的看法",
    "OTQ03": "对权力的看法",
    "OTQ04": "和他人比较",
    "OTQ05": "性别观",
    "OTQ06": "婚姻观",
    "OTQ07": "生育观",
    "OTQ08": "对老人的看法",
    "OTQ10": "对性少数的看法",
    "GRQ01": "工作和集体",
    "GRQ02": "对当今社会",
    "GRQ07": "对中国的看法",
    "GRQ08": "国际形势",
    "GRQ09": "传统文化",
    "MAQ01": "财富观（一）",
    "MAQ02": "财富观（二）",
}

# ---------------------------------------------------------------------------
# Pydantic schema
# ---------------------------------------------------------------------------


class PersonaOutput(BaseModel):
    bio: str = Field(
        description="人物背景描述，150-200字，不含姓名，通过具体生活经历体现价值观"
    )


# ---------------------------------------------------------------------------
# Load profiles
# ---------------------------------------------------------------------------

with open(PROFILES_FILE) as f:
    profiles = json.load(f)

# ---------------------------------------------------------------------------
# Compute per-cluster counts
# ---------------------------------------------------------------------------


def compute_counts(total: int) -> dict[int, int]:
    raw = {int(k): v * total for k, v in profiles["proportions"].items()}
    counts = {k: round(v) for k, v in raw.items()}
    diff = total - sum(counts.values())
    if diff != 0:
        largest = max(counts, key=lambda k: counts[k])
        counts[largest] += diff
    return counts


counts = compute_counts(TOTAL)
print("Persona counts per cluster:")
for k, c in sorted(counts.items()):
    print(f"  C{k} {CLUSTER_LABELS[k]}: {c}")
print(f"  Total: {sum(counts.values())}")

# ---------------------------------------------------------------------------
# Prompt builder
# ---------------------------------------------------------------------------


def build_prompt(cluster: int, demo: dict, format_instructions: str) -> str:
    profile = profiles["profiles"][str(cluster)]
    deviations = profile["group_deviations"]
    top_features = profile["top_features"][:8]

    sorted_devs = sorted(deviations.items(), key=lambda x: abs(x[1]), reverse=True)[:6]
    dim_lines = "\n".join(
        f"  - {GROUP_LABELS.get(gid, gid)}：{'偏高（更认同）' if dev > 0 else '偏低（更不认同）'}（偏差 {dev:+.2f}）"
        for gid, dev in sorted_devs
    )
    feat_lines = "\n".join(
        f"  - {f['question']}（该群体{'认同' if f['delta'] > 0 else '不认同'}）"
        for f in top_features
    )
    demo_str = f"{demo['age']}岁，{'男' if demo['gender'] == 'male' else '女'}，{demo['city']}，{demo['occupation']}，{demo['education']}学历"

    return f"""请为以下人物生成一段真实自然的背景描述（150-200字）。

人口信息：{demo_str}
所属价值观群体：{CLUSTER_LABELS[cluster]}

该群体的核心价值观特征：
{dim_lines}

该群体在以下具体问题上有明显立场：
{feat_lines}

要求：
- 不要出现姓名
- 不要直接说「他/她属于XXX群体」或点名价值观标签
- 通过具体的人生经历、家庭背景、生活选择来自然体现上述价值观
- 语言平实，像真实的人物小传
- 人物要有立体感，不是刻板印象的堆砌
- 严格控制在150-200字

{format_instructions}"""


# ---------------------------------------------------------------------------
# LLM
# ---------------------------------------------------------------------------


def get_llm(temperature=0.9):
    return ChatOpenAI(
        model=MODEL,
        temperature=temperature,
        api_key=API_KEY,
        base_url=BASE_URL,
        extra_body={"enable_thinking": False},
    )


# ---------------------------------------------------------------------------
# Token counter (thread-safe accumulator)
# ---------------------------------------------------------------------------


class TokenCounter:
    def __init__(self):
        self.prompt = 0
        self.completion = 0
        self.total = 0

    def add(self, response):
        usage = response.response_metadata.get("token_usage", {})
        self.prompt     += usage.get("prompt_tokens", 0) or 0
        self.completion += usage.get("completion_tokens", 0) or 0
        self.total      += usage.get("total_tokens", 0) or 0

    def report(self, n_personas: int):
        print(f"\n{'─'*50}")
        print(f"  Token usage summary")
        print(f"{'─'*50}")
        print(f"  Prompt tokens:     {self.prompt:>8,}")
        print(f"  Completion tokens: {self.completion:>8,}")
        print(f"  Total tokens:      {self.total:>8,}")
        if n_personas:
            print(f"  Avg per persona:   {self.total // n_personas:>8,}")
        print(f"{'─'*50}")


# ---------------------------------------------------------------------------
# Async generation
# ---------------------------------------------------------------------------


async def generate_batch(tasks: list[tuple[int, int, dict]], token_counter: TokenCounter) -> list[dict | None]:
    parser = PydanticOutputParser(pydantic_object=PersonaOutput)
    fixing_llm = get_llm(temperature=0)
    fixing_parser = OutputFixingParser.from_llm(parser=parser, llm=fixing_llm)
    llm = get_llm(temperature=0.9)

    format_instructions = parser.get_format_instructions()
    prompts = [build_prompt(c, d, format_instructions) for _, c, d in tasks]

    # abatch handles concurrency internally (max_concurrency=CONCURRENCY)
    responses = await llm.abatch(prompts, config={"max_concurrency": CONCURRENCY})

    results = []
    for (idx, cluster, demo), response in zip(tasks, responses):
        token_counter.add(response)
        try:
            try:
                output = parser.parse(response.content)
            except Exception:
                output = fixing_parser.parse(response.content)

            base_vector = profiles["profiles"][str(cluster)]["group_deviations"]
            vector = {
                dim: round(base_vector.get(dim, 0.0) + random.gauss(0, 0.15), 4)
                for dim in GROUP_LABELS
            }

            gender_str = "男" if demo["gender"] == "male" else "女"
            print(f"  [{idx:3d}] C{cluster} {CLUSTER_LABELS[cluster]}  {demo['city']} {demo['occupation']} {demo['age']}岁{gender_str} ✓")

            results.append({
                "cluster": cluster,
                "cluster_label": CLUSTER_LABELS[cluster],
                "demo": demo,
                "bio": output.bio,
                "vector": vector,
            })
        except Exception as e:
            print(f"  [{idx:3d}] FAILED: {e}")
            results.append(None)

    return results


def load_checkpoint() -> tuple[list[dict], set[int]]:
    """Load already-completed personas from checkpoint file."""
    if not CHECKPOINT_FILE.exists():
        return [], set()
    done = []
    done_idx = set()
    with open(CHECKPOINT_FILE, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                obj = json.loads(line)
                done.append(obj)
                done_idx.add(obj["_idx"])
    return done, done_idx


def append_checkpoint(persona: dict) -> None:
    CHECKPOINT_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(CHECKPOINT_FILE, "a", encoding="utf-8") as f:
        f.write(json.dumps(persona, ensure_ascii=False) + "\n")


async def main():
    import sys
    test_n = None
    if "--test" in sys.argv:
        pos = sys.argv.index("--test")
        test_n = int(sys.argv[pos + 1])

    # build full task list (deterministic order)
    used_combos: set = set()
    tasks = []
    i = 1
    for cluster in sorted(counts.keys()):
        for _ in range(counts[cluster]):
            demo = pick_demo(cluster, used_combos)
            tasks.append((i, cluster, demo))
            i += 1

    if test_n:
        tasks = tasks[:test_n]
        print(f"\n[TEST MODE] Running {test_n} personas only\n")

    # resume from checkpoint
    completed, done_idx = load_checkpoint()
    if done_idx and not test_n:
        print(f"Resuming: {len(done_idx)} personas already done, skipping...\n")
    pending = [(idx, c, d) for idx, c, d in tasks if idx not in done_idx]

    print(f"Generating {len(pending)} personas (concurrency={CONCURRENCY}, chunk={CHUNK_SIZE})...\n")

    token_counter = TokenCounter()

    # process in chunks so we checkpoint frequently
    for chunk_start in range(0, len(pending), CHUNK_SIZE):
        chunk = pending[chunk_start: chunk_start + CHUNK_SIZE]
        chunk_end = min(chunk_start + CHUNK_SIZE, len(pending))
        print(f"--- Chunk {chunk_start + 1}–{chunk_end} / {len(pending)} ---")

        results_raw = await generate_batch(chunk, token_counter)

        for (idx, cluster, demo), result in zip(chunk, results_raw):
            if result is not None:
                result["_idx"] = idx
                if not test_n:
                    append_checkpoint(result)
                completed.append(result)

        print(f"  checkpoint: {len(completed)} total saved")

    # strip internal _idx before final output
    final = [{k: v for k, v in p.items() if k != "_idx"} for p in completed]

    token_counter.report(len(final))

    if not test_n:
        OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
        with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
            json.dump(final, f, ensure_ascii=False, indent=2)
        print(f"\nDone. {len(final)}/{len(tasks)} personas saved to {OUTPUT_FILE}")
        print(f"(Checkpoint at {CHECKPOINT_FILE} — delete it to start fresh next time)")
    else:
        print(f"\n[TEST MODE] {len(final)}/{len(tasks)} succeeded. Output not saved.")
        print("\nSample bio:")
        if final:
            print(final[0]["bio"])


if __name__ == "__main__":
    asyncio.run(main())
