/**
 * file: vitest.config.ts
 * description: Vitest 测试配置 · 单元与集成测试环境、覆盖率阈值
 * author: YYC³ Team
 * version: v1.0.0
 * created: 2026-11-19
 * updated: 2026-11-19
 * status: active
 * tags: [config],[test],[vitest],[coverage]
 *
 * brief: 定义测试运行环境（jsdom）、全局 setup、覆盖率阈值与别名解析。
 *
 * details:
 * - 复用 vite.config.ts 的 @ 路径别名，保证测试与生产构建解析一致
 * - 覆盖率阈值按《YYC³ 团队通用-开发标准.md》§6.1 设为 80%
 * - exclude 排除样式与静态资源，避免无意义统计
 *
 * dependencies: vitest, @vitejs/plugin-react, @testing-library/jest-dom
 * exports: (Vite 配置)
 * notes: 阈值收紧需同步更新 CI 门禁策略
 */

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    css: false,
    include: ['tests/**/*.{test,spec}.{ts,tsx}', 'src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules/**', 'dist/**', 'supabase/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary', 'html'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/**',
        'dist/**',
        'coverage/**',
        'supabase/**',
        'src/main.tsx',
        'src/vite-env.d.ts',
        '**/*.d.ts',
        '**/*.config.{ts,js,mjs}',
      ],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
  },
});
