/**
 * file: env.test.ts
 * description: 环境变量配置模块单元测试 · 覆盖解析、校验与安全降级三条主路径
 * author: YYC³ Team
 * version: v1.0.0
 * created: 2026-11-19
 * updated: 2026-11-19
 * status: active
 * tags: [test],[unit],[env],[config],[security]
 *
 * brief: 验证环境变量模块在凭证齐备、缺失、布尔解析等场景下的行为。
 *
 * details:
 * - 覆盖 getEnv 的字符串归一化与布尔解析（true/1/yes/false/0/no）
 * - 覆盖关键凭证缺失时 useRealBackend 的自动降级（安全不变量）
 * - 覆盖 assertEnvReady 的就绪/未就绪返回
 * - 覆盖 describeEnvStatus 的脱敏输出（不得泄露明文密钥）
 *
 * test-target: src/config/env.ts
 * coverage: 90%+
 * notes: 使用 vi.resetModules + vi.stubEnv 隔离 import.meta.env 状态
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

type EnvModule = typeof import('../src/config/env');

interface LoadEnvOptions {
  /** 是否处于生产模式（影响 assertEnvReady 的告警通道与降级提示） */
  prod?: boolean;
}

async function loadEnv(
  env: Record<string, string | undefined>,
  options: LoadEnvOptions = {}
): Promise<EnvModule> {
  vi.resetModules();
  vi.stubEnv('PROD', options.prod ?? false);
  Object.entries(env).forEach(([key, value]) => {
    vi.stubEnv(key, value);
  });
  const mod = await import('../src/config/env');
  return mod;
}

describe('env . 环境变量配置模块', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  describe('getEnv . 凭证齐备场景', () => {
    it('应解析出基地址与令牌，并判定为已配置', async () => {
      const { getEnv } = await loadEnv({
        VITE_API_BASE_URL: 'https://example.invalid/api',
        VITE_API_ANON_KEY: 'test-anon-key',
      });

      const env = getEnv();

      expect(env.apiBaseUrl).toBe('https://example.invalid/api');
      expect(env.apiAnonKey).toBe('test-anon-key');
      expect(env.isConfigured).toBe(true);
      expect(env.missingKeys).toEqual([]);
    });

    it('应去除首尾空白字符', async () => {
      const { getEnv } = await loadEnv({
        VITE_API_BASE_URL: '  https://example.invalid/api  ',
        VITE_API_ANON_KEY: '  test-key  ',
      });

      expect(getEnv().apiBaseUrl).toBe('https://example.invalid/api');
      expect(getEnv().apiAnonKey).toBe('test-key');
    });

    it('显式开启真实后端且凭证齐备时，useRealBackend 应为 true', async () => {
      const { getEnv } = await loadEnv({
        VITE_API_BASE_URL: 'https://example.invalid/api',
        VITE_API_ANON_KEY: 'test-key',
        VITE_USE_REAL_BACKEND: 'true',
      });

      expect(getEnv().useRealBackend).toBe(true);
    });
  });

  describe('getEnv . 凭证缺失场景（安全不变量）', () => {
    it('缺少基地址时，应列入 missingKeys 且判定为未配置', async () => {
      const { getEnv } = await loadEnv({
        VITE_API_ANON_KEY: 'test-key',
      });

      const env = getEnv();
      expect(env.isConfigured).toBe(false);
      expect(env.missingKeys).toContain('VITE_API_BASE_URL');
    });

    it('即使请求开启真实后端，凭证缺失时也必须自动降级为 false', async () => {
      const { getEnv } = await loadEnv({
        VITE_USE_REAL_BACKEND: 'true',
      });

      const env = getEnv();
      expect(env.isConfigured).toBe(false);
      expect(env.useRealBackend).toBe(false);
    });

    it('两项凭证均缺失时，missingKeys 应同时包含两者', async () => {
      const { getEnv } = await loadEnv({});

      const env = getEnv();
      expect(env.missingKeys).toEqual(
        expect.arrayContaining(['VITE_API_BASE_URL', 'VITE_API_ANON_KEY'])
      );
      expect(env.useRealBackend).toBe(false);
    });
  });

  describe('getEnv . 布尔值解析', () => {
    const truthy = ['true', 'TRUE', '1', 'yes'];
    const falsy = ['false', 'FALSE', '0', 'no'];

    truthy.forEach((value) => {
      it('应将 "' + value + '" 解析为 true', async () => {
        const { getEnv } = await loadEnv({
          VITE_API_BASE_URL: 'https://example.invalid/api',
          VITE_API_ANON_KEY: 'test-key',
          VITE_USE_REAL_BACKEND: value,
        });
        expect(getEnv().useRealBackend).toBe(true);
      });
    });

    falsy.forEach((value) => {
      it('应将 "' + value + '" 解析为 false', async () => {
        const { getEnv } = await loadEnv({
          VITE_API_BASE_URL: 'https://example.invalid/api',
          VITE_API_ANON_KEY: 'test-key',
          VITE_USE_REAL_BACKEND: value,
        });
        expect(getEnv().useRealBackend).toBe(false);
      });
    });

    it('未提供时默认应为 false', async () => {
      const { getEnv } = await loadEnv({
        VITE_API_BASE_URL: 'https://example.invalid/api',
        VITE_API_ANON_KEY: 'test-key',
      });
      expect(getEnv().useRealBackend).toBe(false);
    });

    it('无法识别的取值应回退至默认值 false', async () => {
      const { getEnv } = await loadEnv({
        VITE_API_BASE_URL: 'https://example.invalid/api',
        VITE_API_ANON_KEY: 'test-key',
        VITE_USE_REAL_BACKEND: 'maybe',
      });
      expect(getEnv().useRealBackend).toBe(false);
    });
  });

  describe('assertEnvReady . 启动期自检', () => {
    it('凭证齐备时应返回 ready=true', async () => {
      const { assertEnvReady } = await loadEnv({
        VITE_API_BASE_URL: 'https://example.invalid/api',
        VITE_API_ANON_KEY: 'test-key',
      });

      const result = assertEnvReady();
      expect(result.ready).toBe(true);
      expect(result.env.isConfigured).toBe(true);
    });

    it('凭证缺失时应返回 ready=false 且不抛出异常', async () => {
      const { assertEnvReady } = await loadEnv({});

      let result: ReturnType<typeof assertEnvReady> | undefined;
      expect(() => {
        result = assertEnvReady();
      }).not.toThrow();

      expect(result?.ready).toBe(false);
    });

    it('真实后端模式启用时应输出启用提示', async () => {
      const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => undefined);

      const { assertEnvReady } = await loadEnv({
        VITE_API_BASE_URL: 'https://example.invalid/api',
        VITE_API_ANON_KEY: 'test-key',
        VITE_USE_REAL_BACKEND: 'true',
      });

      const result = assertEnvReady();

      expect(result.ready).toBe(true);
      expect(result.env.useRealBackend).toBe(true);
      expect(infoSpy).toHaveBeenCalledWith(
        '[Env] 真实后端模式已启用 · baseUrl =',
        'https://example.invalid/api'
      );

      infoSpy.mockRestore();
    });

    it('生产环境缺失凭证时应通过 console.error 告警', async () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

      const { assertEnvReady } = await loadEnv({}, { prod: true });

      const result = assertEnvReady();

      expect(result.ready).toBe(false);
      expect(result.env.isProd).toBe(true);
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Env][Production]')
      );
      expect(warnSpy).not.toHaveBeenCalled();

      errorSpy.mockRestore();
      warnSpy.mockRestore();
    });
  });

  describe('describeEnvStatus . 脱敏诊断', () => {
    it('不得输出密钥明文', async () => {
      const { describeEnvStatus } = await loadEnv({
        VITE_API_BASE_URL: 'https://example.invalid/api',
        VITE_API_ANON_KEY: 'super-secret-anon-key-value',
      });

      const status = describeEnvStatus();
      expect(status).not.toContain('super-secret-anon-key-value');
      expect(status).toContain('***');
    });

    it('未配置时应标记为 (未配置)', async () => {
      const { describeEnvStatus } = await loadEnv({});

      expect(describeEnvStatus()).toContain('(未配置)');
    });

    it('长度不超过 8 位的密钥应整体掩码为 ***', async () => {
      const { describeEnvStatus } = await loadEnv({
        VITE_API_BASE_URL: 'https://example.invalid/api',
        VITE_API_ANON_KEY: 'short',
      });

      const status = describeEnvStatus();

      expect(status).not.toContain('short');
      expect(status).toContain('apiAnonKey=***');
    });
  });
});
