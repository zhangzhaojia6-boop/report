// 一个简单的适配器注册表：按名字取，便于策略选择/降级/熔断
import type { ImageGenAdapter, VideoGenAdapter, TtsAdapter, PublisherAdapter } from "./types";

export class Registry<T extends { name: string }> {
  private map = new Map<string, T>();
  register(a: T) { this.map.set(a.name, a); }
  get(name: string): T {
    const v = this.map.get(name);
    if (!v) throw new Error(`Adapter not found: ${name}`);
    return v;
  }
  list(): string[] { return [...this.map.keys()]; }
}

export const imageRegistry = new Registry<ImageGenAdapter>();
export const videoRegistry = new Registry<VideoGenAdapter>();
export const ttsRegistry   = new Registry<TtsAdapter>();
export const publisherRegistry = new Registry<PublisherAdapter & { name: any }>();
