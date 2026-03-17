"""
LCA (Latent Class Analysis) on Chinese values survey data.

Steps:
1. Load schema + responses
2. Select Likert-scale fields from target groups
3. Map responses to ordinal numeric values, treat 888/999 and out-of-range as missing
4. Impute missing values (median per column)
5. PCA to reduce 166 features → N factors (chosen by explained variance)
6. GMM clustering on factors for K=3..8, pick best K by BIC
7. Output: factor loadings, cluster assignments, proportions, per-cluster profiles
"""

import json
import numpy as np
import pandas as pd
from sklearn.impute import SimpleImputer
from sklearn.mixture import GaussianMixture
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
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
    # multi-select
    "GRQ0712", "GRQ0809_1", "GRQ0809_1_Other", "GRQ0809_2", "GRQ0809_2_Other",
    "GRQ0912_1", "GRQ0912_2", "GRQ0912_3", "OTQ0717",
    # open numeric (age expectations)
    "OTQ0616", "OTQ0617", "OTQ0618", "OTQ0619",
    "MAQ0112",
    # nominal (not ordinal)
    "GRQ0107_1", "GRQ0107_2", "GRQ0107_3",
    "GRQ0208",
    "OTQ0615_1", "OTQ0615_2",
    "OTQ0712", "OTQ0713", "OTQ0714", "OTQ0716_choice", "OTQ0716_reason",
    "SEQ0501", "SEQ0502_1", "SEQ0502_2",
    "MAQ0111",
    # open text
    "GRQ0107_1_Other", "GRQ0107_2_Other", "GRQ0107_3_Other",
    "GRQ0208_Other", "GRQ0712_Other", "GRQ0716_Other",
}

MISSING_SENTINELS = {888, 999, -1}

# PCA: keep enough components to explain this much variance
PCA_VARIANCE_THRESHOLD = 0.70

K_RANGE = range(3, 10)

# ---------------------------------------------------------------------------
# 1. Load schema
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
# 2. Load responses → DataFrame
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
print(f"Loaded {len(df)} respondents, {len(target_fields)} features")

# ---------------------------------------------------------------------------
# 3. Drop high-missing columns/rows
# ---------------------------------------------------------------------------

col_missing = df.isnull().mean()
df = df.loc[:, col_missing <= 0.4]
print(f"After dropping high-missing columns: {df.shape[1]} features remain")

row_missing = df.isnull().mean(axis=1)
df = df[row_missing <= 0.5]
print(f"After dropping high-missing rows: {len(df)} respondents remain")

# ---------------------------------------------------------------------------
# 4. Impute + Standardize
# ---------------------------------------------------------------------------

feature_names = df.columns.tolist()
respondent_ids = df.index.tolist()

imputer = SimpleImputer(strategy="median")
X = imputer.fit_transform(df)

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

print(f"Feature matrix: {X_scaled.shape}")

# ---------------------------------------------------------------------------
# 5. PCA — find number of components for target variance explained
# ---------------------------------------------------------------------------

print(f"\n--- PCA (target: {PCA_VARIANCE_THRESHOLD:.0%} variance explained) ---")

pca_full = PCA(random_state=42)
pca_full.fit(X_scaled)

cumvar = np.cumsum(pca_full.explained_variance_ratio_)
n_components = int(np.argmax(cumvar >= PCA_VARIANCE_THRESHOLD) + 1)

print(f"Components needed for {PCA_VARIANCE_THRESHOLD:.0%} variance: {n_components}")
print(f"\nScree (first 20 components):")
print(f"{'PC':>4}  {'Eigenvalue':>10}  {'Var%':>8}  {'Cumulative%':>12}")
print("-" * 40)
for i in range(min(20, len(pca_full.explained_variance_))):
    ev = pca_full.explained_variance_[i]
    vr = pca_full.explained_variance_ratio_[i] * 100
    cv = cumvar[i] * 100
    marker = " <-- chosen cutoff" if i + 1 == n_components else ""
    print(f"{i+1:>4}  {ev:>10.3f}  {vr:>7.2f}%  {cv:>11.2f}%{marker}")

# Fit PCA with chosen n_components
pca = PCA(n_components=n_components, random_state=42)
X_pca = pca.fit_transform(X_scaled)
print(f"\nReduced to {n_components} components, total variance explained: {cumvar[n_components-1]:.1%}")

# Show top contributing features per component (to understand what each factor represents)
print("\n--- Top features per PCA component ---")
loadings = pd.DataFrame(
    pca.components_.T,
    index=feature_names,
    columns=[f"PC{i+1}" for i in range(n_components)]
)

for i in range(min(n_components, 15)):  # show first 15 components
    col = f"PC{i+1}"
    top_pos = loadings[col].nlargest(4).index.tolist()
    top_neg = loadings[col].nsmallest(4).index.tolist()
    var_pct = pca_full.explained_variance_ratio_[i] * 100
    print(f"\n  PC{i+1} ({var_pct:.1f}% var):")
    print(f"    HIGH: " + " | ".join(f"{fid}({schema[fid]['question'][:25]})" for fid in top_pos))
    print(f"    LOW:  " + " | ".join(f"{fid}({schema[fid]['question'][:25]})" for fid in top_neg))

# ---------------------------------------------------------------------------
# 6. GMM clustering on PCA-reduced features
# ---------------------------------------------------------------------------

print(f"\n--- GMM clustering on {n_components} PCA components ---")
print(f"{'K':>4}  {'BIC':>12}  {'AIC':>12}  {'Log-Likelihood':>16}")
print("-" * 50)

results = {}
for k in K_RANGE:
    gmm = GaussianMixture(
        n_components=k,
        covariance_type="full",
        n_init=10,
        max_iter=300,
        random_state=42,
    )
    gmm.fit(X_pca)
    bic = gmm.bic(X_pca)
    aic = gmm.aic(X_pca)
    ll = gmm.score(X_pca) * len(X_pca)
    results[k] = {"model": gmm, "bic": bic, "aic": aic, "ll": ll}
    print(f"{k:>4}  {bic:>12.1f}  {aic:>12.1f}  {ll:>16.1f}")

best_k = min(results, key=lambda k: results[k]["bic"])
print(f"\nBest K by BIC: {best_k}")

# ---------------------------------------------------------------------------
# 7. Assign classes
# ---------------------------------------------------------------------------

best_model = results[best_k]["model"]
labels = best_model.predict(X_pca)
proba = best_model.predict_proba(X_pca)

proportions = pd.Series(labels).value_counts(normalize=True).sort_index()
print("\nClass proportions:")
for cls, prop in proportions.items():
    n = (labels == cls).sum()
    print(f"  Class {cls}: {prop:.1%}  (n={n})")

# ---------------------------------------------------------------------------
# 8. Per-class profiles on original features
# ---------------------------------------------------------------------------

df_result = df.copy()
df_result["class"] = labels

profiles = df_result.groupby("class")[feature_names].mean()
overall_mean = df[feature_names].mean()

# Group-level summary: mean deviation per group per class
group_ids = [schema[fid]["group_id"] for fid in feature_names]
group_map = {
    "SEQ01": "对自己的看法和评价", "SEQ02": "对自己各方面的看法",
    "SEQ03": "对健康的看法", "SEQ05": "人生目标",
    "OTQ01": "对社会和他人", "OTQ02": "对生活的看法",
    "OTQ03": "对权力的看法", "OTQ04": "和他人比较",
    "OTQ05": "性别观", "OTQ06": "婚姻观",
    "OTQ07": "生育观", "OTQ08": "对老人的看法",
    "OTQ10": "对性少数的看法", "GRQ01": "工作和集体",
    "GRQ02": "对当今社会", "GRQ07": "对中国的看法",
    "GRQ08": "国际形势", "GRQ09": "传统文化",
    "MAQ01": "财富观（一）", "MAQ02": "财富观（二）",
}

print("\n=== Class Profiles ===")
for cls in range(best_k):
    class_mean = profiles.loc[cls]
    deviation = class_mean - overall_mean

    print(f"\n--- Class {cls} (proportion: {proportions[cls]:.1%}, n={int(proportions[cls]*len(df))}) ---")

    # Group-level summary
    print("  [Group-level mean deviation from overall]")
    group_devs = {}
    for fid, gid in zip(feature_names, group_ids):
        group_devs.setdefault(gid, []).append(deviation[fid])
    group_summary = {gid: np.mean(devs) for gid, devs in group_devs.items()}
    sorted_groups = sorted(group_summary.items(), key=lambda x: abs(x[1]), reverse=True)
    for gid, dev in sorted_groups[:8]:
        direction = "+" if dev > 0 else "-"
        label = group_map.get(gid, gid)
        print(f"    [{direction}{abs(dev):.2f}] {gid} {label}")

    # Top individual features
    top_features = deviation.abs().sort_values(ascending=False).head(10).index.tolist()
    print("  [Top discriminating questions]")
    for fid in top_features:
        q = schema[fid]["question"][:45]
        ov = overall_mean[fid]
        cv = class_mean[fid]
        direction = "HIGH" if cv > ov else "LOW"
        print(f"    [{direction}] {fid}: {q}  (class={cv:.2f}, overall={ov:.2f})")

# ---------------------------------------------------------------------------
# 9. Save outputs
# ---------------------------------------------------------------------------

out_labels = pd.DataFrame({
    "respondent_id": respondent_ids,
    "class": labels,
    **{f"prob_class_{i}": proba[:, i] for i in range(best_k)}
})
out_labels.to_csv(f"{DATA_DIR}/output_labeled.csv", index=False)
print("\nSaved: data/output_labeled.csv")

profiles.to_csv(f"{DATA_DIR}/output_profiles.csv")
print("Saved: data/output_profiles.csv")

# Factor loadings
loadings.to_csv(f"{DATA_DIR}/output_pca_loadings.csv")
print("Saved: data/output_pca_loadings.csv")

# Compact cluster summary
summary = {
    "best_k": best_k,
    "n_pca_components": n_components,
    "pca_variance_explained": float(cumvar[n_components - 1]),
    "bic_scores": {k: results[k]["bic"] for k in K_RANGE},
    "proportions": {int(k): float(v) for k, v in proportions.items()},
    "profiles": {}
}

for cls in range(best_k):
    class_mean = profiles.loc[cls]
    deviation = class_mean - overall_mean
    top = deviation.abs().sort_values(ascending=False).head(20).index.tolist()

    # Group-level deviations
    group_devs = {}
    for fid, gid in zip(feature_names, group_ids):
        group_devs.setdefault(gid, []).append(deviation[fid])
    group_summary = {gid: float(np.mean(devs)) for gid, devs in group_devs.items()}

    summary["profiles"][int(cls)] = {
        "proportion": float(proportions[cls]),
        "n": int((labels == cls).sum()),
        "group_deviations": group_summary,
        "top_features": [
            {
                "field_id": fid,
                "question": schema[fid]["question"],
                "group": schema[fid]["group_id"],
                "group_label": group_map.get(schema[fid]["group_id"], ""),
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
