---
file: YYC3-QA架构决议草案.md
title: YYC³ Q-A 架构决议草案 — 海蓝（HaiLan Pro）后端路线三选一
description: NAS本地栈、PG15+Redis自研、保留Supabase三条路线的利弊矩阵与推荐决议
author: YYC³ Team <admin@0379.email>
version: v1.0.0
created: 2026-11-19
updated: 2026-11-19
status: review
tags: [architecture, decision, proposal, migration, governance]
category: plan
language: zh-CN
audience: managers,architects,stakeholders
complexity: advanced
---

# YYC³ Q-A 架构决议草案 — 海蓝（HaiLan Pro）后端路线三选一

> **_YYC³_**（YanYuCloudCube™ · 注册商标）
> _言启象限 | 语枢未来_
> **_Words Initiate Quadrants, Language Serves as Core for Future_**
> _万象归元于云枢 | 深栈智启新纪元_
> **_All things converge in cloud pivot; Deep stacks ignite a new era of intelligence_**

---

## 📋 文档说明

**决议编号**：Q-A（承接《YYC3-首次技术调研与文档架构审核报告.md》§六 Q-01）
**决策需求**：后端架构最终形态未定，迁移工作无法启动。
**文档性质**：**待签字决议草案**，不是已生效决策。未经签署，不得启动迁移。

**背景要点**：硬约束要求「禁止引入 Supabase、禁止替换 PG15 + Redis 自研数据架构」；而 phase-1 蓝图设计的是「离线优先 + 私有 NAS + 本地 IndexedDB」。**这两者并非同一套技术栈**（NAS 本地库 ≠ PG15 + Redis），因此必须先明确以哪个为准。

---

## 一、待决议问题（一句话）

> **海蓝项目后端采用哪一种形态：(A) 私有 NAS 本地存储栈；(B) 自研 PG15 + Redis 服务栈；(C) 保留现有 Supabase BaaS？**

---

## 二、三条路线技术画像

### 路线 A · 私有 NAS 本地存储栈（phase-1 蓝图原生形态）

| 维度 | 内容 |
| ---- | ---- |
| 数据主存储 | 用户自有 NAS（Synology / QNAP / 自组 Linux），本地磁盘或 NAS 内置 DB |
| 前端持久化 | IndexedDB / localStorage 为权威源，服务端仅作同步副本 |
| AI 能力 | 本地规则引擎 + NAS 上运行的私有 LLM（Llama 3 / Qwen） |
| 鉴权 | WebAuthn 设备绑定 + 本地会话，服务端不持有长期凭证 |
| 部署形态 | 每用户一套私有实例，天然数据隔离 |
| 与蓝图契合度 | ★★★★★ 完全一致 |

### 路线 B · 自研 PG15 + Redis 服务栈

| 维度 | 内容 |
| ---- | ---- |
| 数据主存储 | 集中式 PostgreSQL 15（行级安全策略隔离多租户） |
| 缓存 / 会话 | Redis 7（会话、限流、热点缓存） |
| 鉴权 | 自研会话 + WebAuthn 二次校验，服务端签发 Token |
| AI 能力 | 边缘接入自研推理服务或调用私有 LLM 网关 |
| 部署形态 | 团队级或私有云集群，单实例多租户 |
| 与蓝图契合度 | ★★☆☆☆ 违背「数据不出户」初衷，但满足「自研数据架构」硬约束 |

### 路线 C · 保留现有 Supabase BaaS

| 维度 | 内容 |
| ---- | ---- |
| 数据主存储 | Supabase Postgres + Storage + Auth |
| 缓存 | Supabase 内置 |
| 鉴权 | Supabase Admin Auth + RLS |
| AI 能力 | Edge Functions（当前全为 Mock，需重写） |
| 部署形态 | 第三方托管 |
| 与蓝图契合度 | ★★☆☆☆ 与「离线优先」相悖 |
| 与硬约束 | ❌ **直接违反**「禁止引入 Supabase」 |

---

## 三、多维对比矩阵

| 评估项 | A · NAS 本地栈 | B · 自研 PG15+Redis | C · 保留 Supabase |
| ------ | -------------- | ------------------- | ---------------- |
| 隐私主权 | 🟢 数据完全不出户 | 🟡 集中存储，依赖租户隔离 | 🔴 第三方托管 |
| 满足「自研数据架构」硬约束 | 🟡 需明确「自研」定义 | 🟢 完全满足 | 🔴 违反 |
| 与 phase-1 蓝图一致性 | 🟢 完全一致 | 🟡 部分偏离 | 🔴 背离 |
| 前端改造量 | 🟢 小（契约已存在） | 🟢 小（契约已存在） | 🟢 零（现状） |
| 后端新建工作量 | 🟡 中（~753 行等价重写） | 🔴 高（需建 schema/迁移/鉴权/缓存层） | 🟢 低 |
| 运维复杂度 | 🟢 低（用户自管） | 🔴 高（需专业 DBA / 备份 / 容灾） | 🟢 低 |
| 并发承载能力 | 🟡 受单机约束 | 🟢 高（可水平扩展） | 🟢 高 |
| 数据一致性保障 | 🔴 弱（多副本场景） | 🟢 强（事务 + 复制） | 🟢 强 |
| 单用户成本 | 🟢 极低 | 🟡 中 | 🟡 按量 |
| 团队交付可控性 | 🟡 依赖用户硬件 | 🟡 依赖基础设施 | 🟢 高 |
| 生态成熟度 | 🟡 低 | 🟡 中 | 🟢 高 |
| **合规宣称可行性** | 🟢 支撑「绝对隐私」 | 🟡 需补充隔离论证 | 🔴 难以支撑 |

---

## 四、风险与前置条件

### 路线 A 前置条件
- 用户侧须具备 NAS 或可运行环境（**Q-B 待确认**）
- 需实现多设备同步协议（当前无）
- 无中心化审计能力

### 路线 B 前置条件
- 须确定基础设施归属与预算（**Q-B 待确认**）
- 须完成 schema 设计、迁移脚本、备份与容灾方案
- 须实现自研鉴权体系（当前无）
- 须补齐 CI/CD 与监控告警（**当前为零**）

### 路线 C 前置条件
- 须由决策方**书面豁免**「禁止引入 Supabase」硬约束
- 须完成 anon key 轮换（R-01）
- 须将 Edge Functions 从 Mock 升级为真实实现（R-07）
- 须补齐测试与 CI（已完成基线）

---

## 五、推荐决议

### 🥇 推荐：路线 A 的受限形态 ——「私有 NAS + 自研 PG15/Redis 组合」

> **在用户自有 NAS（或私有服务器）上部署自研 PostgreSQL 15 + Redis 7，前端保持离线优先。**

**推荐理由**：

1. **同时满足三方约束** —— 保留 phase-1 的「离线优先、数据不出户」愿景，且后端为「自研 PG15 + Redis」数据架构，不引入任何第三方 BaaS。
2. **规避集中式隐私风险** —— 多用户物理隔离，天然支撑「绝对隐私」宣称。
3. **前端改造量最小** —— API 契约已存在（/assets /ipfs/* /guardian/* /chat/completions），按渐进式双轨替换路线执行。
4. **运维边界清晰** —— 责任归属于部署方，团队不背负长期托管成本。

**该形态需在决议中明确回答的两个子问题**：
- 「自研数据架构」是否要求**自有服务器**部署，还是允许**用户侧 NAS** 部署？
- 是否接受**单机部署**作为 v1 目标（高可用与水平扩展延后）？

### 🥈 备选：路线 B（自建集中式集群）

若业务确需多用户共享数据与强一致性（如社区内容跨用户可见、版主治理需要中心化审计），则应选路线 B，但必须接受更高的基础设施投入与运维责任。

### ⛔ 不推荐：路线 C

直接违反已声明的硬约束。若确需保留，应由决策方**书面豁免**该约束并记录在案，而非默认沿用。

---

## 六、决议签署栏

| 角色 | 姓名 | 意见 | 日期 |
| ---- | ---- | ---- | ---- |
| 架构负责人 | ________ | ☐ 路线A ☐ 路线B ☐ 路线C | ______ |
| 产品负责人 | ________ | ☐ 路线A ☐ 路线B ☐ 路线C | ______ |
| 技术负责人 | ________ | ☐ 路线A ☐ 路线B ☐ 路线C | ______ |

**决议生效条件**：三方签署齐全后方可启动《YYC3-自研架构迁移可行性评估.md》§四 的阶段 1。

---

## 七、变更历史

| 版本 | 日期 | 变更内容 | 作者 |
| ---- | ---- | -------- | ---- |
| v1.0.0 | 2026-11-19 | 新建 Q-A 决议草案：三路线对比与推荐 | YYC³ Team |

---

<p align="center">
  <b>YYC³</b>（YanYuCloudCube™ · 注册商标）<br>
  言启象限 | 语枢未来<br>
  <i>Words Initiate Quadrants, Language Serves as Core for Future</i><br>
  万象归元于云枢 | 深栈智启新纪元<br>
  <i>All things converge in cloud pivot; Deep stacks ignite a new era of intelligence</i><br>
  <sub>© 2026 YanYuCloudCube™（YYC³）· <a href="mailto:admin@0379.email">admin@0379.email</a></sub>
</p>
