import { env } from "@contentops/core";
import type { LlmAdapter, LlmChatInput, LlmChatOutput } from "./types";
import { llmRegistry } from "../registry";

// DeepSeek Chat API：兼容 OpenAI 格式
// https://api-docs.deepseek.com/
export const deepseekAdapter: LlmAdapter = {
  name: "deepseek",
  async chat(input: LlmChatInput): Promise<LlmChatOutput> {
    if (!env.DEEPSEEK_API_KEY) throw new Error("DEEPSEEK_API_KEY missing");
    const messages: any[] = [];
    if (input.system) messages.push({ role: "system", content: input.system });
    messages.push({ role: "user", content: input.user });

    const body: any = {
      model: "deepseek-chat",
      messages,
      temperature: input.temperature ?? 0.7,
      max_tokens: input.maxTokens ?? 2048,
    };
    if (input.json) body.response_format = { type: "json_object" };

    const r = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify(body),
    });
    if (!r.ok) throw new Error(`deepseek ${r.status}: ${await r.text()}`);
    const data: any = await r.json();
    return { text: data.choices?.[0]?.message?.content ?? "", raw: data };
  },
};

if (env.DEEPSEEK_API_KEY) llmRegistry.register(deepseekAdapter);
