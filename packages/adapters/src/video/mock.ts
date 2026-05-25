import type { Asset } from "@contentops/core";
import type { VideoGenAdapter, VideoGenInput } from "../types";
import { videoRegistry } from "../registry";

export const mockVideoAdapter: VideoGenAdapter = {
  name: "mock-video",
  async generate(input: VideoGenInput): Promise<Asset> {
    return {
      id: `vid_${Date.now()}`,
      kind: "video",
      url: "https://samplelib.com/lib/preview/mp4/sample-5s.mp4",
      meta: { prompt: input.prompt, durationSec: input.durationSec ?? 5 }
    };
  }
};

videoRegistry.register(mockVideoAdapter);
