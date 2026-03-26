"""
Analyze the generated 1000 personas and output statistics for how-it-works page.

Usage:
    python analyze_personas.py

Output: data/analysis_output.json
"""

import json
from pathlib import Path
from collections import Counter, defaultdict

INPUT_FILE = Path("data/personas.json")
OUTPUT_FILE = Path("data/analysis_output.json")

CLUSTER_LABELS = {
    0: "现代进步派",
    1: "乐观爱国派",
    2: "传统全能派",
    3: "开放理性派",
    4: "沉默中间派",
    5: "功利强权派",
}

CITY_TIERS = {
    "tier1":     ["北京", "上海", "广州", "深圳"],
    "new_tier1": ["杭州", "成都", "武汉", "南京", "重庆", "西安", "苏州", "长沙",
                  "天津", "郑州", "青岛", "宁波", "东莞", "佛山", "合肥"],
    "tier2":     ["昆明", "贵阳", "南昌", "太原", "石家庄", "福州", "厦门",
                  "温州", "无锡", "大连", "沈阳", "长春", "哈尔滨", "南宁",
                  "兰州", "乌鲁木齐", "银川", "西宁", "济南", "烟台", "威海",
                  "绵阳", "宜宾", "遵义", "大理", "丽江", "鞍山", "吉林",
                  "洛阳", "襄阳", "岳阳", "衡阳", "赣州", "台州", "潍坊"],
    "tier3":     ["河南某县城", "湖南某县城", "四川某县城", "山东某县城",
                  "安徽某县城", "广西某县城", "江西某小镇", "贵州某小镇",
                  "湖北某乡镇", "东北某小城", "内蒙古某县城", "甘肃某县城"],
    "rural":     ["河北农村", "河南农村", "湖南农村", "四川农村", "广东农村",
                  "山东农村", "安徽农村", "湖北农村", "江西农村", "广西农村"],
}
CITY_TO_TIER = {city: tier for tier, cities in CITY_TIERS.items() for city in cities}
TIER_LABELS = {
    "tier1": "一线城市",
    "new_tier1": "新一线",
    "tier2": "二线城市",
    "tier3": "三线/县城",
    "rural": "农村",
}

EDU_ORDER = ["小学", "初中", "高中", "中专", "大专", "本科", "研究生"]

OCC_GROUPS = {
    "高知专业": ["医生", "律师", "大学教授", "大学讲师", "科研人员",
                 "金融分析师", "投资经理", "基金经理", "建筑师",
                 "心理咨询师", "咨询顾问", "记者", "编辑"],
    "技术白领": ["程序员", "产品经理", "工程师", "设计师",
                 "市场运营", "新媒体运营", "数据分析师", "项目经理",
                 "高管", "部门总监"],
    "普通白领": ["银行柜员", "行政文员", "会计", "出纳", "人事专员",
                 "客服", "教师", "培训机构老师", "护士", "药剂师",
                 "国企职员", "公务员", "事业单位职员"],
    "服务技能": ["销售", "房产中介", "保险销售", "理发师", "美甲师",
                 "厨师", "餐厅服务员", "超市收银员", "超市理货员",
                 "保安", "保洁员", "家政工", "月嫂", "育儿嫂", "摄影师"],
    "体力蓝领": ["工厂工人", "流水线工人", "建筑工人", "装修工人",
                 "外卖骑手", "快递员", "司机", "网约车司机", "货车司机"],
    "自营个体": ["个体户", "小企业主", "电商卖家",
                 "直播带货主播", "短视频博主", "自由职业者",
                 "农村个体经营"],
    "农业":     ["农民"],
    "学生":     ["大学生", "职校学生"],
    "无业退休": ["待业", "退休人员"],
}
OCC_TO_GROUP = {occ: g for g, occs in OCC_GROUPS.items() for occ in occs}

AGE_BUCKETS = [(18, 29), (30, 39), (40, 49), (50, 59), (60, 70)]
AGE_LABELS = ["18–29岁", "30–39岁", "40–49岁", "50–59岁", "60岁以上"]


def bucket_age(age):
    for i, (lo, hi) in enumerate(AGE_BUCKETS):
        if lo <= age <= hi:
            return AGE_LABELS[i]
    return "其他"


with open(INPUT_FILE, encoding="utf-8") as f:
    personas = json.load(f)

total = len(personas)
print(f"Loaded {total} personas")

# ---------------------------------------------------------------------------
# 1. 聚类分布
# ---------------------------------------------------------------------------
cluster_counts = Counter(p["cluster"] for p in personas)
cluster_dist = [
    {
        "cluster": c,
        "label": CLUSTER_LABELS[c],
        "count": cluster_counts[c],
        "pct": round(cluster_counts[c] / total * 100, 1),
    }
    for c in sorted(cluster_counts)
]

# ---------------------------------------------------------------------------
# 2. 全局人口统计分布
# ---------------------------------------------------------------------------
def dist(counter, keys=None):
    total_n = sum(counter.values())
    if keys is None:
        keys = sorted(counter.keys())
    return [{"label": k, "count": counter[k], "pct": round(counter[k] / total_n * 100, 1)}
            for k in keys if counter.get(k, 0) > 0]

tier_counter   = Counter(CITY_TO_TIER.get(p["demo"]["city"], "?") for p in personas)
edu_counter    = Counter(p["demo"]["education"] for p in personas)
occ_grp_counter = Counter(OCC_TO_GROUP.get(p["demo"]["occupation"], "其他") for p in personas)
gender_counter = Counter(p["demo"]["gender"] for p in personas)
age_counter    = Counter(bucket_age(p["demo"]["age"]) for p in personas)

global_stats = {
    "city_tier": dist(tier_counter, list(TIER_LABELS.keys())),
    "education": dist(edu_counter, EDU_ORDER),
    "occ_group": dist(occ_grp_counter, list(OCC_GROUPS.keys())),
    "gender":    [
        {"label": "男", "count": gender_counter["male"],   "pct": round(gender_counter["male"]   / total * 100, 1)},
        {"label": "女", "count": gender_counter["female"], "pct": round(gender_counter["female"] / total * 100, 1)},
    ],
    "age":       dist(age_counter, AGE_LABELS),
}

# ---------------------------------------------------------------------------
# 3. 聚类 × 人口统计交叉分析
# ---------------------------------------------------------------------------
by_cluster = defaultdict(list)
for p in personas:
    by_cluster[p["cluster"]].append(p)

cross = {}
for c, group in by_cluster.items():
    n = len(group)
    cross[str(c)] = {
        "n": n,
        "city_tier": dist(
            Counter(CITY_TO_TIER.get(p["demo"]["city"], "?") for p in group),
            list(TIER_LABELS.keys())
        ),
        "education": dist(
            Counter(p["demo"]["education"] for p in group),
            EDU_ORDER
        ),
        "occ_group": dist(
            Counter(OCC_TO_GROUP.get(p["demo"]["occupation"], "其他") for p in group),
            list(OCC_GROUPS.keys())
        ),
        "age": dist(
            Counter(bucket_age(p["demo"]["age"]) for p in group),
            AGE_LABELS
        ),
        "gender": {
            "male_pct":   round(sum(1 for p in group if p["demo"]["gender"] == "male")   / n * 100, 1),
            "female_pct": round(sum(1 for p in group if p["demo"]["gender"] == "female") / n * 100, 1),
        },
        "avg_age": round(sum(p["demo"]["age"] for p in group) / n, 1),
    }

# ---------------------------------------------------------------------------
# 4. 城市层级 × 聚类 矩阵（热力图数据）
# ---------------------------------------------------------------------------
tier_x_cluster = {}
for tier in TIER_LABELS:
    tier_x_cluster[tier] = {}
    tier_personas = [p for p in personas if CITY_TO_TIER.get(p["demo"]["city"]) == tier]
    tier_n = len(tier_personas)
    for c in range(6):
        cnt = sum(1 for p in tier_personas if p["cluster"] == c)
        tier_x_cluster[tier][str(c)] = {
            "count": cnt,
            "pct_of_tier":    round(cnt / tier_n * 100, 1) if tier_n else 0,
            "pct_of_cluster": round(cnt / cluster_counts[c] * 100, 1),
        }

# ---------------------------------------------------------------------------
# 5. 学历 × 聚类 矩阵
# ---------------------------------------------------------------------------
edu_x_cluster = {}
for edu in EDU_ORDER:
    edu_personas = [p for p in personas if p["demo"]["education"] == edu]
    edu_n = len(edu_personas)
    edu_x_cluster[edu] = {}
    for c in range(6):
        cnt = sum(1 for p in edu_personas if p["cluster"] == c)
        edu_x_cluster[edu][str(c)] = {
            "count": cnt,
            "pct_of_cluster": round(cnt / cluster_counts[c] * 100, 1),
        }

# ---------------------------------------------------------------------------
# Output
# ---------------------------------------------------------------------------
output = {
    "total": total,
    "cluster_dist": cluster_dist,
    "global_stats": global_stats,
    "cross_by_cluster": cross,
    "tier_x_cluster": tier_x_cluster,
    "edu_x_cluster": edu_x_cluster,
    "tier_labels": TIER_LABELS,
    "cluster_labels": {str(k): v for k, v in CLUSTER_LABELS.items()},
}

OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

print(f"\nSaved to {OUTPUT_FILE}")

# ---------------------------------------------------------------------------
# Quick summary print
# ---------------------------------------------------------------------------
print("\n=== 聚类分布 ===")
for c in cluster_dist:
    bar = "█" * int(c["pct"] / 2)
    print(f"  C{c['cluster']} {c['label']:<8} {c['count']:>4}人 ({c['pct']:>4}%)  {bar}")

print("\n=== 城市层级（全局）===")
for item in global_stats["city_tier"]:
    bar = "█" * int(item["pct"] / 3)
    print(f"  {TIER_LABELS.get(item['label'], item['label']):<8} {item['count']:>4}人 ({item['pct']:>4}%)  {bar}")

print("\n=== 学历（全局）===")
for item in global_stats["education"]:
    bar = "█" * int(item["pct"] / 2)
    print(f"  {item['label']:<4} {item['count']:>4}人 ({item['pct']:>4}%)  {bar}")

print("\n=== 职业组（全局）===")
for item in global_stats["occ_group"]:
    bar = "█" * int(item["pct"] / 2)
    print(f"  {item['label']:<6} {item['count']:>4}人 ({item['pct']:>4}%)  {bar}")

print("\n=== 年龄分布（全局）===")
for item in global_stats["age"]:
    bar = "█" * int(item["pct"] / 2)
    print(f"  {item['label']:<8} {item['count']:>4}人 ({item['pct']:>4}%)  {bar}")

print("\n=== 各聚类平均年龄 ===")
for c in range(6):
    print(f"  C{c} {CLUSTER_LABELS[c]:<8}  avg={cross[str(c)]['avg_age']}岁")
