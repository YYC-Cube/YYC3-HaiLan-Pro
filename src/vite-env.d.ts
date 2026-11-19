/// <reference types="vite/client" />

/**
 * file: vite-env.d.ts
 * description: Vite 客户端类型声明 · 引入 import.meta.env 等构建期 API 类型
 * author: YYC³ Team
 * version: v1.0.0
 * created: 2026-11-19
 * updated: 2026-11-19
 * status: active
 * tags: [config],[types],[vite],[declaration]
 *
 * brief: 声明 Vite 客户端内置类型，使 import.meta.env 等 API 获得类型提示。
 *
 * details:
 * - 解决 env.ts 中 import.meta.env 的 TS2339 类型缺失
 * - 同时补齐 import.meta.glob / import.meta.hot 等 Vite 扩展 API 的类型
 * - 采用标准 /// <reference types="vite/client" /> 方式，无需改动 tsconfig 结构
 *
 * dependencies: vite
 * exports: (全局类型增强)
 * notes: 需配合 src/tsconfig 或根 tsconfig 的 include 范围（当前 include 已含 src）
 */

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_API_ANON_KEY?: string;
  readonly VITE_VAPID_PUBLIC_KEY?: string;
  readonly VITE_USE_REAL_BACKEND?: string;
  readonly PROD: boolean;
  readonly DEV: boolean;
  readonly MODE: string;
  readonly BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
