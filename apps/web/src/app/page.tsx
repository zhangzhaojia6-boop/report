// 控制台首页：选题池 / 素材库 / 排期 / 数据看板 入口
export default function Home() {
  const sections = [
    { href: "/topics",   title: "选题池",    desc: "热点抓取 + 手动新增 + 优先级" },
    { href: "/scripts",  title: "脚本与分镜", desc: "LLM 起草 + 人工微调" },
    { href: "/assets",   title: "素材库",     desc: "图/视频/音频/字幕/成片" },
    { href: "/schedule", title: "排期发布",   desc: "矩阵账号 + 多平台" },
    { href: "/comments", title: "评论中心",   desc: "自动回复 + 人工接管" },
    { href: "/metrics",  title: "数据看板",   desc: "播放/互动/转化/反哺" }
  ];
  return (
    <main style={{ fontFamily: "ui-sans-serif", padding: 32, background: "#fafbfc", minHeight: "100vh" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Content Ops Workflow</h1>
      <p style={{ color: "#666", marginBottom: 24 }}>反向 leongao 那条推文：自动化图像/视频工作流 + 自动化运营</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 16 }}>
        {sections.map((s) => (
          <a key={s.href} href={s.href}
             style={{ display: "block", padding: 16, borderRadius: 12, background: "white", boxShadow: "0 1px 2px rgba(0,0,0,0.06)", textDecoration: "none", color: "#111" }}>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>{s.title}</div>
            <div style={{ color: "#666", fontSize: 13 }}>{s.desc}</div>
          </a>
        ))}
      </div>
    </main>
  );
}
