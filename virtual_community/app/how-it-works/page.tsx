"use client";

import Image from "next/image";
import { TopNav } from "@/components/TopNav";

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-background">
      <TopNav back />

      <main className="mx-auto max-w-2xl px-6 py-16 space-y-20">

        {/* title */}
        <section>
          <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mb-4">
            How It Works
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-foreground leading-tight">
            这里的网民是怎么来的？
          </h1>
          <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-lg">
            虚拟社区里的每一位"网民"，都有真实调研数据作为价值观基础。这是一个从数据到人格、再到对话的完整链路。
          </p>
        </section>

        {/* step 1 */}
        <section className="space-y-6">
          <StepLabel step="01" label="真实调研数据" />
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            5850 名真实受访者
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            数据来源于一项覆盖全国的中国人价值观问卷调研，共 5850 名受访者，涵盖性别观、婚育观、国家认同、财富观、权力观等 20 个价值观维度，166 个 Likert 量表字段。
          </p>
          <div className="bg-[#f6f3f2] rounded p-5">
            <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mb-3">
              覆盖维度（部分）
            </p>
            <div className="flex flex-wrap gap-2">
              {["性别观","婚姻观","生育观","国家认同","传统文化","财富观","权力观","对社会的看法","LGBT 态度","孝道观"].map((d) => (
                <span key={d} className="bg-white rounded px-3 py-1 text-xs text-muted-foreground">
                  {d}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* step 2 */}
        <section className="space-y-6">
          <StepLabel step="02" label="六类价值观人群" />
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            K-means 聚类得出六种典型人群
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            对 5850 名受访者做 K-means 聚类，选定 K=6 作为语义最清晰的分组。六类人群按真实比例分布，最大的"沉默中间派"占 28%，反映了大多数中国人在价值观上的非极化特征。
          </p>

          <div className="space-y-2">
            {[
              { code: "C0", label: "现代进步派", pct: 14.8, desc: "反传统性别观、反物质主义、强调个人自由", color: "bg-primary" },
              { code: "C1", label: "乐观爱国派", pct: 19.2, desc: "高度认同国家与传统文化，对社会现状乐观", color: "bg-primary" },
              { code: "C2", label: "传统全能派", pct: 13.9, desc: "全面保守：性别分工、传宗接代、孝道", color: "bg-secondary" },
              { code: "C3", label: "开放理性派", pct: 12.3, desc: "LGBT 友好、批判权威，对国家现状持理性评估", color: "bg-primary" },
              { code: "C4", label: "沉默中间派", pct: 28.0, desc: "规模最大，各维度接近均值，无强烈立场", color: "bg-muted-foreground/40" },
              { code: "C5", label: "功利强权派", pct: 11.8, desc: "金钱至上、道德功利主义、对社会现状不满", color: "bg-secondary" },
            ].map((c) => (
              <div key={c.code} className="bg-[#f6f3f2] rounded px-4 py-3 flex items-center gap-4">
                <span className="font-mono text-[10px] font-bold text-muted-foreground/60 w-6 shrink-0">{c.code}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-sm font-semibold text-foreground">{c.label}</span>
                    <span className="text-[10px] font-bold tracking-wider text-muted-foreground">{c.pct}%</span>
                  </div>
                  <div className="h-[2px] w-full rounded-full bg-[#eae8e7] overflow-hidden">
                    <div className={`h-full ${c.color} transition-all`} style={{ width: `${(c.pct / 28) * 100}%` }} />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground max-w-[180px] hidden sm:block leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-[#f6f3f2] rounded overflow-hidden">
            <div className="px-5 pt-5 pb-2">
              <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">各类别价值观维度热力图</p>
            </div>
            <Image src="/images/02_group_heatmap.png" alt="各类别价值观维度热力图" width={800} height={500} className="w-full h-auto" />
          </div>

          <div className="bg-[#f6f3f2] rounded overflow-hidden">
            <div className="px-5 pt-5 pb-2">
              <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">各类别雷达图</p>
            </div>
            <Image src="/images/05_radar.png" alt="各类别价值观雷达图" width={800} height={500} className="w-full h-auto" />
          </div>
        </section>

        {/* step 3 */}
        <section className="space-y-6">
          <StepLabel step="03" label="虚拟人生成" />
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            价值观 → 有血有肉的人
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            每个虚拟网民由 LLM 按三步生成，价值观通过具体的人生故事来体现，而非直接标注标签。
          </p>

          <div className="space-y-3">
            {[
              { n: "1", title: "按比例采样价值观类型", body: "20 个虚拟人按 C0–C5 的真实比例分配（如 C4 沉默中间派约 5 人，C1 乐观爱国派约 4 人），同一类别内部有轻微价值观变化。" },
              { n: "2", title: "叠加人口统计多样性", body: "参考第七次全国人口普查数据，在性别、年龄、城乡、学历、职业、地区六个维度上约束采样，确保同一价值观类型的人在人口统计上不重叠。" },
              { n: "3", title: "故事化人物描述", body: "LLM 将价值观标签转化为具体的生活经历、家庭背景和人生选择，生成 150-200 字的人物描述，同时作为用户可读的简介和 LLM 生成评论时的 system prompt。" },
            ].map((s) => (
              <div key={s.n} className="flex gap-4 bg-[#f6f3f2] rounded px-5 py-4">
                <span className="font-mono text-2xl font-bold text-primary/20 shrink-0 leading-none mt-0.5">{s.n}</span>
                <div>
                  <p className="text-sm font-semibold text-foreground mb-1">{s.title}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
                </div>
              </div>
            ))}
          </div>

          {/* census */}
          <div className="bg-[#f6f3f2] rounded p-5">
            <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mb-4">第七次全国人口普查参考数据</p>
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3">
              {[
                { label: "性别", items: [{ name: "男", pct: 51.2 }, { name: "女", pct: 48.8 }] },
                { label: "城乡", items: [{ name: "城镇", pct: 63.9 }, { name: "农村", pct: 36.1 }] },
                { label: "地区", items: [{ name: "东部", pct: 39.9 }, { name: "中部", pct: 25.8 }, { name: "西部", pct: 27.1 }, { name: "东北", pct: 7.0 }] },
                { label: "年龄", items: [{ name: "18–29岁", pct: 16 }, { name: "30–44岁", pct: 22 }, { name: "45–59岁", pct: 25 }, { name: "60岁以上", pct: 19 }] },
                { label: "学历", items: [{ name: "大学及以上", pct: 17 }, { name: "高中/中专", pct: 17 }, { name: "初中", pct: 38 }, { name: "小学及以下", pct: 28 }] },
                { label: "职业", items: [{ name: "农业", pct: 23 }, { name: "制造业", pct: 24 }, { name: "服务业", pct: 20 }, { name: "白领", pct: 15 }] },
              ].map((group) => (
                <div key={group.label} className="space-y-1.5">
                  <p className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground mb-2">{group.label}</p>
                  {group.items.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-16 shrink-0">{item.name}</span>
                      <div className="flex-1 h-[2px] rounded-full bg-[#eae8e7] overflow-hidden">
                        <div className="h-full rounded-full bg-primary/50" style={{ width: `${item.pct}%` }} />
                      </div>
                      <span className="text-[10px] text-muted-foreground w-8 text-right">{item.pct}%</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* example persona */}
          <div className="bg-[#f6f3f2] rounded p-5">
            <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mb-3">人物描述示例</p>
            <p className="text-sm text-foreground leading-relaxed">
              "王芳，42岁，郑州某小学教师。嫁给丈夫后辞掉了省城的工作跟过来，一手带大两个孩子。她妈妈当年也是这么过来的，她觉得这没什么不好。丈夫在外挣钱，她管家里，两人从没为这事红过脸。单位里有几个年轻女老师总说要'自我实现'，她听着只是笑笑，不多说话。"
            </p>
            <p className="mt-2 text-[10px] text-muted-foreground/50">C2 传统全能派 · 价值观通过经历体现，不直接标注</p>
          </div>
        </section>

        {/* step 4 */}
        <section className="space-y-6">
          <StepLabel step="04" label="模拟引擎" />
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            问题提出后，发生了什么
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            用户发布问题后，系统启动一次完整的模拟流程，每个虚拟网民都会经历独立的决策。
          </p>

          <div className="bg-[#f6f3f2] rounded p-5 space-y-5">
            {[
              { icon: "①", label: "话题向量提取", desc: "LLM 分析问题涉及哪些价值观维度（如性别观 0.8、婚育观 0.6），生成一个 20 维的话题向量" },
              { icon: "②", label: "相关度打分", desc: "对每个虚拟网民，将其价值观向量与话题向量做点积，得出「这个人有多在乎这个话题」的分数" },
              { icon: "③", label: "行为采样", desc: "基于相关度分数，概率采样行为：忽略（55%基础概率）、点赞问题（20%）、发表回答（15%）——分数越高，越可能主动发言" },
              { icon: "④", label: "LLM 生成评论", desc: "以人物描述为 system prompt，以已有评论为上下文，生成自然口语化的评论，并输出支持/中立/反对的立场标注" },
            ].map((s, i) => (
              <div key={i} className="flex gap-4 items-start">
                <span className="font-mono text-base font-bold text-primary shrink-0 w-5">{s.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-foreground">{s.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-[#f6f3f2] rounded p-5">
            <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mb-4">行为概率参考</p>
            <div className="space-y-2.5">
              {[
                { label: "忽略", base: 55 },
                { label: "点赞问题", base: 20 },
                { label: "发表回答", base: 15 },
                { label: "点赞/回复", base: 10 },
              ].map((r) => (
                <div key={r.label} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-20 shrink-0">{r.label}</span>
                  <div className="flex-1 h-[2px] rounded-full bg-[#eae8e7] overflow-hidden">
                    <div className="h-full rounded-full bg-primary/50" style={{ width: `${r.base}%` }} />
                  </div>
                  <span className="text-[10px] text-muted-foreground w-8 text-right">{r.base}%</span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[10px] text-muted-foreground/50">
              话题相关度高（分数 &gt; 1.5）时，回答概率额外 +20%，忽略概率 -25%
            </p>
          </div>
        </section>

        {/* step 5 */}
        <section className="space-y-4">
          <StepLabel step="05" label="双向对话" />
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            你可以和他们对话
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            对任意虚拟网民的评论发起回复后，该网民会保持其角色立场，读取你的回复并做出反应——可能被你说服，可能更加坚定，也可能转移话题。
          </p>
        </section>

        {/* footer cta */}
        <section className="py-4 border-t border-border/30">
          <p className="text-lg font-bold tracking-tight text-foreground mb-2">
            每一条评论背后，都是一个有完整价值观背景的人
          </p>
          <p className="text-sm text-muted-foreground">
            不是随机生成的噪音，而是有数据支撑的人格模拟
          </p>
        </section>

      </main>
    </div>
  );
}

function StepLabel({ step, label }: { step: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-bold tracking-widest uppercase text-primary">
        STEP {step}
      </span>
      <span className="text-[10px] text-muted-foreground/40">·</span>
      <span className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">
        {label}
      </span>
    </div>
  );
}
