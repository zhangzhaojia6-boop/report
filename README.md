# Content Ops Workflow

反向 leongao 那条推文里的玩法（自动化图像/视频工作流 + 自动化运营），做成一个可跑的开源项目工作流。

> 注：原推文 `https://x.com/leongao/status/2057294867924226237` 当前抓不到正文，本仓库按"内容工厂 + 矩阵运营"的通用形态反推搭建。等拿到原文后会按 `docs/REVERSE_ENGINEERING.md` 二次校准。

## 一句话定位

一条选题进来，自动产出图/视频，自动多账号多平台发，自动回评论，自动看数据反哺下一条。

## 两条流水线

- **创作流水线**：选题 → 脚本 → 分镜 → 出图 → 出视频 → TTS+字幕+BGM → 合成 → 质检 → 入库
- **运营流水线**：排期 → 多平台发布 → 评论/DM 自动回复 → 数据回流 → A/B → 反哺 Prompt

## 目录

```
apps/web         前端控制台（Next.js）
apps/worker      后台 Worker（消费队列）
packages/core    领域模型、类型、状态机
packages/adapters     图像/视频/TTS/平台 适配器
packages/prompts      Prompt 模板（YAML）
packages/orchestrator 任务编排（LangGraph 风格）
workflows        n8n 工作流 JSON
infra            docker-compose（Postgres + Redis + MinIO + n8n）
docs             架构、逆向、路线图、缺失依赖清单
```

## 快速开始

```bash
pnpm install
cp .env.example .env
docker compose -f infra/docker-compose.yml up -d
pnpm -F web dev
pnpm -F worker dev
```

## 关键文档

- `docs/ARCHITECTURE.md` 系统分层与数据流
- `docs/REVERSE_ENGINEERING.md` 原推文功能反推 + 验证清单
- `docs/ROADMAP.md` 分阶段路线图
- `docs/MISSING_INFO.md` 必须由你提供的密钥/账号/凭证清单
