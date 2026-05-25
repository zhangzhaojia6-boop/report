// 集中管理环境变量与能力探测
// 不引入 dotenv 依赖：调用方在进程启动前自己 source .env 即可
// 在 Node 里直接读 process.env，浏览器侧不会进这里

export const env = {
  // LLM
  DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY,
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,

  // Image
  FAL_API_KEY: process.env.FAL_API_KEY,
  REPLICATE_API_TOKEN: process.env.REPLICATE_API_TOKEN,

  // Video
  KLING_AK: process.env.KLING_AK,
  KLING_SK: process.env.KLING_SK,
  RUNWAY_API_KEY: process.env.RUNWAY_API_KEY,
  GOOGLE_VEO_API_KEY: process.env.GOOGLE_VEO_API_KEY,
  MINIMAX_API_KEY: process.env.MINIMAX_API_KEY,

  // TTS
  ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY,
  MINIMAX_TTS_KEY: process.env.MINIMAX_TTS_KEY,

  // Infra
  DATABASE_URL: process.env.DATABASE_URL,
  REDIS_URL: process.env.REDIS_URL,
  S3_ENDPOINT: process.env.S3_ENDPOINT,
} as const;

export function hasKey(...keys: (keyof typeof env)[]): boolean {
  return keys.every((k) => !!env[k]);
}
