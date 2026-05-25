import { env } from "@contentops/core";
import type { Asset } from "@contentops/core";
import type { ImageGenAdapter, ImageGenInput } from "../types";
import { imageRegistry } from "../registry";

// Fal Flux 1.1 Pro：fal.ai 标准异步 + 同步 endpoint
// 这里走同步：POST /fal-ai/flux/dev?sync_mode=true
// 文档：https://fal.ai/models/fal-ai/flux/dev/api
const ENDPOINT = "https://fal.run/fal-ai/flux/dev";

const ASPECT_MAP: Record<string, string> = {
  "1:1": "square_hd",
  "16:9": "landscape_16_9",
  "9:16": "portrait_16_9",
};

export const falImageAdapter: ImageGenAdapter = {
  name: "fal-flux",
  async generate(input: ImageGenInput): Promise<Asset> {
    if (!env.FAL_API_KEY) throw new Error("FAL_API_KEY missing");
    const r = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Key ${env.FAL_API_KEY}`,
      },
      body: JSON.stringify({
        prompt: input.prompt,
        image_size: ASPECT_MAP[input.aspect ?? "1:1"] ?? "square_hd",
        num_images: 1,
        enable_safety_checker: true,
        seed: input.seed,
      }),
    });
    if (!r.ok) throw new Error(`fal-flux ${r.status}: ${await r.text()}`);
    const data: any = await r.json();
    const url: string = data.images?.[0]?.url;
    if (!url) throw new Error("fal-flux: no image url returned");
    return {
      id: `img_${Date.now()}`,
      kind: "image",
      url,
      meta: { prompt: input.prompt, aspect: input.aspect ?? "1:1", seed: data.seed },
    };
  },
};

if (env.FAL_API_KEY) imageRegistry.register(falImageAdapter);
