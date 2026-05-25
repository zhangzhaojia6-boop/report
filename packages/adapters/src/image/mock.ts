import type { Asset } from "@contentops/core";
import type { ImageGenAdapter, ImageGenInput } from "../types";
import { imageRegistry } from "../registry";

// 占位实现：先把流水线跑通，再换成 Fal/Replicate/MJ-Proxy 真实调用
export const mockImageAdapter: ImageGenAdapter = {
  name: "mock-image",
  async generate(input: ImageGenInput): Promise<Asset> {
    return {
      id: `img_${Date.now()}`,
      kind: "image",
      url: `https://placehold.co/1024x1024?text=${encodeURIComponent(input.prompt.slice(0, 24))}`,
      meta: { prompt: input.prompt, aspect: input.aspect ?? "1:1" }
    };
  }
};

imageRegistry.register(mockImageAdapter);
