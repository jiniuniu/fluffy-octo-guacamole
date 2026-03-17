"""
Generate 100 virtual personas from cluster profiles using OpenRouter + LangChain.

Usage:
    conda activate <your_env>
    OPENROUTER_API_KEY=xxx python generate_personas.py

Output: ../virtual_community/data/personas.json
"""

import asyncio
import json
import os
import random
from pathlib import Path

from langchain.output_parsers import OutputFixingParser
from langchain_core.output_parsers import PydanticOutputParser
from langchain_openai import ChatOpenAI
from pydantic import BaseModel, Field

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

PROFILES_FILE = Path("data/output_cluster_profiles.json")
OUTPUT_FILE = Path("../virtual_community/data/personas.json")
TOTAL = 100
MODEL = "google/gemini-3.1-flash-lite-preview"
CONCURRENCY = 10  # parallel LLM calls

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

CITIES = {
    "east": [
        "上海",
        "广州",
        "深圳",
        "杭州",
        "南京",
        "苏州",
        "宁波",
        "厦门",
        "青岛",
        "济南",
    ],
    "central": ["武汉", "郑州", "长沙", "合肥", "南昌", "太原", "石家庄"],
    "west": ["成都", "重庆", "西安", "昆明", "贵阳", "兰州", "乌鲁木齐", "南宁"],
    "northeast": ["沈阳", "长春", "哈尔滨", "大连"],
    "county": ["县城", "小镇", "农村"],
}

OCCUPATIONS = [
    "工厂工人",
    "外卖骑手",
    "快递员",
    "建筑工人",
    "超市收银员",
    "餐厅服务员",
    "销售",
    "理发师",
    "银行柜员",
    "行政文员",
    "会计",
    "教师",
    "护士",
    "程序员",
    "产品经理",
    "设计师",
    "市场运营",
    "医生",
    "律师",
    "工程师",
    "个体户",
    "小企业主",
    "电商卖家",
    "农民",
    "农村个体经营",
    "大学生",
    "待业",
    "国企职员",
    "公务员",
]

EDUCATIONS = ["小学", "初中", "高中", "中专", "大专", "本科", "研究生"]

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
# Demo sampling
# ---------------------------------------------------------------------------


def pick_demo(cluster: int, used_combos: set) -> dict:
    region_weights = {"east": 4, "central": 3, "west": 3, "northeast": 1, "county": 2}

    for _ in range(50):
        if cluster in (0, 3):
            age = random.randint(22, 42)
        elif cluster == 2:
            age = random.randint(35, 62)
        else:
            age = random.randint(20, 58)

        gender = random.choice(["male", "female"])
        region = random.choices(
            list(region_weights), weights=list(region_weights.values())
        )[0]
        city = random.choice(CITIES[region])

        if cluster in (0, 3):
            edu = random.choice(["大专", "本科", "本科", "研究生"])
        elif cluster in (2, 5):
            edu = random.choice(["初中", "高中", "高中", "中专", "大专"])
        else:
            edu = random.choice(EDUCATIONS)

        occ = random.choice(OCCUPATIONS)

        combo = (cluster, gender, city, occ)
        if combo not in used_combos:
            used_combos.add(combo)
            return {
                "age": age,
                "gender": gender,
                "city": city,
                "education": edu,
                "occupation": occ,
            }

    return {
        "age": age,
        "gender": gender,
        "city": city,
        "education": edu,
        "occupation": occ,
    }


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
# Async generation
# ---------------------------------------------------------------------------


def get_llm(temperature=0.9):
    return ChatOpenAI(
        model=MODEL,
        temperature=temperature,
        openai_api_key=os.environ["OPENROUTER_API_KEY"],
        openai_api_base="https://openrouter.ai/api/v1",
    )


async def generate_one(
    idx: int, cluster: int, demo: dict, sem: asyncio.Semaphore
) -> dict | None:
    parser = PydanticOutputParser(pydantic_object=PersonaOutput)
    fixing_parser = OutputFixingParser.from_llm(
        parser=parser, llm=get_llm(temperature=0)
    )
    llm = get_llm(temperature=0.9)

    prompt = build_prompt(cluster, demo, parser.get_format_instructions())

    async with sem:
        for attempt in range(3):
            try:
                response = await llm.ainvoke(prompt)
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
                print(
                    f"  [{idx:3d}] C{cluster} {demo['city']} {demo['occupation']} {demo['age']}岁{gender_str} ✓"
                )

                return {
                    "cluster": cluster,
                    "cluster_label": CLUSTER_LABELS[cluster],
                    "demo": demo,
                    "bio": output.bio,
                    "vector": vector,
                }
            except Exception as e:
                print(f"  [{idx:3d}] attempt {attempt+1} failed: {e}")

    print(f"  [{idx:3d}] SKIPPED after 3 failures")
    return None


async def main():
    used_combos: set = set()
    tasks = []
    idx = 1

    for cluster in sorted(counts.keys()):
        for _ in range(counts[cluster]):
            demo = pick_demo(cluster, used_combos)
            tasks.append((idx, cluster, demo))
            idx += 1

    sem = asyncio.Semaphore(CONCURRENCY)
    print(f"\nGenerating {len(tasks)} personas (concurrency={CONCURRENCY})...\n")

    coros = [generate_one(i, c, d, sem) for i, c, d in tasks]
    results_raw = await asyncio.gather(*coros)
    results = [r for r in results_raw if r is not None]

    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    print(f"\nDone. {len(results)}/{len(tasks)} personas saved to {OUTPUT_FILE}")


if __name__ == "__main__":
    asyncio.run(main())
