"""
Visualizations for K=6 cluster analysis results.
Reads data/output_cluster_profiles.json, saves images to images/.
"""

import json
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.gridspec import GridSpec
import warnings
warnings.filterwarnings("ignore")

# Chinese font support on macOS
plt.rcParams["font.family"] = ["Heiti TC", "Arial Unicode MS", "PingFang HK", "Songti SC", "Hiragino Sans GB", "sans-serif"]
plt.rcParams["axes.unicode_minus"] = False

# ---------------------------------------------------------------------------
# Load data
# ---------------------------------------------------------------------------

with open("data/output_cluster_profiles.json", encoding="utf-8") as f:
    data = json.load(f)

profiles = data["profiles"]
k_metrics = data["k_metrics"]

CLASS_LABELS = {
    0: "C0 现代进步派",
    1: "C1 乐观爱国派",
    2: "C2 传统全能派",
    3: "C3 开放理性派",
    4: "C4 沉默中间派",
    5: "C5 功利强权派",
}

COLORS = {
    0: "#5B8DB8",  # blue
    1: "#E8A838",  # amber
    2: "#C25B56",  # red
    3: "#6BAE75",  # green
    4: "#9B8DC4",  # purple
    5: "#D4795A",  # orange
}

GROUP_LABELS = {
    "SEQ01": "自我评价", "SEQ02": "自我各方面",
    "SEQ03": "健康观",
    # SEQ05 excluded: all fields are nominal (letter-keyed), not Likert, deviation = 0
    "OTQ01": "社会他人", "OTQ02": "生活看法",
    "OTQ03": "权力观",   "OTQ04": "比较心理",
    "OTQ05": "性别观",   "OTQ06": "婚姻观",
    "OTQ07": "生育观",   "OTQ08": "老人观",
    "OTQ10": "性少数观", "GRQ01": "工作集体",
    "GRQ02": "当今社会", "GRQ07": "国家认同",
    "GRQ08": "国际形势", "GRQ09": "传统文化",
    "MAQ01": "财富观一", "MAQ02": "财富观二",
}

# Ordered group list (display order) — SEQ05 excluded (no Likert fields)
GROUP_ORDER = [
    "OTQ05", "OTQ06", "OTQ07", "OTQ08", "OTQ10",
    "GRQ07", "GRQ09", "GRQ08", "GRQ01", "GRQ02",
    "MAQ01", "MAQ02", "OTQ03", "OTQ04", "OTQ01",
    "OTQ02", "SEQ01", "SEQ02", "SEQ03",
]

n_classes = len(profiles)

# ---------------------------------------------------------------------------
# 1. Proportion pie chart
# ---------------------------------------------------------------------------

props = {int(k): v["proportion"] for k, v in profiles.items()}

fig, ax = plt.subplots(figsize=(7, 7))
sizes = [props[i] for i in range(n_classes)]
labels = [f"{CLASS_LABELS[i]}\n{sizes[i]:.1%}" for i in range(n_classes)]
colors = [COLORS[i] for i in range(n_classes)]

wedges, texts = ax.pie(
    sizes, labels=None, colors=colors,
    startangle=140, wedgeprops=dict(linewidth=1.5, edgecolor="white")
)

ax.legend(
    wedges, labels,
    loc="center left", bbox_to_anchor=(1, 0.5),
    fontsize=11, frameon=False
)
ax.set_title("六类价值观人群比例分布", fontsize=15, fontweight="bold", pad=20)
plt.tight_layout()
plt.savefig("images/01_proportion_pie.png", dpi=150, bbox_inches="tight")
plt.close()
print("Saved: images/01_proportion_pie.png")

# ---------------------------------------------------------------------------
# 2. Group-level radar / heatmap (all classes × all groups)
# ---------------------------------------------------------------------------

# Build matrix: classes × groups
matrix = []
for i in range(n_classes):
    group_devs = profiles[str(i)]["group_deviations"]
    row = [group_devs.get(g, 0) for g in GROUP_ORDER]
    matrix.append(row)

matrix = np.array(matrix)
group_short = [GROUP_LABELS[g] for g in GROUP_ORDER]

fig, ax = plt.subplots(figsize=(14, 5))
vmax = np.abs(matrix).max()
im = ax.imshow(matrix, cmap="RdBu_r", vmin=-vmax, vmax=vmax, aspect="auto")

ax.set_xticks(range(len(GROUP_ORDER)))
ax.set_xticklabels(group_short, rotation=45, ha="right", fontsize=10)
ax.set_yticks(range(n_classes))
ax.set_yticklabels([CLASS_LABELS[i] for i in range(n_classes)], fontsize=11)

# Annotate cells
for i in range(n_classes):
    for j in range(len(GROUP_ORDER)):
        val = matrix[i, j]
        color = "white" if abs(val) > vmax * 0.5 else "black"
        ax.text(j, i, f"{val:+.2f}", ha="center", va="center",
                fontsize=8, color=color)

plt.colorbar(im, ax=ax, label="相对均值偏差", shrink=0.8)
ax.set_title("各类别在 20 个价值观维度上的偏差热力图", fontsize=14, fontweight="bold", pad=15)
plt.tight_layout()
plt.savefig("images/02_group_heatmap.png", dpi=150, bbox_inches="tight")
plt.close()
print("Saved: images/02_group_heatmap.png")

# ---------------------------------------------------------------------------
# 3. Per-class bar chart: top discriminating features
# ---------------------------------------------------------------------------

fig, axes = plt.subplots(2, 3, figsize=(18, 10))
axes = axes.flatten()

for cls_idx in range(n_classes):
    ax = axes[cls_idx]
    p = profiles[str(cls_idx)]
    features = p["top_features"][:12]

    labels_f = [f["question"][:18] + ("…" if len(f["question"]) > 18 else "")
                for f in features]
    deltas = [f["delta"] for f in features]
    bar_colors = [COLORS[cls_idx] if d > 0 else "#888888" for d in deltas]

    bars = ax.barh(range(len(features)), deltas, color=bar_colors, edgecolor="white", height=0.7)
    ax.set_yticks(range(len(features)))
    ax.set_yticklabels(labels_f, fontsize=9)
    ax.axvline(0, color="black", linewidth=0.8)
    ax.set_title(CLASS_LABELS[cls_idx], fontsize=12, fontweight="bold",
                 color=COLORS[cls_idx])
    ax.set_xlabel("相对均值偏差", fontsize=9)
    ax.invert_yaxis()

    # Value labels
    for bar, d in zip(bars, deltas):
        x = d + (0.02 if d >= 0 else -0.02)
        ha = "left" if d >= 0 else "right"
        ax.text(x, bar.get_y() + bar.get_height() / 2,
                f"{d:+.2f}", va="center", ha=ha, fontsize=8)

plt.suptitle("各类别最具判别力的问题（Top 12）", fontsize=15, fontweight="bold", y=1.01)
plt.tight_layout()
plt.savefig("images/03_top_features_per_class.png", dpi=150, bbox_inches="tight")
plt.close()
print("Saved: images/03_top_features_per_class.png")

# ---------------------------------------------------------------------------
# 4. K-selection metrics
# ---------------------------------------------------------------------------

ks = sorted(int(k) for k in k_metrics)
inertias = [k_metrics[str(k)]["inertia"] for k in ks]
silhouettes = [k_metrics[str(k)]["silhouette"] for k in ks]

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(11, 4))

ax1.plot(ks, inertias, "o-", color="#5B8DB8", linewidth=2, markersize=7)
ax1.axvline(6, color="#C25B56", linestyle="--", linewidth=1.5, label="选定 K=6")
ax1.set_xlabel("K（类别数）", fontsize=11)
ax1.set_ylabel("Inertia（越低越好）", fontsize=11)
ax1.set_title("Elbow 曲线", fontsize=13, fontweight="bold")
ax1.legend(fontsize=10)
ax1.set_xticks(ks)
ax1.grid(axis="y", alpha=0.3)

ax2.plot(ks, silhouettes, "o-", color="#6BAE75", linewidth=2, markersize=7)
ax2.axvline(6, color="#C25B56", linestyle="--", linewidth=1.5, label="选定 K=6")
ax2.set_xlabel("K（类别数）", fontsize=11)
ax2.set_ylabel("Silhouette Score（越高越好）", fontsize=11)
ax2.set_title("Silhouette Score", fontsize=13, fontweight="bold")
ax2.legend(fontsize=10)
ax2.set_xticks(ks)
ax2.grid(axis="y", alpha=0.3)

plt.suptitle("K 值选择依据", fontsize=14, fontweight="bold")
plt.tight_layout()
plt.savefig("images/04_k_selection.png", dpi=150, bbox_inches="tight")
plt.close()
print("Saved: images/04_k_selection.png")

# ---------------------------------------------------------------------------
# 5. Radar chart: group-level profiles per class
# ---------------------------------------------------------------------------

# Select 8 most interpretable groups for radar
RADAR_GROUPS = ["OTQ05", "OTQ06", "OTQ07", "GRQ07", "GRQ09", "MAQ01", "MAQ02", "OTQ03"]
radar_labels = [GROUP_LABELS[g] for g in RADAR_GROUPS]
N = len(RADAR_GROUPS)
angles = np.linspace(0, 2 * np.pi, N, endpoint=False).tolist()
angles += angles[:1]  # close polygon

fig, ax = plt.subplots(figsize=(8, 8), subplot_kw=dict(polar=True))

for cls_idx in range(n_classes):
    group_devs = profiles[str(cls_idx)]["group_deviations"]
    values = [group_devs.get(g, 0) for g in RADAR_GROUPS]
    values += values[:1]
    ax.plot(angles, values, "o-", linewidth=2, color=COLORS[cls_idx],
            label=CLASS_LABELS[cls_idx], markersize=5)
    ax.fill(angles, values, alpha=0.07, color=COLORS[cls_idx])

ax.set_xticks(angles[:-1])
ax.set_xticklabels(radar_labels, fontsize=11)
ax.set_yticklabels([])
ax.set_title("六类群体核心维度雷达图\n（相对全体均值偏差）",
             fontsize=13, fontweight="bold", pad=25)
ax.legend(loc="upper right", bbox_to_anchor=(1.35, 1.15), fontsize=10, frameon=False)
ax.axhline(0, color="gray", linewidth=0.5, linestyle="--")
ax.yaxis.grid(True, linestyle="--", alpha=0.4)

plt.tight_layout()
plt.savefig("images/05_radar.png", dpi=150, bbox_inches="tight")
plt.close()
print("Saved: images/05_radar.png")

print("\nAll done.")
