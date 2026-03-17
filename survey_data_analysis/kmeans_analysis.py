"""
K-means clustering on Chinese values survey data.

Key design choices:
- No PCA: use all 166 Likert features directly
- Group-level normalization: each group scaled independently for equal weight
- Print full profiles for ALL K values so semantic quality can be judged visually
- Save outputs for SAVE_K (default: best silhouette, override in config)
"""

import json
import sys
import numpy as np
import pandas as pd
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
import warnings
warnings.filterwarnings("ignore")

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

DATA_DIR = "data"
SCHEMA_FILE = f"{DATA_DIR}/schema.jsonl"
RESPONSES_FILE = f"{DATA_DIR}/responses.jsonl"

TARGET_GROUPS = {
    "SEQ01", "SEQ02", "SEQ03", "SEQ05",
    "OTQ01", "OTQ02", "OTQ03", "OTQ04", "OTQ05", "OTQ06", "OTQ07", "OTQ08", "OTQ10",
    "GRQ01", "GRQ02", "GRQ07", "GRQ08", "GRQ09",
    "MAQ01", "MAQ02",
}

EXCLUDE_FIELDS = {
    "GRQ0712", "GRQ0809_1", "GRQ0809_1_Other", "GRQ0809_2", "GRQ0809_2_Other",
    "GRQ0912_1", "GRQ0912_2", "GRQ0912_3", "OTQ0717",
    "OTQ0616", "OTQ0617", "OTQ0618", "OTQ0619",
    "MAQ0112",
    "GRQ0107_1", "GRQ0107_2", "GRQ0107_3",
    "GRQ0208",
    "OTQ0615_1", "OTQ0615_2",
    "OTQ0712", "OTQ0713", "OTQ0714", "OTQ0716_choice", "OTQ0716_reason",
    "SEQ0501", "SEQ0502_1", "SEQ0502_2",
    "MAQ0111",
    "GRQ0107_1_Other", "GRQ0107_2_Other", "GRQ0107_3_Other",
    "GRQ0208_Other", "GRQ0712_Other", "GRQ0716_Other",
}

MISSING_SENTINELS = {888, 999, -1}

K_RANGE = range(3, 11)

# Set to a specific int to override silhouette-based selection for saving
SAVE_K = 6

PROFILES_FILE = f"{DATA_DIR}/output_profiles_all_k.txt"

GROUP_LABELS = {
    "SEQ01": "对自己的看法和评价", "SEQ02": "对自己各方面的看法",
    "SEQ03": "对健康的看法",      "SEQ05": "人生目标",
    "OTQ01": "对社会和他人",      "OTQ02": "对生活的看法",
    "OTQ03": "对权力的看法",      "OTQ04": "和他人比较",
    "OTQ05": "性别观",            "OTQ06": "婚姻观",
    "OTQ07": "生育观",            "OTQ08": "对老人的看法",
    "OTQ10": "对性少数的看法",    "GRQ01": "工作和集体",
    "GRQ02": "对当今社会",        "GRQ07": "对中国的看法",
    "GRQ08": "国际形势",          "GRQ09": "传统文化",
    "MAQ01": "财富观（一）",      "MAQ02": "财富观（二）",
}

# ---------------------------------------------------------------------------
# 1. Load schema + select Likert fields
# ---------------------------------------------------------------------------

print("Loading schema...")
schema = {}
with open(SCHEMA_FILE) as f:
    for line in f:
        item = json.loads(line)
        schema[item["field_id"]] = item

target_fields = []
for fid, item in schema.items():
    if item["group_id"] not in TARGET_GROUPS:
        continue
    if fid in EXCLUDE_FIELDS:
        continue
    opts = item.get("options")
    if not opts:
        continue
    keys = list(opts.keys())
    try:
        numeric_keys = [int(k) for k in keys]
    except ValueError:
        continue
    valid_keys = [k for k in numeric_keys if k not in MISSING_SENTINELS and k >= 0]
    if len(valid_keys) >= 4 and max(valid_keys) <= 10:
        target_fields.append(fid)
        schema[fid]["_valid_max"] = max(valid_keys)
        schema[fid]["_valid_min"] = min(valid_keys)

print(f"Selected {len(target_fields)} Likert fields")

# ---------------------------------------------------------------------------
# 2. Load responses
# ---------------------------------------------------------------------------

print("Loading responses...")
records = []
with open(RESPONSES_FILE) as f:
    for line in f:
        r = json.loads(line)
        row = {"respondent_id": r["respondent_id"]}
        answers = r["answers"]
        for fid in target_fields:
            val = answers.get(fid)
            if val is None:
                row[fid] = np.nan
                continue
            if isinstance(val, list):
                row[fid] = np.nan
                continue
            try:
                num = int(val)
                if num in MISSING_SENTINELS or num < 0:
                    row[fid] = np.nan
                elif num < schema[fid]["_valid_min"] or num > schema[fid]["_valid_max"]:
                    row[fid] = np.nan
                else:
                    row[fid] = float(num)
            except (ValueError, TypeError):
                row[fid] = np.nan
        records.append(row)

df = pd.DataFrame(records).set_index("respondent_id")
df = df.loc[:, df.isnull().mean() <= 0.4]
df = df[df.isnull().mean(axis=1) <= 0.5]
feature_names = df.columns.tolist()
respondent_ids = df.index.tolist()
print(f"After filtering: {len(df)} respondents, {len(feature_names)} features")

# ---------------------------------------------------------------------------
# 3. Impute + group-level normalization
# ---------------------------------------------------------------------------

group_of = {fid: schema[fid]["group_id"] for fid in feature_names}
groups_present = sorted(set(group_of.values()))

imputer = SimpleImputer(strategy="median")
X = imputer.fit_transform(df)

X_normed = np.zeros_like(X, dtype=float)
for gid in groups_present:
    col_idx = [i for i, fid in enumerate(feature_names) if group_of[fid] == gid]
    scaler = StandardScaler()
    X_normed[:, col_idx] = scaler.fit_transform(X[:, col_idx])

print(f"Group-level normalization applied ({len(groups_present)} groups)")

# ---------------------------------------------------------------------------
# 4. K-means for K = 3..10
# ---------------------------------------------------------------------------

print(f"\n--- K-means metrics ---")
print(f"{'K':>4}  {'Inertia':>14}  {'Silhouette':>12}")
print("-" * 36)

rng = np.random.RandomState(42)
sample_idx = rng.choice(len(X_normed), size=min(2000, len(X_normed)), replace=False)

km_results = {}
for k in K_RANGE:
    km = KMeans(n_clusters=k, n_init=20, max_iter=500, random_state=42)
    labels = km.fit_predict(X_normed)
    inertia = km.inertia_
    sil = silhouette_score(X_normed[sample_idx], labels[sample_idx])
    km_results[k] = {"model": km, "labels": labels, "inertia": inertia, "silhouette": sil}
    print(f"{k:>4}  {inertia:>14.1f}  {sil:>12.4f}")

best_k_sil = max(km_results, key=lambda k: km_results[k]["silhouette"])
print(f"\nBest K by silhouette: {best_k_sil}")

# ---------------------------------------------------------------------------
# 5. Print profiles for all K values
# ---------------------------------------------------------------------------

overall_mean = df[feature_names].mean()

def profile_classes(k, labels):
    proportions = pd.Series(labels).value_counts(normalize=True).sort_index()
    df_tmp = df.copy()
    df_tmp["class"] = labels
    profiles = df_tmp.groupby("class")[feature_names].mean()

    print(f"\n{'='*62}")
    print(f"  K = {k}  (inertia={km_results[k]['inertia']:.0f}, silhouette={km_results[k]['silhouette']:.4f})")
    print(f"{'='*62}")

    for cls in sorted(proportions.index):
        class_mean = profiles.loc[cls]
        deviation = class_mean - overall_mean

        # Group-level summary
        group_devs = {}
        for fid in feature_names:
            gid = group_of[fid]
            group_devs.setdefault(gid, []).append(deviation[fid])
        group_summary = sorted(
            ((gid, np.mean(devs)) for gid, devs in group_devs.items()),
            key=lambda x: abs(x[1]), reverse=True
        )

        print(f"\n  Class {cls} ({proportions[cls]:.1%}, n={int(proportions[cls]*len(df))})")
        print(f"  {'Group':<6} {'Label':<18} {'Dev':>6}  Bar")
        for gid, dev in group_summary:
            bar = ("+" if dev > 0 else "-") * int(abs(dev) * 15)
            label = GROUP_LABELS.get(gid, gid)
            print(f"  {gid:<6} {label:<18} {dev:+.3f}  {bar}")

        # Top 5 questions
        top = deviation.abs().sort_values(ascending=False).head(5).index.tolist()
        print(f"  Top questions:")
        for fid in top:
            cv = class_mean[fid]
            ov = overall_mean[fid]
            d = "↑" if cv > ov else "↓"
            print(f"    {d} {fid}: {schema[fid]['question'][:42]}  ({cv:.2f} vs {ov:.2f})")

    return proportions, profiles

all_results = {}
log_lines = []

# Redirect print inside profile_classes to also capture to file
_orig_print = print
def _capture(*args, **kwargs):
    line = " ".join(str(a) for a in args)
    log_lines.append(line)
    _orig_print(*args, **kwargs)

# Monkey-patch print temporarily for profile loop
import builtins
builtins.print = _capture

for k in K_RANGE:
    proportions, profiles = profile_classes(k, km_results[k]["labels"])
    all_results[k] = {"proportions": proportions, "profiles": profiles}

builtins.print = _orig_print

with open(PROFILES_FILE, "w", encoding="utf-8") as f:
    f.write("\n".join(log_lines))
print(f"Saved: {PROFILES_FILE}")

# ---------------------------------------------------------------------------
# 6. Save outputs for chosen K
# ---------------------------------------------------------------------------

save_k = SAVE_K if SAVE_K is not None else best_k_sil
labels = km_results[save_k]["labels"]
proportions = all_results[save_k]["proportions"]
profiles = all_results[save_k]["profiles"]

print(f"\n>>> Saving outputs for K={save_k}")

pd.DataFrame({"respondent_id": respondent_ids, "class": labels}).to_csv(
    f"{DATA_DIR}/output_labeled.csv", index=False
)
print("Saved: data/output_labeled.csv")

profiles.to_csv(f"{DATA_DIR}/output_profiles.csv")
print("Saved: data/output_profiles.csv")

pd.DataFrame([
    {"k": k, "inertia": v["inertia"], "silhouette": v["silhouette"]}
    for k, v in km_results.items()
]).to_csv(f"{DATA_DIR}/output_kmeans_metrics.csv", index=False)
print("Saved: data/output_kmeans_metrics.csv")

# Compact JSON summary
summary = {
    "save_k": save_k,
    "method": "kmeans_group_normalized",
    "k_metrics": {k: {"inertia": v["inertia"], "silhouette": v["silhouette"]} for k, v in km_results.items()},
    "proportions": {int(k): float(v) for k, v in proportions.items()},
    "profiles": {}
}

for cls in sorted(proportions.index):
    class_mean = profiles.loc[cls]
    deviation = class_mean - overall_mean
    group_devs = {}
    for fid in feature_names:
        gid = group_of[fid]
        group_devs.setdefault(gid, []).append(deviation[fid])
    group_summary = {gid: float(np.mean(devs)) for gid, devs in group_devs.items()}
    top = deviation.abs().sort_values(ascending=False).head(20).index.tolist()
    summary["profiles"][int(cls)] = {
        "proportion": float(proportions[cls]),
        "n": int((labels == cls).sum()),
        "group_deviations": group_summary,
        "top_features": [
            {
                "field_id": fid,
                "question": schema[fid]["question"],
                "group": schema[fid]["group_id"],
                "group_label": GROUP_LABELS.get(schema[fid]["group_id"], ""),
                "class_mean": float(class_mean[fid]),
                "overall_mean": float(overall_mean[fid]),
                "delta": float(deviation[fid]),
            }
            for fid in top
        ]
    }

with open(f"{DATA_DIR}/output_cluster_profiles.json", "w", encoding="utf-8") as f:
    json.dump(summary, f, ensure_ascii=False, indent=2)
print("Saved: data/output_cluster_profiles.json")

print("\nDone.")
