import type { LlmAdapter, LlmChatInput, LlmChatOutput } from "./types";
import { llmRegistry } from "../registry";

// 没 key 时兜底：返回一个看起来像样的 JSON，让流水线不崩
export const mockLlmAdapter: LlmAdapter = {
  name: "mock-llm",
  async chat(input: LlmChatInput): Promise<LlmChatOutput> {
    if (input.json) {
      const fake = {
        topicId: "t_mock",
        hook: "AI 让我 24 小时跑通全网，结果是这样。",
        shots: [
          { index: 1, durationSec: 5, voiceover: "镜头一：开场钩子。", imagePrompt: "cinematic studio, blue light", cameraMotion: "slow zoom in" },
          { index: 2, durationSec: 6, voiceover: "镜头二：选题面板。", imagePrompt: "neon dashboard with trending topics", cameraMotion: "pan right" },
          { index: 3, durationSec: 6, voiceover: "镜头三：脚本生成。", imagePrompt: "glowing storyboard", cameraMotion: "static" },
          { index: 4, durationSec: 7, voiceover: "镜头四：渲染管线。", imagePrompt: "GPU racks with frames flying", cameraMotion: "dolly forward" },
          { index: 5, durationSec: 6, voiceover: "镜头五：全网分发。", imagePrompt: "global map with platform logos", cameraMotion: "zoom out" }
        ],
        cta: "评论扣 1 拿工作流。",
        totalSec: 30
      };
      return { text: JSON.stringify(fake) };
    }
    return { text: "[mock-llm] " + input.user.slice(0, 60) };
  }
};

llmRegistry.register(mockLlmAdapter);
