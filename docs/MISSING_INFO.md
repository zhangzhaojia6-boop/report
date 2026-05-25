# 硬性依赖清单（缺这些跑不通真实链路，但不阻塞骨架）

> M1 已落地：四种能力（LLM/图像/视频/TTS）有 key 走真实，缺 key 自动降级 mock。

| 用途 | 所在文件 | 缺失字段 | 影响范围 | 建议取值 | M1 是否启用 |
|------|---------|----------|----------|----------|------------|
| LLM 写脚本/文案/评论回复 | `.env` | `DEEPSEEK_API_KEY` 或 `ANTHROPIC_API_KEY` 或 `OPENAI_API_KEY` | 整条创作流的脚本步骤 | DeepSeek 性价比最高 | ✅ |
| 图像生成 | `.env` | `FAL_API_KEY` | 出图（i2v 上游） | Fal+Flux 速度最快 | ✅ |
| 视频生成 | `.env` | `KLING_AK` + `KLING_SK` | 出视频 | 国内可灵 | ✅ |
| TTS | `.env` | `ELEVENLABS_API_KEY` | 配音 | ElevenLabs 中英都行 | ✅ |
| 系统二进制 | OS | `ffmpeg` | 合成成片 + 字幕烧入 | `apt install ffmpeg` 或 `brew install ffmpeg` | ✅（缺则自动跳过合成，第一段视频当占位） |
| X 发布 | `.env` | `X_API_KEY` `X_API_SECRET` `X_BEARER_TOKEN` | X 发布 + 评论 | 走 X API v2 | M2 |
| YouTube | `.env` | `YOUTUBE_OAUTH_REFRESH` | YT Shorts 上传 | OAuth refresh token | M2 |
| TikTok | `.env` | `TIKTOK_ACCESS_TOKEN` | TT 发布 | 走 TikTok Content Posting API | M2 |
| 抖音/B 站/小红书/视频号 | `.env` | `DOUYIN_COOKIE` / `BILIBILI_COOKIE` / `XHS_COOKIE` / `WEIXIN_CHANNEL_COOKIE` | 国内分发 | 暂用 cookie 模式 | M2 |
| Instagram | `.env` | `INSTAGRAM_SESSION` | IG Reels | 走 Graph API 或 session | M2 |
| 数据库/对象存储 | `infra/docker-compose.yml` | 默认本地 | 持久化 | 上线换托管 PG + S3 | M2 |

## 法务/合规

- 多账号矩阵在各平台 ToS 边界上，X / TikTok / YouTube 对自动化发布限制不同，上线前需逐家走官方 API 流程。
- 评论自动回复要打"AI 辅助"标签，避免被判刷量。
