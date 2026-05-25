# 硬性依赖清单（缺这些跑不通真实链路，但不阻塞骨架）

| 用途 | 所在文件 | 缺失字段 | 影响范围 | 建议取值 |
|------|---------|----------|----------|----------|
| LLM 写脚本/文案/评论回复 | `.env` | `OPENAI_API_KEY` 或 `ANTHROPIC_API_KEY` 或 `DEEPSEEK_API_KEY` | 整条创作流 | 任选其一，DeepSeek 性价比高 |
| 图像生成 | `.env` | `FAL_API_KEY` 或 `REPLICATE_API_TOKEN` 或 `MIDJOURNEY_PROXY_URL` | 出图 | Fal+Flux 速度快 |
| 视频生成 | `.env` | `KLING_AK/SK` / `MINIMAX_API_KEY` / `RUNWAY_API_KEY` / `GOOGLE_VEO_API_KEY` | 出视频 | 国内用可灵，海外用 Veo/Runway |
| TTS | `.env` | `ELEVENLABS_API_KEY` 或 `MINIMAX_TTS_KEY` | 配音 | ElevenLabs 中英都行 |
| X 发布 | `.env` | `X_API_KEY` `X_API_SECRET` `X_BEARER_TOKEN` | X 发布 + 评论 | 走 X API v2 |
| YouTube | `.env` | `YOUTUBE_OAUTH_REFRESH` | YT Shorts 上传 | OAuth refresh token |
| TikTok | `.env` | `TIKTOK_ACCESS_TOKEN` | TT 发布 | 走 TikTok Content Posting API |
| 抖音/B 站/小红书/视频号 | `.env` | `DOUYIN_COOKIE` / `BILIBILI_COOKIE` / `XHS_COOKIE` / `WEIXIN_CHANNEL_COOKIE` | 国内分发 | 暂用 cookie 模式 |
| Instagram | `.env` | `INSTAGRAM_SESSION` | IG Reels | 走 Graph API 或 session |
| 数据库/对象存储 | `infra/docker-compose.yml` | 默认本地 | 持久化 | 上线换托管 PG + S3 |

## 法务/合规

- 多账号矩阵在各平台 ToS 边界上，X / TikTok / YouTube 对自动化发布限制不同，上线前需逐家走官方 API 流程。
- 评论自动回复要打"AI 辅助"标签，避免被判刷量。
