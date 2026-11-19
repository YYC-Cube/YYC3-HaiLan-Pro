---
file: CONTRIBUTING.md
title: YYC³ 贡献指南 — 海蓝（HaiLan Pro）
description: 海蓝项目贡献流程、分支与提交规范、本地验证门禁与代码审查要求
author: YYC³ Team <admin@0379.email>
version: v2.0.0
created: 2026-10-29
updated: 2026-11-19
status: stable
tags: [contributing, workflow, git, standard]
category: guide
language: zh-CN
audience: developers,contributors
complexity: basic
---

# YYC³ 贡献指南 — 海蓝（HaiLan Pro）

> **_YYC³_**（YanYuCloudCube™ · 注册商标）
> _言启象限 | 语枢未来_
> **_Words Initiate Quadrants, Language Serves as Core for Future_**
> _万象归元于云枢 | 深栈智启新纪元_
> **_All things converge in cloud pivot; Deep stacks ignite a new era of intelligence_**

---

## 一、开始之前

贡献前请先阅读团队标准规范（SSOT）：

| 文档 | 用途 |
| ---- | ---- |
| [YYC³ 团队通用-开发标准](./docs/YYC3-团队通用-标规文档/YYC3-团队通用-开发标准.md) | 文档规范、代码标头、命名、质量门禁 |
| [YYC³ 团队通用-命名规范](./docs/YYC3-团队通用-标规文档/YYC3-团队通用-命名规范.md) | 目录 / 文件 / 代码标识命名 |
| [YYC³ 团队通用-标头标尾](./docs/YYC3-团队通用-标规文档/YYC3-团队通用-标头标尾.md) | 标头标尾与品牌写法 |

## 二、环境准备

```bash
# 安装依赖（pnpm，禁止切换包管理器）
pnpm install

# 复制环境变量模板并填写本地凭证（严禁提交 .env.local）
cp .env.example .env.local

# 启动开发服务器
pnpm dev
```

> 若未配置 `VITE_API_BASE_URL` / `VITE_API_ANON_KEY`，应用会自动降级为**本地演示模式**并在控制台给出明确提示，不会白屏。

## 三、分支规范

| 分支 | 用途 |
| ---- | ---- |
| `main` | 稳定线（受保护，PR 进入） |
| `develop` | 集成分支 |
| `feat/<主题>` | 功能开发 |
| `fix/<主题>` | 缺陷修复 |
| `docs/<主题>` | 文档 |
| `refactor/<主题>` | 重构 |
| `dependabot/*` | 依赖机器人（自动） |

## 四、提交规范（Conventional Commits）

```
feat: 新功能        fix: 缺陷修复       docs: 文档
style: 格式         refactor: 重构      perf: 性能
test: 测试          build: 构建         chore: 杂务
ci: 流水线          revert: 回滚
```

格式：`<type>(<scope>): <subject>`

示例：`feat(settings): 统一设置三层收敛 — 网关管理面入设置页`

> 提交信息应包含版本号与变更说明，遵循《YYC³ 团队通用-开发标准.md》§1.9。

## 五、本地验证门禁（提交前必过）

```bash
# 1. 密钥硬编码扫描（必须零命中）
bash scripts/check-secrets.sh

# 2. 类型检查
npx tsc --noEmit -p tsconfig.json

# 3. 单元测试
pnpm test

# 4. 生产构建
pnpm build
```

## 六、代码规范要点

- 代码文件必须包含 JSDoc 标头（`file` / `description` / `author` / `version` / `created` / `updated` / `status` / `tags`）
- 描述不超过 50 字；标签按 类型 → 功能 → 模块 顺序排列
- **禁止硬编码任何密钥、凭证、Tailscale IP**；一律通过环境变量注入
- 组件 `PascalCase`、Hook `camelCase`、样式 `kebab-case`、测试 `源文件名.test.ts`
- 新增依赖前评估体积与维护活跃度，避免引入重复能力库

## 七、贡献流程

1. Fork 或创建分支
2. 开发 + 自测（跑通第五节全部门禁）
3. 提交（遵循提交规范，一次提交只做一件事）
4. Push 并发起 PR（关联 Issue，说明验证方式）
5. 通过 CI 与维护者审查后合并

## 八、文档贡献

项目文档统一存放于 `docs/`，遵循《YYC³ 团队通用-命名规范.md》：

| 类型 | 目录命名 | 文件命名 |
| ---- | -------- | -------- |
| 项目级文档 | `{序号}-{阶段}-{功能}-{子功能}/` | `{序号}-YYC3-{功能}-{描述}.md` |
| 应用级文档 | `src/app/docs/` | `{功能}-{类型}.ts` |

## 九、许可

贡献即同意以 [MIT](./LICENSE) 许可授权贡献内容。

---

## 变更历史

| 版本 | 日期 | 变更内容 | 作者 |
| ---- | ---- | -------- | ---- |
| v2.0.0 | 2026-11-19 | 补全标头标尾 · 修正失效链接 · 新增本地验证门禁与文档贡献规范 | YYC³ Team |
| v1.0.0 | 2026-10-29 | 初始版本 | YYC³ Team |

---

<p align="center">
  <b>YYC³</b>（YanYuCloudCube™ · 注册商标）<br>
  言启象限 | 语枢未来<br>
  <i>Words Initiate Quadrants, Language Serves as Core for Future</i><br>
  万象归元于云枢 | 深栈智启新纪元<br>
  <i>All things converge in cloud pivot; Deep stacks ignite a new era of intelligence</i><br>
  <sub>© 2026 YanYuCloudCube™（YYC³）· <a href="mailto:admin@0379.email">admin@0379.email</a></sub>
</p>
