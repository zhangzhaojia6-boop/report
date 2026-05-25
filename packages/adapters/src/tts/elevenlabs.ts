import { env } from "@contentops/core";
import type { Asset } from "@contentops/core";
import type { TtsAdapter, TtsInput } from "../types";
import { ttsRegistry } from "../registry";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

// ElevenLabs TTS：返回 mp3 二进制，保存到本地 /tmp/contentops/tts/，
// URL 用 file:// 表示本地路径，下游 ffmpeg 直接读
// 文档：https://elevenlabs.io/docs/api-reference/text-to-speech
const DEFAULT_VOICE = "21m00Tcm4TlvDq8ikWAM"; // Rachel

export const elevenLabsTts: TtsAdapter = {
  name: "elevenlabs",
  async synthesize(input: TtsInput): Promise<Asset> {
    if (!env.ELEVENLABS_API_KEY) throw new Error("ELEVENLABS_API_KEY missing");
    const voice = input.voice && input.voice !== "default" ? input.voice : DEFAULT_VOICE;
    const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}`, {
      method: "POST",
      headers: {
        "xi-api-key": env.ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text: input.text,
        model_id: "eleven_multilingual_v2",
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
      }),
    });
    if (!r.ok) throw new Error(`elevenlabs ${r.status}: ${await r.text()}`);
    const buf = Buffer.from(await r.arrayBuffer());
    const dir = "/tmp/contentops/tts";
    await mkdir(dir, { recursive: true });
    const file = path.join(dir, `tts_${Date.now()}.mp3`);
    await writeFile(file, buf);
    return {
      id: `tts_${Date.now()}`,
      kind: "audio",
      url: `file://${file}`,
      meta: { text: input.text, voice, lang: input.lang, bytes: buf.length },
    };
  },
};

if (env.ELEVENLABS_API_KEY) ttsRegistry.register(elevenLabsTts);
