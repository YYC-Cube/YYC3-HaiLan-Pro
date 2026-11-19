---
file: YYC3-P0凭证整改实施报告.md
title: YYC³ P0 凭证整改实施报告 — 环境变量注入与安全降级
description: 海蓝项目P0级凭证硬编码整改的实施记录、验证证据与遗留项
author: YYC³ Team <admin@0379.email>
version: v1.0.0
created: 2026-11-19
updated: 2026-11-19
status: stable
tags: [security, remediation, environment, config, report]
category: report
language: zh-CN
audience: developers,managers,stakeholders
complexity: intermediate
---

# YYC³ P0 凭证整改实施报告 — 环境变量注入与安全降级

> **_YYC³_**（YanYuCloudCube™ · 注册商标）
> _言启象限 | 语枢未来_
> **_Words Initiate Quadrants, Language Serves as Core for Future_**
> _万象归元于云枢 | 深栈智启新纪元_
> **_All things converge in cloud pivot; Deep stacks ignite a new era of intelligence_**

---

## 📋 文档说明

本报告记录《YYC3-首次技术调研与文档架构审核报告.md》所列 P0-2「硬编码凭证入库」的整改实施过程、验证证据与遗留事项。

**整改依据**：《YYC3 团队通用-开发标准.md》§4.4 数据层规范 + 硬约束「所有配置必须通过环境变量注入」。
**实施边界**：仅执行《YYC3-自研架构迁移可行性评估.md》§四 中**不依赖 Q-A 架构决策**的整改项；未触碰后端架构、依赖清单、包管理器与 workspace 结构。

---

## 一、整改前基线（实测）

| 项 | 整改前 | 证据 |
| ---- | ---- | ---- |
| 硬编码凭证文件 | `utils/supabase/info.tsx` 导出 `projectId` + `publicAnonKey` | 该文件被 git 跟踪 |
| 凭证消费点 | `src/lib/supabase.ts`、`src/config/app.config.ts` | 实读确认 |
| 环境变量模板 | 无 `.env*` 任何文件 | 全仓扫描 |
| gitignore 密钥规则 | 仅 `node_modules` | 实读确认 |
| 启动期配置校验 | 无 | 实读确认 |
| 密钥扫描门禁 | 无 | 实读确认 |

---

## 二、已实施变更

| # | 文件 | 变更 | 类型 |
| ---- | ---- | ---- | ---- |
| 1 | `src/config/env.ts` | **新增**。集中读取/归一化/校验环境变量；凭证缺失自动降级；提供 `assertEnvReady` 启动自检与 `describeEnvStatus` 脱敏诊断 | 新增 |
| 2 | `src/vite-env.d.ts` | **新增**。引入 `vite/client` 类型并声明 `ImportMetaEnv`（修复存量 `import.meta.env` 类型缺失） | 新增 |
| 3 | `src/config/app.config.ts` | 改由 env 模块注入 `baseUrl` / `anonKey`；`useRealBackend` 随凭证自动降级 | 修改 |
| 4 | `src/lib/supabase.ts` | 移除硬编码导入，改为 env 注入；凭证缺失导出 `null` 而非抛错（防白屏）；保留单例模式 | 修改 |
| 5 | `src/app/components/ai/EdgeInferencePanel.tsx` | 适配 `supabase` 可空类型；凭证缺失时跳过实时订阅，降级为本地边缘模拟 | 修改 |
| 6 | `src/lib/registerServiceWorker.ts` | VAPID 公钥改走 env 模块统一读取 | 修改 |
| 7 | `src/main.tsx` | 渲染前注入启动期环境自检与脱敏状态快照 | 修改 |
| 8 | `utils/supabase/info.tsx` | **删除**（含硬编码凭证，已确认无任何代码引用） | 删除 |
| 9 | `.env.example` | **新增**。4 个变量模板，值全为空，附使用说明与安全约束 | 新增 |
| 10 | `.gitignore` | **重写**。新增 `.env*` 排除（保留 `.env.example`）、`*.pem`/`*.key`/`secrets.json`、构建产物、`.DS_Store` | 修改 |
| 11 | `scripts/check-secrets.sh` | **新增**。密钥硬编码扫描门禁（JWT / 私钥头 / service_role / project ref / .env 入库 五类规则） | 新增 |

---

## 三、验证证据（全部实测，非推断）

### 3.1 构建

```
✓ 3398 modules transformed.
dist/assets/index--ksbnp7B.js   1,927.25 kB │ gzip: 523.07 kB
✓ built in 13.54s
```
**结论**：生产构建通过。

### 3.2 类型检查

| 项 | 结果 |
| ---- | ---- |
| 类型错误总数 | 28 → **27**（`vite-env.d.ts` 修复了 1 处 `import.meta.env` 缺失） |
| **本次改动文件引入的错误** | **0**（`env.ts` / `app.config.ts` / `supabase.ts` / `main.tsx` / `EdgeInferencePanel.tsx` 全部干净） |
| 剩余 27 处 | 全部为**存量**问题（`favoritesData.ts` 字段不匹配、`DataAnalyticsPage.tsx` 缺 `cn` 导入、`CommunityHomePage.tsx` 缺 `Zap` 导入、`react-slick` 缺类型声明等） |

### 3.3 密钥零硬编码扫描

| 扫描对象 | 结果 |
| -------- | ---- |
| 源码 `src` + `utils` + `index.html` | JWT 命中 **0** |
| 构建产物 `dist/` | JWT **0** / projectId **0** / 硬编码 `*.supabase.co` 域名 **0** |
| `utils/supabase/info.tsx` | 已删除 |

### 3.4 门禁脚本双向验证

| 场景 | 期望 | 实测 |
| ---- | ---- | ---- |
| 注入原硬编码 anon key | 拦截（退出码 1） | ✅ 正确命中并报错 |
| 清理后 | 放行（退出码 0） | ✅ 通过 |
| 首版规则（过宽） | 不应误报 | ⚠️ 首版误报 `unhandledrejection`，已收紧规则后复检通过 |

### 3.5 降级路径

| 场景 | 预期 | 实测 |
| ---- | ---- | ---- |
| 凭证齐备 | `isConfigured=true`、`useRealBackend=true` | ✅ |
| 凭证缺失 | `isConfigured=false`、`useRealBackend` **自动降级 false** | ✅ |
| 应用行为 | 实时能力禁用，其余走本地模式，**不白屏** | ✅ 代码路径已适配（`supabase` 判空） |

---

## 四、遗留项与待办

| 编号 | 事项 | 等级 | 说明 |
| ---- | ---- | ---- | ---- |
| R-01 | **原 anon key 需轮换** | 🔴 P0 | 该 key 曾以明文入库并进入 git 历史，删除文件不等于撤销泄露。虽为 anon 级别（RLS 保护），仍应在 Supabase 后台轮换 |
| R-02 | 27 处存量类型错误 | 🟠 P1 | 分布在 12+ 文件，需专项修复；当前 `vite build` 不做类型检查故不影响构建 |
| R-03 | TypeScript 未声明为 devDependency | 🟠 P1 | `tsc` 不在本地依赖中，本次用 `npx` 临时调用验证。需补入 devDependencies 以支撑 CI 类型门禁 |
| R-04 | 主 chunk 1.93MB（gzip 523KB） | 🟠 P1 | 超出 500KB 警告阈值，需路由级懒加载 + manualChunks 拆分 |
| R-05 | `node_modules` 原为失效符号链接 | 🟡 P2 | 指向 `/vercel/share/...`（Vercel 沙箱残留），已移除并本地重装 |
| R-06 | `vercel.json` 用 npm 而非 pnpm | 🟡 P2 | 与 pnpm-lock 并存，线上依赖树可能不一致 |
| R-07 | Edge Functions 全为 Mock 数据 | 🔴 P0 | `ipfs.ts`/`make-server` 返回硬编码假 CID、假 guardian 统计、模拟 AI 回复；IPFS/ZK/DID 无真实实现 |
| R-08 | 无 CI/CD、无测试 | 🟠 P1 | `check-secrets.sh` 已就绪，待接入流水线 |
| R-09 | Q-A 架构形态未决 | 🔴 P0 | 后端架构迁移未启动，详见《YYC3-自研架构迁移可行性评估.md》§五 |

---

## 五、变更历史

| 版本 | 日期 | 变更内容 | 作者 |
| ---- | ---- | -------- | ---- |
| v1.0.0 | 2026-11-19 | P0 凭证环境变量化整改实施与验证记录 | YYC³ Team |

---

<p align="center">
  <b>YYC³</b>（YanYuCloudCube™ · 注册商标）<br>
  言启象限 | 语枢未来<br>
  <i>Words Initiate Quadrants, Language Serves as Core for Future</i><br>
  万象归元于云枢 | 深栈智启新纪元<br>
  <i>All things converge in cloud pivot; Deep stacks ignite a new era of intelligence</i><br>
  <sub>© 2026 YanYuCloudCube™（YYC³）· <a href="mailto:admin@0379.email">admin@0379.email</a></sub>
</p>
