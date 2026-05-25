import { env } from "@contentops/core";
import type { LlmAdapter, LlmChatInput, LlmChatOutput } from "./types";
import { llmRegistry } from "../registry";

export const anthropicAdapter: LlmAdapter = {
  name: "anthropic",
  async chat(input: LlmChatInput): Promise<LlmChatOutput> {
    if (!env.ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY missing");
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-latest",
        max_tokens: input.maxTokens ?? 2048,
        temperature: input.temperature ?? 0.7,
        system: input.system,
        messages: [{ role: "user", content: input.user }],
      }),
    });
    if (!r.ok) throw new Error(`anthropic ${r.status}: ${await r.text()}`);
    const data: any = await r.json();
    const text = (data.content?.[0]?.text as string) ?? "";
    return { text, raw: data };
  },
};

if (env.ANTHROPIC_API_KEY) llmRegistry.register(anthropicAdapter);
