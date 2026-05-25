// 策略选择器：按能力（capability）+ 优先级 + 是否有 key 来挑 adapter 名字
// 真正的注册由 adapters 包做；这里只决定"该叫谁"

import { hasKey } from "./env";

export type Capability = "llm" | "image" | "video" | "tts";

interface Candidate {
  name: string;
  requires: Parameters<typeof hasKey>;
  priority: number; // 数字小 = 优先
}

const TABLE: Record<Capability, Candidate[]> = {
  llm: [
    { name: "deepseek",  requires: ["DEEPSEEK_API_KEY"],  priority: 1 },
    { name: "anthropic", requires: ["ANTHROPIC_API_KEY"], priority: 2 },
    { name: "openai",    requires: ["OPENAI_API_KEY"],    priority: 3 },
    { name: "mock-llm",  requires: [],                    priority: 99 },
  ],
  image: [
    { name: "fal-flux", requires: ["FAL_API_KEY"], priority: 1 },
    { name: "mock-image", requires: [],            priority: 99 },
  ],
  video: [
    { name: "kling",      requires: ["KLING_AK", "KLING_SK"], priority: 1 },
    { name: "mock-video", requires: [],                       priority: 99 },
  ],
  tts: [
    { name: "elevenlabs", requires: ["ELEVENLABS_API_KEY"], priority: 1 },
    { name: "mock-tts",   requires: [],                     priority: 99 },
  ],
};

export function pickAdapter(cap: Capability, override?: string): string {
  if (override) return override;
  const list = TABLE[cap]
    .filter((c) => c.requires.length === 0 || hasKey(...c.requires))
    .sort((a, b) => a.priority - b.priority);
  if (!list[0]) throw new Error(`No adapter available for ${cap}`);
  return list[0].name;
}

export function describeStrategy(): Record<Capability, string> {
  return {
    llm: pickAdapter("llm"),
    image: pickAdapter("image"),
    video: pickAdapter("video"),
    tts: pickAdapter("tts"),
  };
}
