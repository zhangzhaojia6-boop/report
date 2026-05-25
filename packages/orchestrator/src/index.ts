import type { Topic, Script, Asset, ScheduleItem } from "@contentops/core";
import { imageRegistry, videoRegistry, ttsRegistry, publisherRegistry } from "@contentops/adapters";

// 极简编排：让流水线先能从一个 Topic 跑到一组 ScheduleItem
// 后续切到 LangGraph / Temporal / n8n，逻辑保持等价
export interface RunOptions {
  imageAdapter?: string;
  videoAdapter?: string;
  ttsAdapter?: string;
  platforms: { platform: any; account: string }[];
}

export async function runCreative(topic: Topic, script: Script, opts: RunOptions): Promise<{
  images: Asset[]; videos: Asset[]; audios: Asset[]; finalAsset: Asset;
}> {
  const img = imageRegistry.get(opts.imageAdapter ?? "mock-image");
  const vid = videoRegistry.get(opts.videoAdapter ?? "mock-video");
  const tts = ttsRegistry.get(opts.ttsAdapter ?? "mock-tts");

  const images: Asset[] = [];
  const videos: Asset[] = [];
  const audios: Asset[] = [];

  for (const shot of script.shots) {
    const i = await img.generate({ prompt: shot.imagePrompt, aspect: "9:16" });
    images.push(i);

    const v = await vid.generate({
      prompt: shot.videoPrompt ?? shot.imagePrompt,
      imageUrl: i.url,
      durationSec: shot.durationSec,
      aspect: "9:16",
      cameraMotion: shot.cameraMotion
    });
    videos.push(v);

    const a = await tts.synthesize({ text: shot.voiceover, voice: "default", lang: topic.lang });
    audios.push(a);
  }

  // TODO: 用 ffmpeg/Remotion 把 videos+audios+字幕合成 final
  const finalAsset: Asset = {
    id: `final_${Date.now()}`,
    kind: "final",
    url: videos[0]?.url ?? "",
    meta: { topicId: topic.id, shots: script.shots.length }
  };
  return { images, videos, audios, finalAsset };
}

export async function runDistribute(
  finalAsset: Asset,
  caption: string,
  hashtags: string[],
  opts: RunOptions
): Promise<ScheduleItem[]> {
  const out: ScheduleItem[] = [];
  for (const target of opts.platforms) {
    const pub = publisherRegistry.get(target.platform);
    const r = await pub.publish({
      platform: target.platform, account: target.account,
      finalAsset, caption, hashtags
    });
    out.push({
      id: `sch_${Date.now()}_${target.platform}`,
      finalAssetId: finalAsset.id,
      platform: target.platform,
      account: target.account,
      caption,
      hashtags,
      scheduledAt: new Date().toISOString(),
      status: "published"
    });
    console.log(`[publish] ${target.platform}/${target.account} -> ${r.url}`);
  }
  return out;
}
