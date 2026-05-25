import { z } from "zod";

// ====== 选题 ======
export const TopicSchema = z.object({
  id: z.string(),
  source: z.enum(["manual", "x_trending", "rss", "youtube_trending", "douyin_hot"]),
  title: z.string(),
  keywords: z.array(z.string()).default([]),
  audience: z.string().optional(),     // 目标人群
  tone: z.string().optional(),         // 语气
  lang: z.enum(["zh", "en"]).default("zh"),
  createdAt: z.string()
});
export type Topic = z.infer<typeof TopicSchema>;

// ====== 脚本与分镜 ======
export const ShotSchema = z.object({
  index: z.number(),
  durationSec: z.number(),
  voiceover: z.string(),
  onScreenText: z.string().optional(),
  imagePrompt: z.string(),
  videoPrompt: z.string().optional(),
  cameraMotion: z.string().optional(), // pan/zoom/static
  bgmMood: z.string().optional()
});
export type Shot = z.infer<typeof ShotSchema>;

export const ScriptSchema = z.object({
  topicId: z.string(),
  hook: z.string(),
  shots: z.array(ShotSchema),
  cta: z.string().optional(),
  totalSec: z.number()
});
export type Script = z.infer<typeof ScriptSchema>;

// ====== 资产 ======
export const AssetSchema = z.object({
  id: z.string(),
  kind: z.enum(["image", "video", "audio", "subtitle", "final"]),
  url: z.string(),
  meta: z.record(z.any()).default({})
});
export type Asset = z.infer<typeof AssetSchema>;

// ====== 发布计划 ======
export const PlatformEnum = z.enum([
  "x", "youtube", "tiktok", "douyin", "bilibili", "xhs", "weixin_channel", "instagram"
]);
export type Platform = z.infer<typeof PlatformEnum>;

export const ScheduleItemSchema = z.object({
  id: z.string(),
  finalAssetId: z.string(),
  platform: PlatformEnum,
  account: z.string(),                  // 账号别名
  caption: z.string(),
  hashtags: z.array(z.string()).default([]),
  scheduledAt: z.string(),              // ISO
  status: z.enum(["queued", "publishing", "published", "failed"]).default("queued")
});
export type ScheduleItem = z.infer<typeof ScheduleItemSchema>;
