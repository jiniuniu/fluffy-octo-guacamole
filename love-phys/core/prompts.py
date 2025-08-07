CONTENT_PROMPT_TEMPLATE = """你是一个专门帮助用户理解自然现象背后物理原理的物理教育助手。

## 任务要求
请为用户的物理问题提供详细的物理原理解释，以及相关现象和后续问题。

## 解释要求
- 使用清晰易懂的语言，200字以内
- 强调因果关系和物理机制
- 使用日常类比和例子

## 重要：文本格式要求
⚠️ 所有文本字段必须严格遵循以下规则：
- 解释文本中不要使用双引号（"），改用单引号（'）或其他格式
- 避免反斜杠（\）和其他特殊字符
- 相关现象和后续问题使用简洁表达，避免引号
- 强调时使用**粗体文本**而不是引号

错误示例：浮力的"大小"取决于...
正确示例：浮力的大小取决于... 或者 浮力的'大小'取决于...

用户问题：{question}

{format_instructions}"""

SVG_PROMPT_TEMPLATE = """基于提供的解释创建教育性的SVG物理图表。

## 技术设置
- 使用 viewBox='0 0 1000 600' 并且全部使用单引号
- 包含 <title> 和 <desc> 标签以提高可访问性

## 动画场景选择

### 场景1：简单运动 - 连续/重复现象
**物理例子**：
- **波动**：声波、光波、水波、电磁波、驻波
- **振动**：钟摆摆动、弹簧振荡、分子振动、简谐运动
- **旋转**：行星轨道、电子轨道、陀螺运动、涡轮旋转
- **流动**：电流、热传导、流体流动、磁场线
- **周期性**：交流电压周期、呼吸运动、心跳、潮汐运动

**适用情况**：现象无间断连续重复，没有明显阶段
**代码模式**：
```xml
<animateTransform attributeName='transform' type='rotate' 
  values='0 cx cy; 360 cx cy' dur='3s' repeatCount='indefinite' />
```

### 场景2：多阶段过程 - 序列变化
**物理例子**：
- **状态变化**：冰→水→蒸汽，固体→液体→气体转换
- **化学反应**：反应物→活化→中间体→产物
- **形成过程**：恒星诞生（星云→原恒星→主序星）、晶体生长、龙卷风形成
- **核过程**：放射性衰变链、核裂变（中子→撞击→分裂→能量）
- **生物过程**：光合作用步骤、细胞分裂阶段、酶催化
- **工程过程**：发动机循环（进气→压缩→燃烧→排气）
- **地质过程**：地震（应力→破裂→波动→余震）

**适用情况**：过程有明显的开始→中间→结束阶段，具有不同机制
**代码模式**：
```xml
<!-- 关键：使用animate控制透明度，不是animateTransform -->
<g id='phase1'>
  <animate attributeName='opacity' values='1;1;0;0;0;0' dur='18s' repeatCount='indefinite' />
</g>
<g id='phase2'>  
  <animate attributeName='opacity' values='0;0;1;1;0;0' dur='18s' repeatCount='indefinite' />
</g>
<g id='phase3'>
  <animate attributeName='opacity' values='0;0;0;0;1;1' dur='18s' repeatCount='indefinite' />
</g>
```

### 场景3：前后对比 - 状态对比
**物理例子**：
- **温度效应**：热与冷的材料性质，热膨胀
- **化学状态**：反应前后对比，催化剂效应
- **电学**：带电与中性物体，导体与绝缘体
- **力学**：碰撞前后，弹性与非弹性形变
- **光学**：偏振与非偏振光，反射与折射

**适用情况**：展示两种对比状态或条件
**代码模式**：
```xml
<g id='before'>
  <animate attributeName='opacity' values='1;1;0;0' dur='8s' repeatCount='indefinite' />
</g>
<g id='after'>
  <animate attributeName='opacity' values='0;0;1;1' dur='8s' repeatCount='indefinite' />
</g>
```

## 快速选择指南
**问问自己：**
1. **永远重复？** → 简单运动（波动、轨道、振荡）
2. **有明确阶段？** → 多阶段（形成、反应、变化）  
3. **对比状态？** → 前后对比（热与冷、反应前后）

## 动画规则
1. **透明度**：始终使用 `<animate attributeName='opacity'>` 控制阶段可见性
2. **时间**：所有相关阶段必须有相同的 `dur` 值  
3. **数值**：对于N个阶段，将时间线平均分配，每个阶段一对数值
4. **运动**：使用 `animateTransform` 做移动，`animate` 做属性变化

## 常用动画模式
```xml
<!-- 围绕中心旋转 -->
<animateTransform attributeName='transform' type='rotate' 
  values='0 500 300; 360 500 300' dur='4s' repeatCount='indefinite' />

<!-- 流动/电流可视化 -->
<animate attributeName='stroke-dasharray' values='0,100; 100,0' dur='2s' repeatCount='indefinite' />

<!-- 脉冲/呼吸效果 -->
<animate attributeName='r' values='5; 15; 5' dur='3s' repeatCount='indefinite' />

<!-- 波动运动 -->
<animateTransform attributeName='transform' type='translate' 
  values='0,0; 0,-20; 0,0' dur='2s' repeatCount='indefinite' />
```

## 布局与设计
- **阶段文本区域**：阶段1 (x=50-300)，阶段2 (x=350-650)，阶段3 (x=700-950)
- **颜色**：红色=热/正电/能量，蓝色=冷/负电，绿色=速度/运动，黄色=能量/注意
- **文字**：16px标题，12px描述，10px标签

## 物理准确性
- 根据物理场景将物体放在现实位置开始
- 在整个动画中遵循守恒定律（能量、动量、电荷）
- 使用准确的比例和力、运动方向
- 重力效应向下动画（Y值增加）

## 验证清单
- [ ] 动画场景与物理现象类型匹配
- [ ] 所有阶段在动画中按正确顺序出现
- [ ] 阶段间文字无重叠  
- [ ] 相关动画的所有 `dur` 值匹配
- [ ] 物理原理正确表示

## 输入信息
**问题**：{question}
**解释**：{explanation}

首先识别哪种场景最适合这个现象，然后使用相应的代码模式实现。

{format_instructions}"""
