# 海蓝 (HaiLan) — 高端私密健康管理 PWA

> **_YYC³_**（YanYuCloudCube™ · 注册商标）
> _言启象限 | 语枢未来_
> **_Words Initiate Quadrants, Language Serves as Core for Future_**
> _万象归元于云枢 | 深栈智启新纪元_
> **_All things converge in cloud pivot; Deep stacks ignite a new era of intelligence_**

![海蓝 HaiLan](public/hero-readme.png)

**海蓝 (HaiLan)** 是一款基于 React 18.2、Vite 6 构建的私密健康管理 PWA。项目以「隐私至上」为核心，通过匿名 DID 体系、端侧加密与本地化数据管理，为用户提供安全、私密、可离线使用的健康生活管理体验。

[![CI](https://github.com/YYC-Cube/YYC3-HaiLan-Pro/actions/workflows/ci.yml/badge.svg)](https://github.com/YYC-Cube/YYC3-HaiLan-Pro/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.3.5-646CFF.svg?logo=vite&logoColor=white)](https://vite.dev/)
[![React](https://img.shields.io/badge/React-18.2-61DAFB.svg?logo=react&logoColor=black)](https://react.dev/)
[![Tailwind](https://img.shields.io/badge/Tailwind-4.1-06B6D4.svg?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![PWA](https://img.shields.io/badge/PWA-Enabled-3A3A3A.svg?logo=vitepwa&logoColor=FFD430)](https://vite-pwa.netlify.app/)
[![License: MIT](https://img.shields.io/badge/License-MIT-0056b3.svg)](LICENSE)
[![Security](https://img.shields.io/badge/Security-Policy-0056b3.svg)](SECURITY.md)
[![Code of Conduct](https://img.shields.io/badge/Code%20of%20Conduct-Contributor%20Covenant-0056b3.svg)](CODE_OF_CONDUCT.md)
[![Contributing](https://img.shields.io/badge/Contributing-Welcome-0056b3.svg)](CONTRIBUTING.md)

---

## 📋 目录

- [核心特性](#-核心特性)
- [技术栈](#-技术栈)
- [系统架构](#-系统架构)
- [快速开始](#-快速开始)
- [环境变量](#-环境变量)
- [质量门禁](#-质量门禁)
- [项目文档](#-项目文档)
- [路线图与现状](#-路线图与现状)
- [社区与许可](#-社区与许可)

---

## 🌟 核心特性

| 能力 | 说明 | 状态 |
| ---- | ---- | ---- |
| 🔒 隐私遮罩 | `CamouflageScreen` 伪装屏 + 全局模糊滤镜，公共场合防止敏感信息泄露 | ✅ 已实现 |
| 🧬 生物识别 | WebAuthn（FaceID / TouchID）原生调用，本地设备绑定 | ✅ 已实现 |
| 📴 离线优先 | Service Worker 预缓存 + IndexedDB 离线存储，无网可用 | ✅ 已实现 |
| 🛒 智能商城 | 商品浏览、购物车、结算、订单、物流与评价闭环 | ✅ 已实现 |
| 🤖 AI 助手 | 规则引擎本地降级 + 私有 LLM 接入位（NAS / 自研后端） | 🟡 部分实现 |
| 👥 健康社区 | 内容发布、问答、IPFS 存证与版主治理（当前为模拟数据） | 🟡 部分实现 |
| 📱 双端适配 | 移动端底部导航 + 桌面端 Bento Grid 双感知模型 | ✅ 已实现 |
| 🔐 端到端加密 | 对话链路加密标记与本地数据保留期策略 | 🟡 部分实现 |

---

## 🛠 技术栈

| 层级 | 技术 | 版本 |
| ---- | ---- | ---- |
| 框架 | React / React DOM | 18.2.0 |
| 构建 | Vite | 6.3.5 |
| 语言 | TypeScript（strict） | 5.6.3 |
| 样式 | Tailwind CSS | 4.1.12 |
| UI 组件 | MUI 6.4 · Radix UI · Lucide React | — |
| 动效 | Framer Motion | 10.18.0 |
| 3D / 图表 | Three.js · @react-three/fiber · Recharts | — |
| 路由 | react-router | 6.30.3 |
| 后端 | Supabase Edge Functions（Deno） | — |
| 测试 | Vitest · @testing-library/react | 2.1.9 |
| 包管理 | pnpm（单包，非 workspace） | 10.x |

> ⚠️ **技术栈口径说明**：本项目为前端原型，后端能力由 Supabase Edge Functions 承载。自研后端（PG15 + Redis）迁移方案见 [迁移可行性评估](./docs/YYC3-自研架构迁移可行性评估.md)。

---

## 🏗 系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                      src/ （前端 SPA）                        │
│  main.tsx → app/App.tsx（35 条集中式路由）                    │
│  ├── app/pages/      14 个业务域                             │
│  ├── app/context/    Cart / User / Privacy / Payment        │
│  ├── app/components/ design-system / ui / pwa / ai          │
│  ├── lib/            supabase · webauthn · SW 注册          │
│  └── config/         env（环境变量）· app.config            │
├─────────────────────────────────────────────────────────────┤
│                     API 契约（api.client）                    │
│  /assets · /ipfs/* · /guardian/* · /chat/completions        │
├─────────────────────────────────────────────────────────────┤
│              后端（Supabase Edge Functions / Deno）           │
│  make-server（路由分发）· ipfs · assets · kv_store · swarm  │
└─────────────────────────────────────────────────────────────┘
```

**数据分层**

| 层 | 载体 | 键前缀 |
| -- | ---- | ------ |
| 购物车 | localStorage | `hailan_cart` |
| 收藏 | localStorage | `hailan_favorites` |
| 搜索历史 | localStorage | `hailan_search_history` |
| 用户设置 | localStorage | `hailan_user_settings` |
| 生物设备 | localStorage | `hailan_auth_devices` |
| 隐私数据 | localStorage | `hailan_secure_*` |
| 离线缓存 | IndexedDB | `HaiLanDB` |

---

## 🚀 快速开始

### 环境要求

- Node.js ≥ 20（推荐 22）
- pnpm ≥ 9

### 安装与运行

```bash
# 1. 安装依赖
pnpm install

# 2. 配置环境变量（可选；未配置时自动降级为本地演示模式）
cp .env.example .env.local

# 3. 启动开发服务器
pnpm dev
```

访问 `http://localhost:5173` 即可体验。

### 常用命令

| 命令 | 说明 |
| ---- | ---- |
| `pnpm dev` | 启动开发服务器 |
| `pnpm build` | 生产构建（输出 `dist/`） |
| `pnpm preview` | 本地预览构建产物 |
| `pnpm test` | 运行单元测试 |
| `pnpm test:watch` | 监听模式测试 |
| `pnpm test:coverage` | 覆盖率报告（阈值 80%） |
| `pnpm typecheck` | TypeScript 类型检查 |
| `pnpm lint:secrets` | 密钥硬编码扫描 |
| `pnpm verify` | **全量门禁**：密钥扫描 → 类型检查 → 测试 → 构建 |

---

## 🔐 环境变量

**所有凭证必须通过环境变量注入，严禁硬编码或提交入库。**

| 变量 | 必填 | 说明 |
| ---- | ---- | ---- |
| `VITE_API_BASE_URL` | 真实后端模式必填 | 后端基地址 |
| `VITE_API_ANON_KEY` | 真实后端模式必填 | 匿名访问令牌（严禁 service_role） |
| `VITE_VAPID_PUBLIC_KEY` | 否 | Web Push 公钥 |
| `VITE_USE_REAL_BACKEND` | 否 | 是否连接真实后端（默认 `false`） |

> 未配置或凭证缺失时，应用会**自动降级为本地演示模式**并在控制台明确提示，不会白屏、不会静默失败。
> 详见 [CONTRIBUTING.md](./CONTRIBUTING.md) 第五节。

---

## ✅ 质量门禁

| 门禁 | 命令 | 标准 |
| ---- | ---- | ---- |
| 密钥扫描 | `pnpm lint:secrets` | 0 命中 |
| 类型检查 | `pnpm typecheck` | 0 errors |
| 单元测试 | `pnpm test` | 全绿，覆盖率 ≥ 80% |
| 生产构建 | `pnpm build` | 成功产出 |
| CI 流水线 | `.github/workflows/ci.yml` | 全步骤通过 |

---

## 📚 项目文档

| 分类 | 入口 |
| ---- | ---- |
| 首次调研与架构审核 | [技术调研与文档架构审核报告](./docs/YYC3-首次技术调研与文档架构审核报告.md) |
| 文档迁移与回滚 | [文档迁移清单与回滚手册](./docs/YYC3-文档迁移清单与回滚手册.md) |
| 自研架构迁移评估 | [自研架构迁移可行性评估](./docs/YYC3-自研架构迁移可行性评估.md) |
| P0 凭证整改 | [P0 凭证整改实施报告](./docs/YYC3-P0凭证整改实施报告.md) |
| **架构决议草案** | [Q-A 后端路线三选一](./docs/YYC3-QA架构决议草案.md) |
| **密钥轮换手册** | [R-01 匿名令牌轮换](./docs/YYC3-anon密钥轮换操作手册.md) |
| **设计系统规范** | [设计系统使用规范与组件索引](./docs/YYC3-设计系统-使用规范与组件索引.md) |
| 文档总索引 | [docs/README.md](./docs/README.md) |
| 团队标准规范 | [标规文档](./docs/YYC3-团队通用-标规文档/README.md) |

---

## 🗺 路线图与现状

当前处于**内部原型阶段**，核心模块已可运行，工程化基线（类型检查 / 密钥扫描 / 单元测试 / CI）已建立。

**已知待办**

- [ ] 后端架构路线决议（NAS 本地库 vs PG15 + Redis，见 Q-A）
- [ ] 原匿名令牌轮换（曾入库，需在后台轮换）
- [ ] Edge Functions 由 Mock 数据升级为真实实现
- [ ] 主包体积优化（当前 1.93 MB / gzip 523 KB）
- [ ] 补充 E2E 测试与依赖漏洞门禁

> 完整问题分级与优化优先级见 [首次技术调研与文档架构审核报告](./docs/YYC3-首次技术调研与文档架构审核报告.md)。

---

## 👥 社区与许可

| 文件 | 说明 |
| ---- | ---- |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | 贡献指南：分支、提交规范、本地门禁 |
| [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) | 行为准则（Contributor Covenant v2.1 适配） |
| [SECURITY.md](./SECURITY.md) | 安全政策：漏洞报告渠道与响应承诺 |
| [ATTRIBUTIONS.md](./ATTRIBUTIONS.md) | 第三方资源致谢 |
| [LICENSE](./LICENSE) | MIT 许可 |

**联系方式**：`admin@0379.email`

---

## 变更历史

| 版本 | 日期 | 变更内容 | 作者 |
| ---- | ---- | -------- | ---- |
| v2.0.0 | 2026-11-19 | 按 YYC³ 标规重构：徽章矩阵、顶图、架构图、环境变量与质量门禁章节 | YYC³ Team |
| v1.0.0 | 2026-06-16 | 初始版本 | YYC³ Team |

---

<p align="center">
  <b>YYC³</b>（YanYuCloudCube™ · 注册商标）<br>
  言启象限 | 语枢未来<br>
  <i>Words Initiate Quadrants, Language Serves as Core for Future</i><br>
  万象归元于云枢 | 深栈智启新纪元<br>
  <i>All things converge in cloud pivot; Deep stacks ignite a new era of intelligence</i><br>
  <sub>© 2026 YanYuCloudCube™（YYC³）· <a href="mailto:admin@0379.email">admin@0379.email</a></sub>
</p>
