// 所有外部能力（图像/视频/TTS/发布）都通过统一接口接入，方便替换厂商
import type { Asset, Platform } from "@contentops/core";

export interface ImageGenInput {
  prompt: string;
  negativePrompt?: string;
  aspect?: "1:1" | "9:16" | "16:9";
  refImages?: string[];
  seed?: number;
}
export interface ImageGenAdapter {
  name: string;                          // "fal-flux" / "midjourney-proxy" / ...
  generate(input: ImageGenInput): Promise<Asset>;
}

export interface VideoGenInput {
  prompt: string;
  imageUrl?: string;                     // i2v
  durationSec?: number;
  aspect?: "9:16" | "16:9" | "1:1";
  cameraMotion?: string;
}
export interface VideoGenAdapter {
  name: string;                          // "kling" / "veo" / "runway" / "hailuo"
  generate(input: VideoGenInput): Promise<Asset>;
}

export interface TtsInput {
  text: string;
  voice: string;
  lang: "zh" | "en";
  speed?: number;
}
export interface TtsAdapter {
  name: string;
  synthesize(input: TtsInput): Promise<Asset>;
}

export interface PublishInput {
  platform: Platform;
  account: string;
  finalAsset: Asset;
  caption: string;
  hashtags: string[];
  scheduledAt?: string;
}
export interface PublishResult {
  platform: Platform;
  account: string;
  remoteId: string;
  url?: string;
}
export interface PublisherAdapter {
  name: Platform;
  publish(input: PublishInput): Promise<PublishResult>;
  fetchMetrics(remoteId: string): Promise<{ views: number; likes: number; comments: number; shares: number }>;
  replyComment?(remoteId: string, commentId: string, text: string): Promise<void>;
}
