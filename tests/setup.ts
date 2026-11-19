/**
 * file: setup.ts
 * description: 测试环境全局初始化 · 引入 jest-dom 断言扩展与浏览器 API 桩
 * author: YYC³ Team
 * version: v1.0.0
 * created: 2026-11-19
 * updated: 2026-11-19
 * status: active
 * tags: [test],[setup],[environment]
 *
 * brief: 为测试环境注入断言扩展与必要浏览器 API 模拟。
 *
 * details:
 * - 引入 @testing-library/jest-dom 提供 DOM 断言扩展
 * - 模拟 matchMedia（jsdom 未实现，Tailwind 响应式工具依赖）
 * - 模拟 ResizeObserver（react-three-fiber / 部分布局组件依赖）
 * - 每次测试后清理，避免状态串扰
 *
 * dependencies: @testing-library/jest-dom, vitest
 * exports: (全局副作用)
 * notes: 新增桩函数时保持最小化，避免掩盖真实缺陷
 */

import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// jsdom 未实现 matchMedia —— Tailwind 与响应式 Hook 依赖
if (!window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  });
}

// jsdom 未实现 ResizeObserver
if (!(globalThis as any).ResizeObserver) {
  (globalThis as any).ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

// jsdom 未实现 scrollTo
if (!window.scrollTo) {
  window.scrollTo = (() => {}) as typeof window.scrollTo;
}

afterEach(() => {
  cleanup();
  localStorage.clear();
  sessionStorage.clear();
});
