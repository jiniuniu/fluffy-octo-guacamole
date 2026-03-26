"""
Demographics sampling module.

职业作为中间锚点，驱动学历和城市层级的联动采样。
聚类偏向通过调整职业组权重来体现。
"""

import random

# ---------------------------------------------------------------------------
# 城市分层
# ---------------------------------------------------------------------------

CITIES: dict[str, list[str]] = {
    "tier1": ["北京", "上海", "广州", "深圳"],
    "new_tier1": [
        "杭州", "成都", "武汉", "南京", "重庆", "西安", "苏州", "长沙",
        "天津", "郑州", "青岛", "宁波", "东莞", "佛山", "合肥",
    ],
    "tier2": [
        "昆明", "贵阳", "南昌", "太原", "石家庄", "福州", "厦门",
        "温州", "无锡", "大连", "沈阳", "长春", "哈尔滨", "南宁",
        "兰州", "乌鲁木齐", "银川", "西宁", "济南", "烟台", "威海",
        "绵阳", "宜宾", "遵义", "大理", "丽江", "鞍山", "吉林",
        "洛阳", "襄阳", "岳阳", "衡阳", "赣州", "台州", "潍坊",
    ],
    "tier3": [
        "河南某县城", "湖南某县城", "四川某县城", "山东某县城",
        "安徽某县城", "广西某县城", "江西某小镇", "贵州某小镇",
        "湖北某乡镇", "东北某小城", "内蒙古某县城", "甘肃某县城",
    ],
    "rural": [
        "河北农村", "河南农村", "湖南农村", "四川农村", "广东农村",
        "山东农村", "安徽农村", "湖北农村", "江西农村", "广西农村",
    ],
}

# ---------------------------------------------------------------------------
# 职业组定义
# 每组包含：职业列表、对应学历池、对应城市层级权重
# ---------------------------------------------------------------------------

OCC_GROUPS: dict[str, dict] = {
    "高知专业": {
        "occupations": [
            "医生", "律师", "大学教授", "大学讲师", "科研人员",
            "金融分析师", "投资经理", "基金经理", "建筑师",
            "心理咨询师", "咨询顾问", "记者", "编辑",
        ],
        "educations": ["本科", "本科", "研究生", "研究生"],
        "city_weights": {"tier1": 5, "new_tier1": 4, "tier2": 1, "tier3": 0, "rural": 0},
    },
    "技术白领": {
        "occupations": [
            "程序员", "产品经理", "工程师", "设计师",
            "市场运营", "新媒体运营", "数据分析师", "项目经理",
            "高管", "部门总监",
        ],
        "educations": ["大专", "本科", "本科", "本科", "研究生"],
        "city_weights": {"tier1": 4, "new_tier1": 5, "tier2": 2, "tier3": 0, "rural": 0},
    },
    "普通白领": {
        "occupations": [
            "银行柜员", "行政文员", "会计", "出纳", "人事专员",
            "客服", "教师", "培训机构老师", "护士", "药剂师",
            "国企职员", "公务员", "事业单位职员",
        ],
        "educations": ["大专", "大专", "本科", "本科"],
        "city_weights": {"tier1": 2, "new_tier1": 4, "tier2": 4, "tier3": 2, "rural": 0},
    },
    "服务技能": {
        "occupations": [
            "销售", "房产中介", "保险销售", "理发师", "美甲师",
            "厨师", "餐厅服务员", "超市收银员", "超市理货员",
            "保安", "保洁员", "家政工", "月嫂", "育儿嫂",
            "摄影师",
        ],
        "educations": ["初中", "高中", "高中", "中专", "大专"],
        "city_weights": {"tier1": 3, "new_tier1": 4, "tier2": 3, "tier3": 2, "rural": 0},
    },
    "体力蓝领": {
        "occupations": [
            "工厂工人", "流水线工人", "建筑工人", "装修工人",
            "外卖骑手", "快递员", "司机", "网约车司机", "货车司机",
        ],
        "educations": ["小学", "初中", "初中", "高中", "中专"],
        "city_weights": {"tier1": 3, "new_tier1": 3, "tier2": 3, "tier3": 2, "rural": 1},
    },
    "自营个体": {
        "occupations": [
            "个体户", "小企业主", "电商卖家",
            "直播带货主播", "短视频博主", "自由职业者",
            "农村个体经营",
        ],
        "educations": ["初中", "高中", "中专", "大专", "本科"],
        "city_weights": {"tier1": 1, "new_tier1": 3, "tier2": 3, "tier3": 3, "rural": 2},
    },
    "农业": {
        "occupations": ["农民"],
        "educations": ["小学", "初中", "初中", "高中"],
        "city_weights": {"tier1": 0, "new_tier1": 0, "tier2": 0, "tier3": 3, "rural": 7},
    },
    "学生": {
        "occupations": ["大学生", "职校学生"],
        "educations": ["高中", "中专", "大专", "本科"],  # 在读，标注最高已完成学历
        "city_weights": {"tier1": 3, "new_tier1": 4, "tier2": 3, "tier3": 1, "rural": 0},
    },
    "无业退休": {
        "occupations": ["待业", "退休人员"],
        "educations": ["小学", "初中", "高中", "中专", "大专", "本科"],
        "city_weights": {"tier1": 1, "new_tier1": 2, "tier2": 3, "tier3": 3, "rural": 2},
    },
}

# ---------------------------------------------------------------------------
# 聚类对职业组的偏向权重
# 不填的默认为 1
# ---------------------------------------------------------------------------

CLUSTER_OCC_WEIGHTS: dict[int, dict[str, float]] = {
    0: {  # 现代进步派：高知+技术，大城市，网民中的进步青年
        "高知专业": 4, "技术白领": 4, "普通白领": 2,
        "服务技能": 0.5, "体力蓝领": 0.3, "自营个体": 1,
        "农业": 0.05, "学生": 2, "无业退休": 0.5,
    },
    1: {  # 乐观爱国派：分布较广，偏国企/公务员/普通白领，也有蓝领
        "高知专业": 2, "技术白领": 2, "普通白领": 4,
        "服务技能": 2.5, "体力蓝领": 3, "自营个体": 2,
        "农业": 2, "学生": 1, "无业退休": 1.5,
    },
    2: {  # 传统全能派：大量农业/体力/服务，三线县城农村为主
        "高知专业": 0.2, "技术白领": 0.4, "普通白领": 1.5,
        "服务技能": 3, "体力蓝领": 4, "自营个体": 2,
        "农业": 8, "学生": 0.3, "无业退休": 3,
    },
    3: {  # 开放理性派：高知+技术，一线城市，受教育程度最高
        "高知专业": 5, "技术白领": 4, "普通白领": 2,
        "服务技能": 0.5, "体力蓝领": 0.2, "自营个体": 1,
        "农业": 0.05, "学生": 3, "无业退休": 0.3,
    },
    4: {  # 沉默中间派：最接近全体人口分布，农业/体力比例显著
        "高知专业": 1, "技术白领": 1.5, "普通白领": 2,
        "服务技能": 3, "体力蓝领": 3.5, "自营个体": 2.5,
        "农业": 3, "学生": 1, "无业退休": 2,
    },
    5: {  # 功利强权派：自营/销售/体力为主，城市流动人口多
        "高知专业": 0.5, "技术白领": 1, "普通白领": 1,
        "服务技能": 3.5, "体力蓝领": 3.5, "自营个体": 5,
        "农业": 1.5, "学生": 0.5, "无业退休": 1,
    },
}

# 聚类对城市层级的额外偏向（乘在职业组城市权重上）
CLUSTER_CITY_MULTIPLIERS: dict[int, dict[str, float]] = {
    0: {"tier1": 2.0, "new_tier1": 1.5, "tier2": 0.6, "tier3": 0.2, "rural": 0.05},
    1: {"tier1": 0.8, "new_tier1": 1.2, "tier2": 1.3, "tier3": 1.2, "rural": 1.0},
    2: {"tier1": 0.2, "new_tier1": 0.5, "tier2": 1.0, "tier3": 2.0, "rural": 3.5},
    3: {"tier1": 2.5, "new_tier1": 1.5, "tier2": 0.6, "tier3": 0.15, "rural": 0.05},
    4: {"tier1": 0.8, "new_tier1": 1.0, "tier2": 1.2, "tier3": 1.3, "rural": 1.5},
    5: {"tier1": 0.8, "new_tier1": 1.2, "tier2": 1.3, "tier3": 1.2, "rural": 1.0},
}

# 聚类对年龄的偏向
CLUSTER_AGE_RANGE: dict[int, tuple[int, int]] = {
    0: (22, 42),
    1: (25, 55),
    2: (35, 62),
    3: (22, 45),
    4: (20, 58),
    5: (28, 55),
}

# 职业最低年龄约束（现实中需要一定资历才能从事）
OCC_MIN_AGE: dict[str, int] = {
    "大学教授":    40,
    "大学讲师":    28,
    "医生":        28,
    "律师":        26,
    "心理咨询师":  26,
    "金融分析师":  25,
    "投资经理":    28,
    "基金经理":    30,
    "建筑师":      28,
    "咨询顾问":    26,
    "高管":        35,
    "部门总监":    32,
    "小企业主":    25,
    "退休人员":    55,
    "月嫂":        25,
    "货车司机":    22,
}

# ---------------------------------------------------------------------------
# 主采样函数
# ---------------------------------------------------------------------------


def pick_demo(cluster: int, used_combos: set) -> dict:
    occ_weights = CLUSTER_OCC_WEIGHTS[cluster]
    groups = list(OCC_GROUPS.keys())
    weights = [occ_weights.get(g, 1.0) for g in groups]

    city_multipliers = CLUSTER_CITY_MULTIPLIERS[cluster]
    age_min, age_max = CLUSTER_AGE_RANGE[cluster]

    for _ in range(100):
        # 1. 采样职业组
        group_name = random.choices(groups, weights=weights)[0]
        group = OCC_GROUPS[group_name]

        # 2. 从职业组采样具体职业
        occupation = random.choice(group["occupations"])

        # 3. 从职业组采样学历
        education = random.choice(group["educations"])

        # 4. 从职业组城市权重 × 聚类城市乘数，采样城市层级
        raw_city_w = group["city_weights"]
        adjusted = {
            tier: raw_city_w[tier] * city_multipliers.get(tier, 1.0)
            for tier in raw_city_w
            if raw_city_w[tier] > 0
        }
        if not adjusted:
            continue
        tier = random.choices(list(adjusted.keys()), weights=list(adjusted.values()))[0]
        city = random.choice(CITIES[tier])

        # 5. 采样年龄（学生/退休/特定职业限制年龄）
        if occupation in ("大学生", "职校学生"):
            age = random.randint(18, 24)
        elif occupation == "退休人员":
            age = random.randint(55, 70)
        else:
            occ_min = OCC_MIN_AGE.get(occupation, age_min)
            effective_min = max(age_min, occ_min)
            age = random.randint(effective_min, age_max)

        # 6. 采样性别
        gender = random.choice(["male", "female"])

        combo = (cluster, gender, city, occupation)
        if combo not in used_combos:
            used_combos.add(combo)
            return {
                "age": age,
                "gender": gender,
                "city": city,
                "education": education,
                "occupation": occupation,
            }

    # 100次碰撞后放弃去重，直接返回
    return {
        "age": age,
        "gender": gender,
        "city": city,
        "education": education,
        "occupation": occupation,
    }
