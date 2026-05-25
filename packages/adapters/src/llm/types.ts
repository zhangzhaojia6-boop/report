// LLM 统一接口：JSON-only 模式优先，便于 Script/Caption/CommentReply 共用
export interface LlmChatInput {
  system?: string;
  user: string;
  json?: boolean;       // 是否要求严格 JSON 输出
  temperature?: number;
  maxTokens?: number;
}
export interface LlmChatOutput {
  text: string;
  raw?: unknown;
}
export interface LlmAdapter {
  name: string;
  chat(input: LlmChatInput): Promise<LlmChatOutput>;
}
