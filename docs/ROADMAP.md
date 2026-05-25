# 路线图

## M0 骨架（当前 PR）
- [x] monorepo 结构
- [x] core 类型 + 状态机
- [x] adapters 接口 + mock 实现
- [x] orchestrator 极简编排
- [x] worker demo 跑通流水线（mock）
- [x] web 控制台首页

## M1 真实出图出视频
- [ ] 接 1 家图像（Fal/Flux）
- [ ] 接 1 家视频（Kling 或 Veo）
- [ ] 接 1 家 TTS（ElevenLabs）
- [ ] FFmpeg 合成 + 字幕烧入
- [ ] LLM 写脚本（DeepSeek/Claude）

## M2 多平台分发
- [ ] X API v2 发布 + 评论
- [ ] YouTube Shorts 上传
- [ ] TikTok Content API
- [ ] 抖音/B 站/小红书 cookie 适配器
- [ ] 排期器 + 多账号矩阵

## M3 自动运营
- [ ] 评论 webhook → LLM 回复（人格化）
- [ ] 数据指标定时拉取
- [ ] A/B：相同选题不同 hook/封面，48h 后选优
- [ ] 反哺：把高互动 prompt 沉淀到模板库

## M4 控制台完整
- [ ] 选题池 CRUD + 热点抓取
- [ ] 素材库（图/视频/音频/成片）+ 预览
- [ ] 排期日历视图
- [ ] 评论中心 + 人工接管
- [ ] 数据看板（账号/平台/选题维度）

## M5 上生产
- [ ] LangGraph 替换极简编排
- [ ] Temporal 跑长任务
- [ ] OTel 全链路追踪
- [ ] 限流 + 熔断 + 降级策略
