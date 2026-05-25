import type { Asset } from "@contentops/core";
import type { TtsAdapter, TtsInput } from "../types";
import { ttsRegistry } from "../registry";

export const mockTtsAdapter: TtsAdapter = {
  name: "mock-tts",
  async synthesize(input: TtsInput): Promise<Asset> {
    return {
      id: `tts_${Date.now()}`,
      kind: "audio",
      url: "https://www.soundjay.com/buttons/sounds/button-3.mp3",
      meta: { text: input.text, voice: input.voice, lang: input.lang }
    };
  }
};

ttsRegistry.register(mockTtsAdapter);
