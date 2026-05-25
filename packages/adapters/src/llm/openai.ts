import { env } from "@contentops/core";
import type { LlmAdapter, LlmChatInput, LlmChatOutput } from "./types";
import { llmRegistry } from "../registry";

export const openaiAdapter: LlmAdapter = {
  name: "openai",
  async chat(input: LlmChatInput): Promise<LlmChatOutput> {
    if (!env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY missing");
    const messages: any[] = [];
    if (input.system) messages.push({ role: "system", content: input.system });
    messages.push({ role: "user", content: input.user });
    const body: any = {
      model: "gpt-4o-mini",
      messages,
      temperature: input.temperature ?? 0.7,
      max_tokens: input.maxTokens ?? 2048,
    };
    if (input.json) body.response_format = { type: "json_object" };

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify(body),
    });
    if (!r.ok) throw new Error(`openai ${r.status}: ${await r.text()}`);
    const data: any = await r.json();
    return { text: data.choices?.[0]?.message?.content ?? "", raw: data };
  },
};

if (env.OPENAI_API_KEY) llmRegistry.register(openaiAdapter);
