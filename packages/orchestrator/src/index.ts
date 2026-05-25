import {
  pickAdapter,
  ScriptSchema,
  type Topic, type Script, type Asset, type ScheduleItem,
} from "@contentops/core";
import {
  imageRegistry, videoRegistry, ttsRegistry, publisherRegistry, llmRegistry,
} from "@contentops/adapters";
import { compose } from "@contentops/composer";

// 一条选题进来跑通成片 + 多平台分发的完整编排
// 真实 key 在就走真实链路，缺了自动落到 mock，整条管道不会断

export interface RunOptions {
  llmAdapter?: string;
  imageAdapter?: string;
  videoAdapter?: string;
  ttsAdapter?: string;
  platforms: { platform: any; account: string }[];
  burnSubtitles?: boolean;
}

const SCRIPT_SYSTEM = `你是一名头部短视频创作者，擅长 3 秒钩子、强节奏、强情绪。
你只输出 JSON，不要任何多余文字。`;

function buildScriptPrompt(topic: Topic, totalSec = 30, shots = 5): string {
  return `选题：${topic.title}
受众：${topic.audience ?? "通用"}
语气：${topic.tone ?? "克制、信息密度高"}
总时长：${totalSec} 秒，分 ${shots} 个镜头。

输出严格 JSON，schema：
{
  "topicId": "${topic.id}",
  "hook": "string",
  "shots": [
    {
      "index": 1,
      "durationSec": number,
      "voiceover": "string",
      "onScreenText": "string?",
      "imagePrompt": "english, very specific composition/lighting/material/lens",
      "videoPrompt": "english, base on imagePrompt + motion description",
      "cameraMotion": "pan|zoom|static|dolly...",
      "bgmMood": "tense|uplifting|calm..."
    }
  ],
  "cta": "string",
  "totalSec": ${totalSec}
}
只回 JSON。`;
}

export async function writeScript(topic: Topic, opts: RunOptions = { platforms: [] }): Promise<Script> {
  const llm = llmRegistry.get(pickAdapter("llm", opts.llmAdapter));
  const out = await llm.chat({
    system: SCRIPT_SYSTEM,
    user: buildScriptPrompt(topic),
    json: true,
    temperature: 0.7,
  });
  let parsed: any;
  try { parsed = JSON.parse(out.text); }
  catch (e) { throw new Error(`script JSON parse failed: ${out.text.slice(0, 200)}`); }
  // LLM 经常忽略或写错 topicId，强制覆盖
  parsed.topicId = topic.id;
  return ScriptSchema.parse(parsed);
}

export async function runCreative(topic: Topic, script: Script, opts: RunOptions): Promise<{
  images: Asset[]; videos: Asset[]; audios: Asset[]; finalAsset: Asset;
}> {
  const img = imageRegistry.get(pickAdapter("image", opts.imageAdapter));
  const vid = videoRegistry.get(pickAdapter("video", opts.videoAdapter));
  const tts = ttsRegistry.get(pickAdapter("tts", opts.ttsAdapter));

  // 并行出图，串行出视频（视频成本高 + 速率限制）
  const images = await Promise.all(script.shots.map((s) =>
    img.generate({ prompt: s.imagePrompt, aspect: "9:16" })
  ));

  const videos: Asset[] = [];
  for (let i = 0; i < script.shots.length; i++) {
    const s = script.shots[i]!;
    const v = await vid.generate({
      prompt: s.videoPrompt ?? s.imagePrompt,
      imageUrl: images[i]!.url,
      durationSec: s.durationSec,
      aspect: "9:16",
      cameraMotion: s.cameraMotion,
    });
    videos.push(v);
  }

  // TTS 并行
  const audios = await Promise.all(script.shots.map((s) =>
    tts.synthesize({ text: s.voiceover, voice: "default", lang: topic.lang })
  ));

  // 合成
  let finalAsset: Asset;
  try {
    finalAsset = await compose({
      shots: script.shots, videos, audios,
      burnSubtitles: opts.burnSubtitles ?? true,
    });
  } catch (e) {
    // ffmpeg 不在或合成失败：先把第一段视频当占位 final，工作流可以继续
    console.warn("[compose] fallback to first video:", (e as Error).message);
    finalAsset = {
      id: `final_${Date.now()}`,
      kind: "final",
      url: videos[0]?.url ?? "",
      meta: { topicId: topic.id, shots: script.shots.length, composeError: (e as Error).message },
    };
  }
  return { images, videos, audios, finalAsset };
}

export async function runDistribute(
  finalAsset: Asset,
  caption: string,
  hashtags: string[],
  opts: RunOptions,
): Promise<ScheduleItem[]> {
  const out: ScheduleItem[] = [];
  for (const target of opts.platforms) {
    const pub = publisherRegistry.get(target.platform);
    const r = await pub.publish({
      platform: target.platform, account: target.account,
      finalAsset, caption, hashtags,
    });
    out.push({
      id: `sch_${Date.now()}_${target.platform}`,
      finalAssetId: finalAsset.id,
      platform: target.platform,
      account: target.account,
      caption,
      hashtags,
      scheduledAt: new Date().toISOString(),
      status: "published",
    });
    console.log(`[publish] ${target.platform}/${target.account} -> ${r.url}`);
  }
  return out;
}
