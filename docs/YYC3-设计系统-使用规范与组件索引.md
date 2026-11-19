---
file: YYC3-设计系统-使用规范与组件索引.md
title: YYC³ 设计系统使用规范与组件索引 — 海蓝（HaiLan Pro）
description: 海蓝设计令牌体系、品牌组件规范、UI组件索引与无障碍交互准则
author: YYC³ Team <admin@0379.email>
version: v1.0.0
created: 2026-11-19
updated: 2026-11-19
status: stable
tags: [design-system, tokens, components, styleguide, accessibility]
category: technical
language: zh-CN
audience: developers,designers
complexity: intermediate
---

# YYC³ 设计系统使用规范与组件索引 — 海蓝（HaiLan Pro）

> **_YYC³_**（YanYuCloudCube™ · 注册商标）
> _言启象限 | 语枢未来_
> **_Words Initiate Quadrants, Language Serves as Core for Future_**
> _万象归元于云枢 | 深栈智启新纪元_
> **_All things converge in cloud pivot; Deep stacks ignite a new era of intelligence_**

---

## 📋 文档说明

本文档是海蓝前端设计体系的**统一使用入口**，索引真实存在的令牌与组件，避免重复造轮子与风格漂移。

**内容均来自实读**：`src/tokens/*.json`、`src/app/components/design-system/`、`src/app/components/ui/`。
**适用**：新增页面与组件开发、设计走查、Code Review。

---

## 一、设计令牌（Design Tokens）

令牌以 JSON 形式集中定义于 `src/tokens/`，作为唯一样式来源。

### 1.1 颜色令牌 `tokens/colors.json`

令牌分为 10 组：`blue` `purple` `gray` `neutral` `semantic` `brand` `background` `text` `border` 及顶层 `color`。

**品牌色板（brand）**

| 令牌 | 值 | 用途 |
| ---- | ---- | ---- |
| `brand.primary.default` | `{color.blue.500}` | 主按钮、主强调 |
| `brand.primary.hover` | `{color.blue.600}` | 主色悬停 |
| `brand.primary.pressed` | `{color.blue.700}` | 主色按下 |
| `brand.primary.light` | `{color.blue.400}` | 主色浅底 |
| `brand.secondary.default` | `{color.purple.500}` | 次强调、隐私主题 |
| `brand.secondary.hover` | `{color.purple.600}` | 次强调悬停 |
| `brand.deep-night` | `#1A365D` | 深色底、AR 展示区 |
| `brand.medical-white` | `#FFFFFF` | 医疗白基底 |
| `brand.coral` | `#ED8936` | 暖色提示 |
| `brand.fresh-green` | `#38A169` | 正向状态 |
| `brand.soft-pink` | `#FBB6CE` | 隐私模式点缀 |

> 令牌值采用 `{color.blue.500}` 引用式写法，由构建期解析为具体色值，**禁止在业务代码中直接写死十六进制色值**。

### 1.2 其他令牌

| 文件 | 顶层键 | 用途 |
| ---- | ------ | ---- |
| `tokens/motion.json` | `motion` | 动效时长与缓动曲线 |
| `tokens/typography.json` | `fontSize` `fontFamily` `fontWeight` `lineHeight` `letterSpacing` | 字体排印尺度 |
| `tokens/spacing.json` | `spacing` `size` `card` `button` | 间距、尺寸、卡片与按钮规格 |

### 1.3 视觉硬规则

| 规则 | 说明 |
| ---- | ---- |
| 🚫 禁用纯黑 | 全局严禁 `#000000`，使用品牌蓝 `#0056b3` 与深海蓝 `#002b5c` 替代 |
| ✅ 毛玻璃拟态 | 核心组件采用 `backdrop-blur` + 半透明白（`White/10-20%`） |
| ✅ 隐私遮罩 | 敏感区域统一使用 `PrivacyBlur` / `CamouflageScreen` 包裹 |

---

## 二、品牌组件（`app/components/design-system/`）

| 组件 | 导出 | 关键 Props | 用途 |
| ---- | ---- | --------- | ---- |
| `Button` | `Button` | `variant`（default / secondary / ghost / link / privacy / destructive / outline / liquid / aurora）、`size`（default / sm / lg / icon / xl）、`isLoading`、`as` | 主行动按钮，支持流光与极光变体 |
| `Card` | `Card` | `isPrivacyMode` | 基础卡片，支持隐私态渲染 |
| `GlassCard` | `GlassCard`、`InteractiveListItem` | `hoverEffect`、`active` | 毛玻璃卡片与可交互列表项 |
| `Badge` | `Badge`、`badgeVariants` | `variant`（cva 变体） | 状态标签 |
| `Input` | `Input` | `InputProps` | 标准输入框 |
| `FloatingInput` | `FloatingInput` | — | 浮动标签输入框 |
| `Modal` | `Modal` | — | 模态弹窗 |
| `BentoGrid` | `BentoGrid`、`BentoItem` | `BentoGridProps`、`BentoItemProps` | 桌面端 Bento 模块化栅格 |
| `Skeleton` | `Skeleton`、`SkeletonStyles` | `SkeletonProps` | 加载占位骨架 |
| `PanicButton` | `PanicButton` | `PanicButtonProps` | 紧急呼出按钮 |
| `charts/*` | 图表封装 | — | 基于 Recharts 的图表容器 |
| `utils` | `cn` | — | Tailwind 类名合并工具（必须使用） |

### 2.1 使用原则

```tsx
// ✅ 正确：使用 cn 合并类名，使用语义化令牌类
<GlassCard className="p-6 bg-white/70 border-white/40">
  <Button variant="primary" size="md">提交</Button>
</GlassCard>

// ❌ 错误：硬编码色值、绕过令牌
<div className="bg-[#000000] text-[#ffffff]" />
```

---

## 三、基础 UI 组件（`app/components/ui/`）

基于 shadcn/ui + Radix UI 构建，共 **54 个**组件，涵盖：

| 类别 | 组件 |
| ---- | ---- |
| 表单 | `input` `label` `form` `checkbox` `radio-group` `switch` `select` `slider` `textarea` `input-otp` `calendar` `popover` |
| 浮层 | `dialog` `alert-dialog` `drawer` `sheet` `hover-card` `popover` `tooltip` `dropdown-menu` `context-menu` `menubar` `command` |
| 布局 | `accordion` `aspect-ratio` `collapsible` `resizable` `scroll-area` `separator` `tabs` `breadcrumb` `pagination` `sidebar` `navigation-menu` |
| 数据展示 | `card` `badge` `avatar` `alert` `table` `chart` `carousel` `skeleton` `progress` `rating` `stepper` `status-indicator` `sonner` |
| 品牌 | `logo` `optimized-image` `privacy-input` |
| 状态切换 | `toggle` `toggle-group` `switch` `radio-group` |

> 新增页面优先复用本目录组件；确需新建时须遵循 Radix 的无障碍原语与 `cn` 合并约定。

---

## 四、无障碍与交互规范

| 准则 | 要求 |
| ---- | ---- |
| 语义化标签 | 交互元素须有可访问名称；纯图标按钮必须提供 `aria-label` |
| 焦点可见 | 使用 `focus-visible:ring-*` 保留键盘焦点环 |
| 动效降级 | 尊重 `prefers-reduced-motion`，避免强制动画 |
| 色彩对比 | 正文对比度不低于 WCAG AA（4.5:1） |
| 触控尺寸 | 可点击目标不小于 44×44 px（移动端） |
| 状态可感知 | 不仅靠颜色区分状态，须辅以图标或文案 |

---

## 五、组件开发检查清单

- [ ] 组件文件含完整 JSDoc 标头（`file` / `description` / `author` / `version` / `created` / `updated` / `status` / `tags`）
- [ ] 使用 `cn()` 合并外部 `className`
- [ ] 颜色 / 间距一律走令牌，不写死具体值
- [ ] 交互元素具备可访问名称（图标按钮加 `aria-label`）
- [ ] 支持 `ref` 透传（`React.forwardRef`）与 `...props` 展开
- [ ] 深色模式（若涉及）样式完整
- [ ] 补充单元测试（Vitest + Testing Library）

---

## 六、变更历史

| 版本 | 日期 | 变更内容 | 作者 |
| ---- | ---- | -------- | ---- |
| v1.0.0 | 2026-11-19 | 新建设计系统使用规范与组件索引 | YYC³ Team |

---

<p align="center">
  <b>YYC³</b>（YanYuCloudCube™ · 注册商标）<br>
  言启象限 | 语枢未来<br>
  <i>Words Initiate Quadrants, Language Serves as Core for Future</i><br>
  万象归元于云枢 | 深栈智启新纪元<br>
  <i>All things converge in cloud pivot; Deep stacks ignite a new era of intelligence</i><br>
  <sub>© 2026 YanYuCloudCube™（YYC³）· <a href="mailto:admin@0379.email">admin@0379.email</a></sub>
</p>
