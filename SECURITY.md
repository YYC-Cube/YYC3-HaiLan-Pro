---
file: SECURITY.md
title: YYC³ 安全政策 — 海蓝（HaiLan Pro）
description: 海蓝项目漏洞报告渠道、支持版本、分级响应承诺与安全边界声明
author: YYC³ Team <admin@0379.email>
version: v2.0.0
created: 2026-10-29
updated: 2026-11-19
status: stable
tags: [security, policy, vulnerability, response]
category: policy
language: zh-CN
audience: developers,managers,contributors
complexity: basic
---

# YYC³ 安全政策 — 海蓝（HaiLan Pro）

> **_YYC³_**（YanYuCloudCube™ · 注册商标）
> _言启象限 | 语枢未来_
> **_Words Initiate Quadrants, Language Serves as Core for Future_**
> _万象归元于云枢 | 深栈智启新纪元_
> **_All things converge in cloud pivot; Deep stacks ignite a new era of intelligence_**

---

## 一、支持版本

| 版本线 | 状态 | 接收安全修复 |
| ------ | ---- | ------------ |
| `main` | 稳定线（受保护） | ✅ |
| 最近一次发布版本 | 发布态 | ✅ |
| 历史版本 | 已归档 | ❌ |

## 二、报告漏洞

> ⚠️ **请勿通过公开 Issue 报告安全漏洞。** 公开报告会使漏洞信息在修复前泄露。

- **邮箱**：`admin@0379.email`（主题格式：`[SECURITY] <项目名> <简述>`）
- **请包含**：复现步骤、影响范围、环境信息、（如可能）修复建议

## 三、响应承诺

| 阶段 | 时限 |
| ---- | ---- |
| 确认收到 | 48 小时内 |
| 初步评估与分级 | 7 天内 |
| 修复或缓解 | 高危 30 天内，其余按排期 |
| 披露 | 修复发布后协调披露 |

## 四、处理流程

```
报告 → 确认 → 分级（CVSS）→ 修复 → 回归测试 → 发布 → 协调披露与致谢
```

## 五、项目特定安全边界

海蓝（HaiLan Pro）处理高度敏感的私密健康数据，以下边界为**已知且在整改中**的项，披露前请知悉：

| 编号 | 事项 | 状态 |
| ---- | ---- | ---- |
| S-01 | 匿名访问令牌曾明文入库并进入 git 历史 | 🔴 **须轮换**（见 [《YYC3-P0凭证整改实施报告》](./docs/YYC3-P0凭证整改实施报告.md) R-01） |
| S-02 | 零知识证明 / 匿名 DID / IPFS 声明尚无真实实现验证 | 🔴 整改中，暂不构成正式安全承诺 |
| S-03 | 无自动化安全扫描与依赖漏洞门禁 | 🟠 密钥扫描已就绪，依赖扫描待接入 CI |

> **安全声明边界**：本项目当前为内部原型阶段。涉及真实用户健康数据的部署，须先完成上述 P0 项整改与安全评审。

## 六、依赖漏洞

```bash
pnpm audit --audit-level high
```

CI 门禁将在依赖扫描接入后自动执行（见《YYC3-P0凭证整改实施报告.md》R-08）。

---

## 变更历史

| 版本 | 日期 | 变更内容 | 作者 |
| ---- | ---- | -------- | ---- |
| v2.0.0 | 2026-11-19 | 补全标头标尾 · 新增项目特定安全边界与已知问题披露 | YYC³ Team |
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
