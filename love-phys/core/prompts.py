CONTENT_PROMPT_TEMPLATE = """你是一个专门帮助用户理解自然现象背后物理原理的物理教育助手。

## 任务要求
请为用户的物理问题提供详细的物理原理解释。

## 解释要求
- 使用清晰易懂的语言，200字以内
- 强调因果关系和物理机制
- 使用日常类比和例子

## 重要：文本格式要求
⚠️ 所有文本字段必须严格遵循以下规则：
- 解释文本中不要使用双引号（"），改用单引号（'）或其他格式
- 避免反斜杠（\）和其他特殊字符
- 强调时使用**粗体文本**而不是引号

错误示例：浮力的"大小"取决于...
正确示例：浮力的大小取决于... 或者 浮力的'大小'取决于...

用户问题：{question}

{format_instructions}"""

SVG_MODIFY_PROMPT_TEMPLATE = """你需要根据用户反馈改进现有的SVG物理图表。

## 原始信息
**物理问题**: {question}
**物理解释**: {explanation}

## 当前SVG代码
{current_svg}

## 用户反馈
{user_feedback}

## 之前的修改历史
{recent_modifications_text}

## 修改规则
1. **保持原有特性**: 如果原SVG有动画就保持动画，如果是静态就保持静态
2. **精准修改**: 只改用户提到的具体问题
3. **常见修改**:
   - 速度调整: 修改 `dur` 值 (慢=更大数值，快=更小数值)
   - 颜色调整: 修改 `fill` 和 `stroke` 属性  
   - 大小调整: 修改 `r`, `width`, `height` 等
   - 位置调整: 修改 `cx`, `cy`, `x`, `y` 等
   - 文字优化: 调整文本内容、大小、位置

## 输出要求
- 使用 <?xml version='1.0' encoding='UTF-8'?> 开头
- 使用 <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1000 600'>
- 保持 `<title>` 和 `<desc>` 标签
- 文本中不要使用双引号，统一使用单引号
- 确保物理原理正确

基于用户反馈，输出改进后的完整SVG代码。

{format_instructions}"""


SVG_PROMPT_TEMPLATE = """基于物理解释创建SVG动画图表。

## 基本要求
- 使用 <?xml version='1.0' encoding='UTF-8'?> 开头
- 使用 <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1000 600'>
- 包含 <title> 和 <desc> 标签
- 所有元素同时可见，不使用opacity隐藏

## 动画类型选择

### 1. 连续运动（波动、振动、旋转、流动）
使用简单循环动画：
```xml
<circle cx='300' cy='300' r='20' fill='#ff6b6b'>
  <animate attributeName='r' values='20;30;20' dur='3s' repeatCount='indefinite' />
</circle>
```

### 2. 多阶段过程（反应、变化、形成）
使用水平分布，同时显示所有阶段：
```xml
<!-- 阶段1：左侧 -->
<circle id='stage1' cx='200' cy='300' r='20' fill='#ff6b6b' />
<text x='200' y='250' text-anchor='middle'>阶段一</text>

<!-- 连接箭头 -->
<path d='M 250 300 L 350 300' stroke='#333' stroke-width='2' marker-end='url(#arrow)' />

<!-- 阶段2：中间 -->
<rect id='stage2' x='375' y='275' width='50' height='50' fill='#4ecdc4' />
<text x='400' y='250' text-anchor='middle'>阶段二</text>

<!-- 阶段3：右侧 -->
<ellipse id='stage3' cx='600' cy='300' rx='30' ry='20' fill='#26de81' />
<text x='600' y='250' text-anchor='middle'>阶段三</text>

<!-- 箭头定义 -->
<defs>
  <marker id='arrow' markerWidth='8' markerHeight='6' refX='7' refY='3' orient='auto'>
    <polygon points='0,0 0,6 8,3' fill='#333' />
  </marker>
</defs>
```

### 3. 对比状态（前后、冷热、大小）
使用左右对比：
```xml
<rect x='200' y='250' width='100' height='100' fill='#ff6b6b' />
<text x='250' y='200'>之前</text>

<text x='500' y='300' text-anchor='middle' font-size='24'>→</text>

<rect x='650' y='250' width='100' height='100' fill='#4ecdc4' />
<text x='700' y='200'>之后</text>
```

## 编辑器兼容规则
1. **基础形状优先**：使用 rect, circle, ellipse, line, polygon
2. **独立元素**：避免复杂的 <g> 嵌套
3. **有意义的ID**：给主要元素添加 id='particle1', id='barrier' 等
4. **统一动画时长**：所有 dur 使用相同数值（2-4秒）
5. **固定颜色**：使用十六进制 #ff6b6b, #4ecdc4, #26de81

## 输入信息
问题：{question}
解释：{explanation}

请选择合适的动画类型，创建清晰的教育性SVG动画。

{format_instructions}"""


SVG_PROMPT_TEMPLATE_STATIC = """基于物理解释创建静态SVG图表，专为可视化编辑器设计。

## 基本要求
- 使用 <?xml version='1.0' encoding='UTF-8'?> 开头
- 使用 <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1000 600'>
- 包含 <title> 和 <desc> 标签
- 纯静态元素，不使用任何动画标签
- 所有元素可编辑（位置、大小、颜色）

## 图表类型

### 1. 运动轨迹图（展示运动过程）
适用：波动、振动、抛物运动、圆周运动
```xml
<!-- 显示完整运动路径 + 关键位置的对象 -->
<path d='M 100 400 Q 300 200 500 400 Q 700 200 900 400' 
      stroke='#ddd' stroke-width='2' fill='none' stroke-dasharray='5,5' />
<text x='500' y='150' text-anchor='middle' font-size='14' fill='#666'>运动轨迹</text>

<!-- 关键位置的粒子 -->
<circle id='particle_start' cx='100' cy='400' r='12' fill='#ff6b6b' />
<text x='100' y='430' text-anchor='middle' font-size='12' fill='#333'>起点</text>

<circle id='particle_peak1' cx='300' cy='200' r='10' fill='#f39c12' />
<text x='300' y='180' text-anchor='middle' font-size='12' fill='#333'>峰值</text>

<circle id='particle_middle' cx='500' cy='400' r='12' fill='#e74c3c' />
<text x='500' y='430' text-anchor='middle' font-size='12' fill='#333'>中点</text>

<circle id='particle_peak2' cx='700' cy='200' r='10' fill='#f39c12' />
<circle id='particle_end' cx='900' cy='400' r='12' fill='#27ae60' />
<text x='900' y='430' text-anchor='middle' font-size='12' fill='#333'>终点</text>
```

### 2. 流程步骤图（展示多阶段过程）
适用：化学反应、相变、物理过程
```xml
<!-- 步骤1 -->
<g id='step1' transform='translate(150, 300)'>
  <rect x='-40' y='-30' width='80' height='60' fill='#3498db' rx='5' />
  <text x='0' y='5' text-anchor='middle' font-size='14' fill='white'>初始状态</text>
  <text x='0' y='-60' text-anchor='middle' font-size='16' fill='#333'>步骤 1</text>
</g>

<!-- 箭头 -->
<path d='M 230 300 L 320 300' stroke='#2c3e50' stroke-width='3' marker-end='url(#arrow)' />
<text x='275' y='290' text-anchor='middle' font-size='12' fill='#666'>转换</text>

<!-- 步骤2 -->
<g id='step2' transform='translate(400, 300)'>
  <circle cx='0' cy='0' r='35' fill='#e74c3c' />
  <text x='0' y='5' text-anchor='middle' font-size='14' fill='white'>过程中</text>
  <text x='0' y='-60' text-anchor='middle' font-size='16' fill='#333'>步骤 2</text>
</g>

<!-- 箭头 -->
<path d='M 480 300 L 570 300' stroke='#2c3e50' stroke-width='3' marker-end='url(#arrow)' />

<!-- 步骤3 -->
<g id='step3' transform='translate(650, 300)'>
  <polygon points='0,-30 35,20 -35,20' fill='#27ae60' />
  <text x='0' y='5' text-anchor='middle' font-size='14' fill='white'>最终状态</text>
  <text x='0' y='-60' text-anchor='middle' font-size='16' fill='#333'>步骤 3</text>
</g>

<!-- 箭头标记 -->
<defs>
  <marker id='arrow' markerWidth='10' markerHeight='8' refX='9' refY='4' orient='auto'>
    <polygon points='0,0 0,8 10,4' fill='#2c3e50' />
  </marker>
</defs>
```

### 3. 对比示意图（展示不同状态）
适用：温度对比、电荷状态、材料性质
```xml
<!-- 左侧状态 -->
<g id='state_before' transform='translate(250, 300)'>
  <rect x='-60' y='-40' width='120' height='80' fill='#3498db' rx='8' />
  <text x='0' y='-10' text-anchor='middle' font-size='16' fill='white'>冷态</text>
  <text x='0' y='10' text-anchor='middle' font-size='12' fill='#ecf0f1'>分子运动慢</text>
  <text x='0' y='-80' text-anchor='middle' font-size='18' fill='#2c3e50'>之前</text>
  
  <!-- 分子示意 -->
  <circle cx='-20' cy='-15' r='4' fill='#ecf0f1' />
  <circle cx='0' cy='-20' r='4' fill='#ecf0f1' />
  <circle cx='20' cy='-10' r='4' fill='#ecf0f1' />
</g>

<!-- 中间箭头 -->
<path d='M 370 300 L 430 300' stroke='#e74c3c' stroke-width='4' marker-end='url(#arrow)' />
<text x='400' y='290' text-anchor='middle' font-size='14' fill='#e74c3c'>加热</text>

<!-- 右侧状态 -->
<g id='state_after' transform='translate(550, 300)'>
  <rect x='-60' y='-40' width='120' height='80' fill='#e74c3c' rx='8' />
  <text x='0' y='-10' text-anchor='middle' font-size='16' fill='white'>热态</text>
  <text x='0' y='10' text-anchor='middle' font-size='12' fill='#ecf0f1'>分子运动快</text>
  <text x='0' y='-80' text-anchor='middle' font-size='18' fill='#2c3e50'>之后</text>
  
  <!-- 分子示意（分散） -->
  <circle cx='-30' cy='-25' r='4' fill='#ecf0f1' />
  <circle cx='10' cy='-30' r='4' fill='#ecf0f1' />
  <circle cx='25' cy='-5' r='4' fill='#ecf0f1' />
  <circle cx='-15' cy='15' r='4' fill='#ecf0f1' />
</g>
```

### 4. 力场示意图（展示场效应）
适用：电场、磁场、重力场、压力
```xml
<!-- 场源 -->
<circle id='field_source' cx='500' cy='300' r='25' fill='#e74c3c' />
<text x='500' y='306' text-anchor='middle' font-size='14' fill='white'>+</text>
<text x='500' y='260' text-anchor='middle' font-size='16' fill='#2c3e50'>电荷源</text>

<!-- 场线（静态表示） -->
<g id='field_lines' stroke='#3498db' stroke-width='2' fill='none'>
  <path d='M 500 275 Q 400 200 350 150' marker-end='url(#field_arrow)' />
  <path d='M 500 325 Q 400 400 350 450' marker-end='url(#field_arrow)' />
  <path d='M 525 300 Q 600 250 650 200' marker-end='url(#field_arrow)' />
  <path d='M 525 300 Q 600 350 650 400' marker-end='url(#field_arrow)' />
  <path d='M 500 275 Q 500 200 500 150' marker-end='url(#field_arrow)' />
  <path d='M 500 325 Q 500 400 500 450' marker-end='url(#field_arrow)' />
</g>

<!-- 测试电荷 -->
<circle id='test_charge1' cx='350' cy='200' r='8' fill='#27ae60' />
<text x='350' y='185' text-anchor='middle' font-size='12' fill='#2c3e50'>-</text>

<circle id='test_charge2' cx='650' cy='350' r='8' fill='#27ae60' />
<text x='650' y='335' text-anchor='middle' font-size='12' fill='#2c3e50'>-</text>

<defs>
  <marker id='field_arrow' markerWidth='8' markerHeight='6' refX='7' refY='3' orient='auto'>
    <polygon points='0,0 0,6 8,3' fill='#3498db' />
  </marker>
</defs>
```

## 设计原则

### 颜色方案
- **主要对象**: #e74c3c (红), #3498db (蓝), #27ae60 (绿), #f39c12 (橙)
- **背景/辅助**: #ecf0f1 (浅灰), #95a5a6 (中灰), #2c3e50 (深灰)
- **强调色**: #9b59b6 (紫), #1abc9c (青绿)

### 布局规则
- **水平分布**: 左中右 (200px, 500px, 800px)
- **垂直居中**: 主要内容在 y=300 附近
- **标题区域**: y=100-150
- **说明文字**: 元素上方或下方 30-50px

### 编辑器优化
1. **独立元素**: 每个主要对象都是独立的基础形状
2. **有意义ID**: 使用 `particle_1`, `step_2`, `field_source` 等
3. **合理间距**: 元素间至少 50px 间距
4. **清晰层次**: 背景 → 连接线 → 主要对象 → 文字标签

## 选择指南
- **有明确运动轨迹** → 使用运动轨迹图
- **有时间顺序的过程** → 使用流程步骤图  
- **需要对比两种状态** → 使用对比示意图
- **涉及场的概念** → 使用力场示意图

## 输入信息
问题：{question}
解释：{explanation}

请选择最适合的图表类型，创建信息丰富的静态SVG图表。重点突出物理概念的关键要素和相互关系。

{format_instructions}"""
