---
file: YYC3-anon密钥轮换操作手册.md
title: YYC³ 匿名访问令牌轮换操作手册 — R-01 闭环
description: Supabase匿名访问令牌泄露影响评估与分步轮换、回滚、验证操作流程
author: YYC³ Team <admin@0379.email>
version: v1.0.0
created: 2026-11-19
updated: 2026-11-19
status: stable
tags: [security, rotation, runbook, credentials, remediation]
category: guide
language: zh-CN
audience: developers,managers,security
complexity: intermediate
---

# YYC³ 匿名访问令牌轮换操作手册 — R-01 闭环

> **_YYC³_**（YanYuCloudCube™ · 注册商标）
> _言启象限 | 语枢未来_
> **_Words Initiate Quadrants, Language Serves as Core for Future_**
> _万象归元于云枢 | 深栈智启新纪元_
> **_All things converge in cloud pivot; Deep stacks ignite a new era of intelligence_**

---

## 📋 文档说明

**关联问题**：R-01（见《YYC3-P0凭证整改实施报告.md》§四）
**文档性质**：**操作手册**，供具备后台权限的负责人执行。
**AI 执行边界**：**本操作需登录 Supabase Dashboard 与服务器环境，超出 AI 可安全代执行的范围**（涉及生产凭证与后台权限）。AI 已完成代码侧全部准备工作（硬编码清除、环境变量化、扫描门禁），剩余步骤须由授权人按本手册执行。

---

## 一、影响评估

| 项 | 结论 |
| ---- | ---- |
| 泄露内容 | Supabase `anon` / `public` 级别 JWT（非 service_role） |
| 设计上是否敏感 | anon key 本应可公开（前端可见），真正的防线是 **RLS 行级安全策略** |
| 实际风险 | 中 —— 风险不在「key 本身」，而在 **git 历史中长期可见** + **可能被用于探测未开启 RLS 的表** |
| 最高风险场景 | 若存在未启用 RLS 的表，anon key 可直接读写全表数据 |
| 紧急度 | 中高（建议 7 日内闭环） |

### 已完成的前置工作（AI 侧）

- 删除硬编码凭证文件 `utils/supabase/info.tsx`
- `src/lib/supabase.ts` / `src/config/app.config.ts` 改由环境变量注入
- 新增 `.env.example` 模板（值为空）
- `.gitignore` 增加 `.env*` 排除规则
- 新增 `scripts/check-secrets.sh` 扫描门禁（双向验证通过）
- `scripts/check-secrets.sh` 已接入 CI

---

## 二、执行前检查清单

- [ ] 已确认当前 Supabase 项目的全部表**均已启用 RLS**
- [ ] 已确认无生产数据依赖即将失效的旧 key 的长连接会话
- [ ] 已准备好新的 `.env.local` 注入通道（本地 / 部署平台环境变量）
- [ ] 已确认回滚路径：新 key 生效后旧 key 仍可临时恢复
- [ ] 已通知相关人员本次维护窗口

---

## 三、轮换步骤

### Step 1 · 审计 RLS 覆盖（最关键，先做）

进入 Supabase Dashboard → **Table Editor**，逐表确认 RLS 状态。

```sql
-- 检查业务表是否开启 RLS（relrowsecurity 应为 true）
SELECT relname, relrowsecurity
FROM pg_class
WHERE relname IN ('<表名1>', '<表名2>');
```

**若发现未开启 RLS 的表，先补齐策略，再进行轮换。** 未开 RLS 的表即使轮换 key 仍然暴露。

### Step 2 · 生成新令牌

Supabase Dashboard → **Project Settings → API** → 找到 **anon / public** key → 轮换（Rotate / Regenerate）。

> 若面板同时提供 `service_role` 轮换按钮，**不要点击**。service_role 可绕过 RLS，仅用于服务端，本次不需要轮换。

### Step 3 · 注入新值

```bash
# 本地开发
cp .env.example .env.local
# 编辑 .env.local，填入新值
```

部署平台（Vercel 等）：在平台环境变量界面更新 `VITE_API_ANON_KEY`，**不要**写入仓库文件。

### Step 4 · 验证生效

```bash
# 1. 确认源码与产物无残留
bash scripts/check-secrets.sh

# 2. 全量门禁
pnpm verify

# 3. 启动应用，确认控制台输出无凭证缺失告警
pnpm dev
```

预期控制台输出：

```
[Env] 真实后端模式已启用 · baseUrl = https://<projectId>.supabase.co
```

### Step 5 · 确认旧 key 失效

用旧 key 发起一次请求，预期返回 **401**：

```bash
curl -i https://<projectId>.supabase.co/rest/v1/<表名> \
  -H "apikey: <旧key>" \
  -H "Authorization: Bearer <旧key>"
```

### Step 6 · 清理 git 历史（可选，风险较高）

**警告**：重写 git 历史会改变所有 commit SHA，影响协作者与 CI 缓存。

```bash
# 仅在确认团队成员可全部重新克隆时执行
git filter-repo --path utils/supabase/info.tsx --invert-paths
```

> **务必要求**：历史中的 anon key 按设计可公开，泄露影响有限。**清理历史的价值低于其带来的协作风险**。若 RLS 已确认覆盖全部表（Step 1），可仅执行 Step 2-5 而跳过本步。

---

## 四、验收标准

| 项 | 通过条件 |
| ---- | -------- |
| 代码侧零硬编码 | `pnpm lint:secrets` 退出码 0 |
| 无环境文件入库 | `git ls-files` 中无非 `.env.example` 的 `.env*` 结果 |
| 全量门禁通过 | `pnpm verify` 全步骤成功 |
| 新 key 生效 | 应用控制台输出「真实后端模式已启用」 |
| 旧 key 失效 | 旧 key 请求返回 401 |
| RLS 覆盖 | 全部业务表 `relrowsecurity = true` |

---

## 五、回滚方案

若轮换后出现异常：

1. **立即**：在 Supabase Dashboard 重新生成 anon key，恢复到上一可用值。
2. 更新 `.env.local` 与平台环境变量。
3. 重启应用并验证恢复。
4. 排查根因后再择期重新轮换。

> 因 RLS 独立于 key 生效，回滚不影响数据与策略。

---

## 六、闭环登记

| 项 | 内容 |
| ---- | ---- |
| 问题编号 | R-01 |
| 状态 | 待执行 / 执行中 / 已闭环 |
| 执行人 | ____________ |
| 执行日期 | ____________ |
| RLS 审计结论 | ____________ |
| 旧 key 失效验证 | 通过 / 未通过 |
| 备注 | ____________ |

---

## 七、变更历史

| 版本 | 日期 | 变更内容 | 作者 |
| ---- | ---- | -------- | ---- |
| v1.0.0 | 2026-11-19 | 新建 R-01 轮换操作手册 | YYC³ Team |

---

<p align="center">
  <b>YYC³</b>（YanYuCloudCube™ · 注册商标）<br>
  言启象限 | 语枢未来<br>
  <i>Words Initiate Quadrants, Language Serves as Core for Future</i><br>
  万象归元于云枢 | 深栈智启新纪元<br>
  <i>All things converge in cloud pivot; Deep stacks ignite a new era of intelligence</i><br>
  <sub>© 2026 YanYuCloudCube™（YYC³）· <a href="mailto:admin@0379.email">admin@0379.email</a></sub>
</p>
