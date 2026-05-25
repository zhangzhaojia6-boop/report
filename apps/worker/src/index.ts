// Worker：演示 M1 完整链路
// 一条选题进来 → LLM 写脚本 → Fal 出图 → Kling 出视频 → ElevenLabs TTS → ffmpeg 合成 → 多平台发布
// 任何一把 key 缺失都自动降级到 mock，整条管道不会断
import "@contentops/adapters";        // 触发各适配器注册
import { writeScript, runCreative, runDistribute } from "@contentops/orchestrator";
import { describeStrategy, type Topic } from "@contentops/core";

const topic: Topic = {
  id: "t_demo_1",
  source: "manual",
  title: "AI 工厂：一条视频如何 24 小时跑通全网",
  keywords: ["AI", "自动化", "短视频"],
  audience: "想做内容副业的开发者",
  tone: "克制、信息密度高",
  lang: "zh",
  createdAt: new Date().toISOString(),
};

async function main() {
  console.log("[strategy]", describeStrategy());

  console.log("[1/4] writing script...");
  const script = await writeScript(topic);
  console.log("[script]", { hook: script.hook, shots: script.shots.length, totalSec: script.totalSec });

  console.log("[2/4] generating images + videos + tts + compose...");
  const creative = await runCreative(topic, script, {
    platforms: [],
    burnSubtitles: true,
  });
  console.log("[creative]", {
    images: creative.images.length,
    videos: creative.videos.length,
    audios: creative.audios.length,
    finalUrl: creative.finalAsset.url,
  });

  console.log("[3/4] distributing...");
  const items = await runDistribute(
    creative.finalAsset,
    script.cta ?? script.hook,
    topic.keywords,
    {
      platforms: [
        { platform: "x",       account: "main" },
        { platform: "youtube", account: "main" },
        { platform: "tiktok",  account: "cn" },
      ],
    }
  );
  console.log("[scheduled]", items.length);
  console.log("[done]");
}

main().catch((e) => { console.error("[fatal]", e); process.exit(1); });
