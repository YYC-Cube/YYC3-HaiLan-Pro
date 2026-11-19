---
file: YYC3-自研架构迁移可行性评估.md
title: YYC³ 自研架构迁移可行性评估 — 以 phase-1 蓝图为基线
description: 以离线优先蓝图为基线，评估当前Supabase实现迁移到自研架构的可行性、工作量与风险
author: YYC³ Team <admin@0379.email>
version: v1.0.0
created: 2026-11-19
updated: 2026-11-19
status: review
tags: [architecture, migration, feasibility, assessment, report]
category: report
language: zh-CN
audience: developers,managers,stakeholders
complexity: advanced
---

# YYC³ 自研架构迁移可行性评估 — 以 phase-1 蓝图为基线

> **_YYC³_**（YanYuCloudCube™ · 注册商标）
> _言启象限 | 语枢未来_
> **_Words Initiate Quadrants, Language Serves as Core for Future_**
> _万象归元于云枢 | 深栈智启新纪元_
> **_All things converge in cloud pivot; Deep stacks ignite a new era of intelligence_**

---

## 📋 文档说明

本文档承接《YYC3-首次技术调研与文档架构审核报告.md》§六 Q-01 与《双设计路线对比》结论，以 `hailan-pro-phase-1-design`（离线优先 + 私有 NAS 蓝图）为基线，评估当前 Supabase 实现迁移到自研架构的可行性。

**取证方式**：全部结论基于 2026-11-19 对当前项目源码的实际 grep 与读取；未读取项标注「待确认」。
**硬约束遵循**：本报告**不推荐引入 Supabase**，评估目标为「移除 Supabase、落地自研/私有后端」；不硬编码密钥、不改包管理器、不改 workspace。

---

## 一、评估摘要

| 项目 | 结论 |
| ---- | ---- |
| 迁移目标 | 移除 Supabase 依赖，落地 phase-1 蓝图的「离线优先 + 私有 NAS / 自研后端」 |
| 总体可行性 | **技术可行，中等难度** |
| 前端改造面 | 小（7 个文件直接依赖 Supabase，界面层基本不动） |
| 后端新建面 | 中（约 753 行 Deno Edge Functions 逻辑需等价重写） |
| 最大不确定性 | 「自研架构」的最终形态未定：phase-1 私有 NAS vs 硬约束 PG15+Redis，二者**不等价**，须先决策（见 §五 Q-A） |
| 推荐路线 | **渐进式双轨替换**：先建自研后端 + 环境变量化，再按 API 契约逐个切换前端，最后移除 Supabase |
| 停闸条件 | 决策未定 / 凭证未环境变量化 / 无回滚方案 → 不得启动迁移 |

---

## 二、迁移工作面量化（实测）

### 2.1 前端 Supabase 依赖面（小）

| 文件 | 依赖类型 |
| ---- | ---- |
| `src/lib/supabase.ts` | `createClient` 单例（核心） |
| `utils/supabase/info.tsx` | 硬编码 `projectId` / `publicAnonKey` |
| `src/config/app.config.ts` | `baseUrl` 指向 `*.supabase.co`，内嵌 anonKey |
| `src/services/api.client.ts` | HTTP 封装，依赖上述配置 |
| `src/app/components/ai/EdgeInferencePanel.tsx` | `supabase.channel('system-status')` 实时频道 |
| 直接引用文件合计 | **7 个**（含间接） |

**结论**：Supabase 耦合集中在 `src/lib` 与 `src/services` 两个薄层，业务页面通过 `apiClient` 间接调用。**替换后端不改变 UI 组件，改造面可控**。

### 2.2 需等价重写的后端逻辑（中）

`supabase/functions/` 共 8 个文件，核心逻辑约 **753 行**：

| 模块 | 行数 | 功能 | 迁移方式 |
| ---- | ---- | ---- | ---- |
| `server/ipfs.ts` | 327 | IPFS 内容寻址、pin、审核、声望 | 自研文件/对象服务或 IPFS 节点 |
| `make-server/index.ts` | 207 | 主服务入口、路由分发 | 自研 API 网关 |
| `server/kv_store.tsx` | 86 | KV 存储（Deno KV） | 替换为 PG15/Redis |
| `server/swarm.ts` | 61 | Swarm 逻辑 | 待确认业务价值 |
| `server/assets.ts` | 38 | 资产管理 | 自研资产服务 |
| `server/index.tsx` | 34 | 服务装配 | 自研后端入口 |

**注意**：这些是 Deno/TypeScript Edge Functions，迁移到 Node/Go/其他自研栈需**完整重写**，不能简单搬运。

### 2.3 数据模型与存储（清晰）

- 类型定义集中于 `src/types/index.ts`，核心实体：`Product`、`UserProfile`、`UserPreferences`、`Article`、`Message`、`ApiResponse`（约 6 个）。
- 前端本地存储键 6 个：`hailan_cart`、`hailan_favorites`、`hailan_search_history`、`hailan_auth_devices`、`hailan_user_settings`、`hailan_secure_*`。
- **无** `schema.sql`、**无** migrations、**无** Dockerfile / docker-compose / `.env.example` → 自研后端基础设施需从零建立。

---

## 三、可行性分维度评估

| 维度 | 现状 | 迁移后目标 | 可行性 | 关键依据 |
| ---- | ---- | ---- | ---- | ---- |
| 前端解耦 | 7 文件耦合 Supabase | 改为 `apiClient` 统一指向自研网关 | ✅ 高 | 耦合集中在薄层 |
| API 契约 | `/ipfs/*`、`/assets`、`/chat/completions`、`/guardian/*` | 自研后端实现同契约 | ✅ 高 | 契约已存在于前端调用点 |
| 数据持久化 | Supabase KV + localStorage | PG15 + Redis 或本地 IndexedDB | 🟡 中 | 无现成 schema，需设计 |
| 认证体系 | Supabase Admin Auth | WebAuthn + 自研会话 | 🟡 中 | WebAuthn 已落地，会话需自建 |
| AI 能力 | Edge Function + 本地规则引擎 | 本地规则引擎 + 私有 LLM | 🟡 中 | 本地降级已落地；LLM 未落地 |
| 实时通信 | `supabase.channel` | WebSocket/SSE 自建 | 🟡 中 | 仅 1 处使用 |
| 部署运维 | Vercel | NAS/自研服务器容器化 | 🟡 中 | 无 Dockerfile，需补 |
| 凭证安全 | 硬编码 anonKey | 环境变量注入 | ✅ 高 | 改动小，收益大 |

---

## 四、推荐迁移路线（渐进式双轨，可回滚）

```
阶段 0：决策与准备（停闸）
  └─ 确认 Q-A 架构形态 → 确认无其他团队依赖 Supabase → 备份当前可运行版本

阶段 1：基础设施先行（不触碰前端业务）
  1. 新增 .env.example + .gitignore 密钥规则（VITE_API_BASE_URL 等）
  2. 建立自研后端服务骨架（Node/Go 待定），实现 /health 与 API 契约
  3. 数据层：设计 schema.sql（PG15）+ Redis 缓存键规范
  4. 接入 pnpm 单包内的 server 子目录（不改 workspace 架构）

阶段 2：凭证与配置解耦
  5. 将 projectId/anonKey 从 utils/supabase/info.tsx 迁出 → 环境变量
  6. api.client.ts 的 baseUrl 改为读取 VITE_API_BASE_URL，支持指向自研后端

阶段 3：API 逐项切换（按前端调用点）
  7. /assets → 自研资产服务（影响 HealthAssetsPage）
  8. /ipfs/* → 自研 IPFS/文件服务（影响 CommunityHomePage）
  9. /chat/completions → 本地规则引擎/私有 LLM（影响 ai.service）
  10. /guardian/* → 自研统计服务
  11. 实时频道 → WebSocket 自建（影响 EdgeInferencePanel）

阶段 4：去 Supabase 化收尾
  12. 移除 @supabase/supabase-js 依赖与 supabase/ 目录
  13. 关闭 Supabase 项目，确认无残留调用
  14. 全量回归 + 安全扫描 + 回滚演练

每阶段设独立验收门禁；任一失败即回滚到上一阶段，不跨阶段合并。
```

---

## 五、待确认清单（不假设、不编造）

| 编号 | 待确认项 | 为何关键 | 建议确认路径 |
| ---- | ---- | ---- | ---- |
| Q-A | **「自研架构」最终形态**：phase-1 蓝图是「离线优先 + 私有 NAS + 本地 IndexedDB」，硬约束写的是「PG15 + Redis 自研数据架构」。二者技术栈不同（NAS 本地库 vs PG15+Redis），需明确以哪个为准，还是组合（NAS 上部署 PG15+Redis） | 决定后端技术选型与全部工作量 | 架构负责人书面决议 |
| Q-B | 迁移目标环境：是否有 NAS / 服务器资源？配置与网络条件？ | 决定部署可行性 | 运维负责人 |
| Q-C | 自研后端语言栈（Node / Go / 其他） | 决定 753 行 Edge Functions 重写方式 | 技术负责人 |
| Q-D | 是否允许在 pnpm 单包内新增 server 子目录（不改 workspace 架构） | 关系到硬约束「禁止改 workspace」 | 用户确认 |
| Q-E | Supabase 项目是否已有生产数据需迁移导出 | 决定数据迁移方案 | 后端负责人 |
| Q-F | IPFS 是否继续保留（蓝图强调，硬约束未禁止） | 决定 327 行 ipfs.ts 是否重写 | 产品负责人 |

---

## 六、风险与缓解

| 风险 | 等级 | 缓解措施 |
| ---- | ---- | ---- |
| 架构形态未定导致返工 | 🔴 高 | Q-A 决策前不启动阶段 1 |
| 无测试，切换无回归保护 | 🔴 高 | 阶段 0 先补 Vitest/Playwright 核心用例 |
| 硬编码凭证泄露 | 🔴 高 | 阶段 2 优先环境变量化 + gitleaks 扫描 |
| Deno 逻辑重写引入缺陷 | 🟡 中 | 逐 API 切换 + 双轨对照 + 回滚点 |
| 无 schema / 无 migrations | 🟡 中 | 阶段 1 建立版本化迁移脚本 |
| 实时频道改造 | 🟡 中 | 仅 1 处使用，可最后切换 |

---

## 七、结论

**以 phase-1 蓝图为基线迁移到自研架构：技术可行，难度中等，前端改造面小（7 文件），后端需从零建立（约 753 行逻辑重写 + 基础设施补齐）。**

**但存在一票否决前置条件**：Q-A「自研架构形态」未确认前，不得启动任何迁移——因为 phase-1 的「NAS + 本地 IndexedDB」与硬约束的「PG15 + Redis」是两套不同的技术栈，选错方向将导致全部工作作废。

**推荐决策**：优先确认 Q-A；若选择「在 NAS 上部署 PG15 + Redis 自研后端」（兼顾蓝图离线愿景与硬约束），则本评估的渐进式双轨路线可直接执行，可行性评级上调为「高」。

**当前状态**：Cannot Ship / 待决策，迁移未启动。

---

## 变更历史

| 版本 | 日期 | 变更内容 | 作者 |
| ---- | ---- | -------- | ---- |
| v1.0.0 | 2026-11-19 | 基于 phase-1 蓝图的自研架构迁移可行性评估基线 | YYC³ Team |

---

<p align="center">
  <b>YYC³</b>（YanYuCloudCube™ · 注册商标）<br>
  言启象限 | 语枢未来<br>
  <i>Words Initiate Quadrants, Language Serves as Core for Future</i><br>
  万象归元于云枢 | 深栈智启新纪元<br>
  <i>All things converge in cloud pivot; Deep stacks ignite a new era of intelligence</i><br>
  <sub>© 2026 YanYuCloudCube™（YYC³）· <a href="mailto:admin@0379.email">admin@0379.email</a></sub>
</p>
