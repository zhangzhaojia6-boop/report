import { env } from "@contentops/core";
import type { Asset } from "@contentops/core";
import type { VideoGenAdapter, VideoGenInput } from "../types";
import { videoRegistry } from "../registry";
import { createHmac } from "node:crypto";

// 可灵 Kling i2v：拿 AK/SK 用 JWT 调用
// 文档：https://docs.qingque.cn/d/home/eZQAhEgB7yGxlVBnZ0R8Q1cVf
// 这里实现一个最小可用版：JWT 签名 + 提交任务 + 轮询结果
const BASE = "https://api.klingai.com";

function base64url(buf: Buffer | string): string {
  return Buffer.from(buf as any).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function jwtSign(ak: string, sk: string): string {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const payload = { iss: ak, exp: now + 1800, nbf: now - 5 };
  const data = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(payload))}`;
  const sig = base64url(createHmac("sha256", sk).update(data).digest());
  return `${data}.${sig}`;
}

async function pollTask(taskId: string, token: string, kind: "image2video" | "text2video"): Promise<string> {
  const url = `${BASE}/v1/videos/${kind}/${taskId}`;
  for (let i = 0; i < 60; i++) {
    const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (r.ok) {
      const d: any = await r.json();
      const status = d.data?.task_status;
      if (status === "succeed") {
        const videoUrl: string = d.data?.task_result?.videos?.[0]?.url;
        if (videoUrl) return videoUrl;
        throw new Error("kling: succeed but no url");
      }
      if (status === "failed") throw new Error(`kling failed: ${d.data?.task_status_msg}`);
    }
    await new Promise((res) => setTimeout(res, 5000));
  }
  throw new Error("kling: poll timeout");
}

export const klingVideoAdapter: VideoGenAdapter = {
  name: "kling",
  async generate(input: VideoGenInput): Promise<Asset> {
    if (!env.KLING_AK || !env.KLING_SK) throw new Error("KLING_AK/SK missing");
    const token = jwtSign(env.KLING_AK, env.KLING_SK);
    const kind: "image2video" | "text2video" = input.imageUrl ? "image2video" : "text2video";

    const body: any = {
      model_name: "kling-v1",
      prompt: input.prompt,
      duration: String(input.durationSec ?? 5),
      aspect_ratio: input.aspect ?? "9:16",
      cfg_scale: 0.5,
    };
    if (input.imageUrl) body.image = input.imageUrl;
    if (input.cameraMotion) body.camera_control = { type: "simple", config: { horizontal: 0, vertical: 0, pan: 0, tilt: 0, roll: 0, zoom: 0 } };

    const r = await fetch(`${BASE}/v1/videos/${kind}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    if (!r.ok) throw new Error(`kling submit ${r.status}: ${await r.text()}`);
    const submitted: any = await r.json();
    const taskId: string = submitted.data?.task_id;
    if (!taskId) throw new Error("kling: no task_id");
    const url = await pollTask(taskId, token, kind);
    return {
      id: `vid_${Date.now()}`,
      kind: "video",
      url,
      meta: { prompt: input.prompt, durationSec: input.durationSec ?? 5, taskId },
    };
  },
};

if (env.KLING_AK && env.KLING_SK) videoRegistry.register(klingVideoAdapter);
