// 用 ffmpeg 把每个分镜的 video + audio 拼成一条成片，并烧入 SRT 字幕
// 依赖：系统装 ffmpeg；用 `which ffmpeg` 验证
import type { Asset, Shot } from "@contentops/core";
import { spawn } from "node:child_process";
import { mkdir, writeFile, unlink } from "node:fs/promises";
import path from "node:path";

interface ComposeInput {
  shots: Shot[];
  videos: Asset[];      // 与 shots 一一对应
  audios: Asset[];      // 与 shots 一一对应
  outDir?: string;
  burnSubtitles?: boolean;
}

function run(cmd: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: ["ignore", "pipe", "pipe"] });
    let err = "";
    p.stderr.on("data", (d) => { err += d.toString(); });
    p.on("error", (e) => reject(new Error(`${cmd} spawn error: ${e.message}`)));
    p.on("close", (code) => code === 0 ? resolve() : reject(new Error(`${cmd} exit ${code}: ${err.slice(-2000)}`)));
  });
}

function urlToInput(url: string): string {
  if (url.startsWith("file://")) return url.replace("file://", "");
  return url; // 远程 URL ffmpeg 可直接吃
}

function toSrtTimestamp(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  const ms = Math.floor((sec - Math.floor(sec)) * 1000);
  const pad = (n: number, w = 2) => String(n).padStart(w, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)},${pad(ms, 3)}`;
}

function buildSrt(shots: Shot[]): string {
  let acc = 0;
  return shots.map((s, i) => {
    const start = acc;
    const end = acc + s.durationSec;
    acc = end;
    const text = s.onScreenText || s.voiceover;
    return `${i + 1}\n${toSrtTimestamp(start)} --> ${toSrtTimestamp(end)}\n${text}\n`;
  }).join("\n");
}

export async function compose(input: ComposeInput): Promise<Asset> {
  const outDir = input.outDir ?? "/tmp/contentops/final";
  await mkdir(outDir, { recursive: true });

  // 1) 每个分镜：video + audio 合一段
  const segPaths: string[] = [];
  for (let i = 0; i < input.shots.length; i++) {
    const seg = path.join(outDir, `seg_${Date.now()}_${i}.mp4`);
    const v = urlToInput(input.videos[i]!.url);
    const a = urlToInput(input.audios[i]!.url);
    await run("ffmpeg", [
      "-y",
      "-i", v,
      "-i", a,
      "-c:v", "libx264", "-preset", "veryfast", "-crf", "23",
      "-c:a", "aac", "-b:a", "128k",
      "-shortest",
      seg,
    ]);
    segPaths.push(seg);
  }

  // 2) concat
  const listFile = path.join(outDir, `list_${Date.now()}.txt`);
  await writeFile(listFile, segPaths.map((p) => `file '${p}'`).join("\n"));
  const merged = path.join(outDir, `merged_${Date.now()}.mp4`);
  await run("ffmpeg", ["-y", "-f", "concat", "-safe", "0", "-i", listFile, "-c", "copy", merged]);

  // 3) 字幕烧入（可选）
  let finalPath = merged;
  if (input.burnSubtitles !== false) {
    const srt = buildSrt(input.shots);
    const srtFile = path.join(outDir, `subs_${Date.now()}.srt`);
    await writeFile(srtFile, srt);
    finalPath = path.join(outDir, `final_${Date.now()}.mp4`);
    await run("ffmpeg", [
      "-y", "-i", merged,
      "-vf", `subtitles=${srtFile}:force_style='FontSize=18,PrimaryColour=&HFFFFFF&,OutlineColour=&H000000&,BorderStyle=3'`,
      "-c:a", "copy",
      finalPath,
    ]);
    await unlink(srtFile).catch(() => {});
  }

  // 清理中间产物
  await Promise.all(segPaths.map((p) => unlink(p).catch(() => {})));
  await unlink(listFile).catch(() => {});
  if (finalPath !== merged) await unlink(merged).catch(() => {});

  return {
    id: `final_${Date.now()}`,
    kind: "final",
    url: `file://${finalPath}`,
    meta: { shots: input.shots.length, path: finalPath },
  };
}
