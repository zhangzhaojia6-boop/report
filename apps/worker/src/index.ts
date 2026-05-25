// Worker：演示用 demo 任务，跑一遍创作 + 发布流水线
import { runCreative, runDistribute } from "@contentops/orchestrator";
import "@contentops/adapters"; // 触发各适配器注册
import type { Topic, Script } from "@contentops/core";

const topic: Topic = {
  id: "t_demo_1",
  source: "manual",
  title: "AI 工厂：一条视频如何 24 小时跑通全网",
  keywords: ["AI", "自动化", "短视频"],
  audience: "想做内容副业的开发者",
  tone: "克制、信息密度高",
  lang: "zh",
  createdAt: new Date().toISOString()
};

const script: Script = {
  topicId: topic.id,
  hook: "我让 AI 替我打工 24 小时，结果它产出了 30 条视频。",
  totalSec: 30,
  cta: "评论区扣 1，发你工作流。",
  shots: [
    { index: 1, durationSec: 5, voiceover: "这是我的内容工厂。", imagePrompt: "futuristic content factory, blue light, cinematic", cameraMotion: "slow zoom in", bgmMood: "tense" },
    { index: 2, durationSec: 6, voiceover: "选题来自 X 和 YouTube 热榜。", imagePrompt: "neon dashboard with trending topics, dark UI", cameraMotion: "pan right" },
    { index: 3, durationSec: 6, voiceover: "AI 写脚本，分镜直接落地。", imagePrompt: "storyboard panels glowing, sci-fi", cameraMotion: "static" },
    { index: 4, durationSec: 7, voiceover: "Veo / Kling 出视频，ElevenLabs 配音。", imagePrompt: "racks of GPUs with video frames flying", cameraMotion: "dolly forward" },
    { index: 5, durationSec: 6, voiceover: "8 个平台同时分发，评论自动回。", imagePrompt: "global map with 8 platform logos pulsing", cameraMotion: "zoom out" }
  ]
};

async function main() {
  const creative = await runCreative(topic, script, {
    platforms: [
      { platform: "x", account: "main" },
      { platform: "youtube", account: "main" },
      { platform: "tiktok", account: "cn" }
    ]
  });
  console.log("[creative]", { images: creative.images.length, videos: creative.videos.length });

  const items = await runDistribute(
    creative.finalAsset,
    "我让 AI 跑了 24 小时，结果是这样的。",
    ["AI", "自动化", "内容工厂"],
    {
      platforms: [
        { platform: "x", account: "main" },
        { platform: "youtube", account: "main" },
        { platform: "tiktok", account: "cn" }
      ]
    }
  );
  console.log("[scheduled]", items.length);
}

main().catch((e) => { console.error(e); process.exit(1); });
