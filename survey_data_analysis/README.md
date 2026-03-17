# 中国人价值观聚类分析

基于中国人价值观调研数据（5850人，166个Likert字段），通过 K-means 聚类提炼六类典型价值观人群，为后续构建虚拟人提供基础。

## 文件说明

### 脚本

| 文件 | 说明 |
|---|---|
| `kmeans_analysis.py` | 主分析脚本。Group-level 归一化 + K-means，测试 K=3~10，输出各 K 的完整画像及最终聚类结果 |
| `visualize.py` | 可视化脚本。读取聚类结果生成五张图表，保存到 `images/` |
| `lca_analysis.py` | 早期探索脚本（GMM / PCA 方案），已废弃，仅供参考 |

### 文档

| 文件 | 说明 |
|---|---|
| `cluster_analysis_report.md` | 最终分析报告。包含六类人群的详细画像、K 值选择讨论及可视化图表 |
| `analysis_process.md` | 分析过程记录。记录了从 GMM → PCA+GMM → K-means 的方法演进和每步的关键观察 |
| `data_insights.md` | 数据概览。字段筛选标准、各 group 的适用性评估 |

### 数据（不入 git）

> `data/` 目录已加入 `.gitignore`，需自行准备原始数据后复现。

| 文件 | 说明 |
|---|---|
| `data/schema.jsonl` | 字段定义。每行一个字段，含 `field_id`、`group_id`、`question`、`options` |
| `data/responses.jsonl` | 受访者回答。每行一人，含 `respondent_id` 和 `answers` 字典 |
| `data/output_cluster_profiles.json` | 聚类结果（K=6）。含各类比例、group 偏差、top 判别特征，供下游使用 |
| `data/output_labeled.csv` | 每个受访者的类别标签 |
| `data/output_profiles.csv` | 各类别在 166 个字段上的均值 |
| `data/output_profiles_all_k.txt` | K=3~10 各 K 值的完整 group-level 画像文本 |
| `data/output_kmeans_metrics.csv` | 各 K 的 Inertia 和 Silhouette Score |

### 图表

| 文件 | 说明 |
|---|---|
| `images/01_proportion_pie.png` | 六类人群比例饼图 |
| `images/02_group_heatmap.png` | 各类别 × 20 维度偏差热力图 |
| `images/03_top_features_per_class.png` | 各类别 Top 12 判别问题条形图 |
| `images/04_k_selection.png` | K 值选择依据（Elbow + Silhouette） |
| `images/05_radar.png` | 六类群体核心维度雷达图 |

## 复现步骤

### 环境依赖

```bash
conda activate agent
# 依赖：numpy, pandas, scikit-learn, matplotlib
```

### 1. 准备数据

将 `schema.jsonl` 和 `responses.jsonl` 放入 `data/` 目录。

### 2. 运行聚类分析

```bash
cd survey_data_analysis
python kmeans_analysis.py
```

输出 `data/output_cluster_profiles.json` 等结果文件。默认保存 K=6 的结果，如需调整在脚本顶部修改：

```python
SAVE_K = 6  # 改为其他数字可保存对应 K 的结果
```

### 3. 生成可视化

```bash
python visualize.py
```

输出五张图到 `images/`。

## 聚类结果概览

| 类别 | 标签 | 比例 |
|---|---|---|
| C0 | 现代进步派 | 14.8% |
| C1 | 乐观爱国派 | 19.2% |
| C2 | 传统全能派 | 13.9% |
| C3 | 开放理性派 | 12.3% |
| C4 | 沉默中间派 | 28.0% |
| C5 | 功利强权派 | 11.8% |

详细画像见 [`cluster_analysis_report.md`](cluster_analysis_report.md)。
