"""
Test pick_demo sampling distribution.

Usage:
    python test_demographics.py [n_samples]   # default 1000
"""

import sys
import random
from collections import Counter, defaultdict
from demographics import pick_demo, OCC_GROUPS, CITIES
from generate_personas import CLUSTER_LABELS

N = int(sys.argv[1]) if len(sys.argv) > 1 else 1000

# city tier lookup
CITY_TO_TIER = {city: tier for tier, cities in CITIES.items() for city in cities}

# occupation group lookup
OCC_TO_GROUP = {occ: g for g, data in OCC_GROUPS.items() for occ in data["occupations"]}

print(f"Sampling {N} demos per cluster...\n")

for cluster in range(6):
    used_combos: set = set()
    samples = [pick_demo(cluster, used_combos) for _ in range(N)]

    occ_groups  = Counter(OCC_TO_GROUP.get(s["occupation"], "?") for s in samples)
    city_tiers  = Counter(CITY_TO_TIER.get(s["city"], "?") for s in samples)
    educations  = Counter(s["education"] for s in samples)
    genders     = Counter(s["gender"] for s in samples)
    ages        = [s["age"] for s in samples]

    print(f"{'─'*60}")
    print(f"  C{cluster} {CLUSTER_LABELS[cluster]}  (n={N})")
    print(f"{'─'*60}")

    print("  职业组分布:")
    for g, cnt in sorted(occ_groups.items(), key=lambda x: -x[1]):
        bar = "█" * (cnt * 30 // N)
        print(f"    {g:<10}  {cnt:4d} ({cnt*100//N:2d}%)  {bar}")

    print("  城市层级:")
    tier_order = ["tier1", "new_tier1", "tier2", "tier3", "rural"]
    tier_labels = {"tier1": "一线", "new_tier1": "新一线", "tier2": "二线", "tier3": "三线/县城", "rural": "农村"}
    for t in tier_order:
        cnt = city_tiers.get(t, 0)
        bar = "█" * (cnt * 30 // N)
        print(f"    {tier_labels[t]:<8}  {cnt:4d} ({cnt*100//N:2d}%)  {bar}")

    print("  学历:")
    edu_order = ["小学", "初中", "高中", "中专", "大专", "本科", "研究生"]
    for e in edu_order:
        cnt = educations.get(e, 0)
        bar = "█" * (cnt * 30 // N)
        print(f"    {e:<4}  {cnt:4d} ({cnt*100//N:2d}%)  {bar}")

    print(f"  性别:  男 {genders['male']*100//N}%  女 {genders['female']*100//N}%")
    print(f"  年龄:  min={min(ages)}  max={max(ages)}  avg={sum(ages)//len(ages)}")
    print()
