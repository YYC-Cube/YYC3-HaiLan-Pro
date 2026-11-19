/**
 * file: env.ts
 * description: 环境变量配置模块 · 集中读取、校验与安全降级
 * author: YYC³ Team
 * version: v1.0.0
 * created: 2026-11-19
 * updated: 2026-11-19
 * status: active
 * tags: [config],[env],[security],[bootstrap]
 *
 * copyright: YYC³ Team
 * license: MIT
 *
 * brief: 统一从 import.meta.env 读取运行时配置，禁止任何凭证硬编码。
 *
 * details:
 * - 所有凭证（URL / anonKey / VAPID 公钥）一律通过环境变量注入
 * - 缺失关键变量时不静默失败：开发环境给出明确指引，生产环境降级为本地模式
 * - 提供 isConfigured 供调用方判断是否具备真实后端能力
 * - 变量清单见项目根目录 .env.example
 *
 * dependencies: Vite import.meta.env
 * exports: AppEnv, getEnv, assertEnvReady, describeEnvStatus
 * notes: 生产环境部署前必须配置 .env 或平台环境变量，否则仅本地模式可用
 */

/**
 * 环境变量键名常量
 * 与 .env.example 保持一一对应
 */
export const ENV_KEYS = {
  /** 后端服务基地址（自研架构迁移后指向自研网关） */
  API_BASE_URL: 'VITE_API_BASE_URL',
  /** 后端匿名访问令牌（仅限 anon/public 级别，严禁使用 service_role） */
  API_ANON_KEY: 'VITE_API_ANON_KEY',
  /** 推送通知 VAPID 公钥（Web Push 必需） */
  VAPID_PUBLIC_KEY: 'VITE_VAPID_PUBLIC_KEY',
  /** 是否启用真实后端；缺省为 false（本地演示模式） */
  USE_REAL_BACKEND: 'VITE_USE_REAL_BACKEND',
} as const;

/**
 * 环境变量原始值读取
 */
type RawEnv = Record<string, string | boolean | undefined>;

function readEnv(): RawEnv {
  try {
    return (import.meta.env ?? {}) as RawEnv;
  } catch {
    return {};
  }
}

function readString(key: string): string {
  const raw = readEnv()[key];
  if (typeof raw === 'string') {
    return raw.trim();
  }
  return '';
}

function readBoolean(key: string, fallback = false): boolean {
  const raw = readEnv()[key];
  if (typeof raw === 'boolean') {
    return raw;
  }
  if (typeof raw === 'string') {
    const normalized = raw.trim().toLowerCase();
    if (normalized === 'true' || normalized === '1' || normalized === 'yes') {
      return true;
    }
    if (normalized === 'false' || normalized === '0' || normalized === 'no') {
      return false;
    }
  }
  return fallback;
}

/**
 * 应用环境配置快照
 */
export interface AppEnv {
  /** 后端基地址；未配置时为空字符串 */
  apiBaseUrl: string;
  /** 匿名访问令牌；未配置时为空字符串 */
  apiAnonKey: string;
  /** VAPID 公钥；未配置时为空字符串 */
  vapidPublicKey: string;
  /** 是否启用真实后端 */
  useRealBackend: boolean;
  /** 是否处于生产模式 */
  isProd: boolean;
  /** 是否处于开发模式 */
  isDev: boolean;
  /** 关键凭证是否齐备 */
  isConfigured: boolean;
  /** 缺失的关键变量名列表 */
  missingKeys: string[];
}

/**
 * 读取并归一化环境变量
 */
export function getEnv(): AppEnv {
  const apiBaseUrl = readString(ENV_KEYS.API_BASE_URL);
  const apiAnonKey = readString(ENV_KEYS.API_ANON_KEY);
  const vapidPublicKey = readString(ENV_KEYS.VAPID_PUBLIC_KEY);

  const requestedRealBackend = readBoolean(ENV_KEYS.USE_REAL_BACKEND, false);

  const missingKeys: string[] = [];
  if (!apiBaseUrl) {
    missingKeys.push(ENV_KEYS.API_BASE_URL);
  }
  if (!apiAnonKey) {
    missingKeys.push(ENV_KEYS.API_ANON_KEY);
  }

  // 关键凭证齐备才允许启用真实后端，否则强制本地模式（安全降级）
  const isConfigured = missingKeys.length === 0;
  const useRealBackend = requestedRealBackend && isConfigured;

  const isProd = readBoolean('PROD', false);

  return {
    apiBaseUrl,
    apiAnonKey,
    vapidPublicKey,
    useRealBackend,
    isProd,
    isDev: !isProd,
    isConfigured,
    missingKeys,
  };
}

/**
 * 启动期环境自检
 * 开发环境：缺失时输出明确指引；生产环境：返回失败但不抛出，避免白屏
 */
export function assertEnvReady(): { ready: boolean; env: AppEnv } {
  const env = getEnv();

  if (env.isConfigured) {
    if (env.useRealBackend) {
      console.info('[Env] 真实后端模式已启用 · baseUrl =', env.apiBaseUrl);
    } else {
      console.info('[Env] 本地演示模式（未启用真实后端或凭证缺失）');
    }
    return { ready: true, env };
  }

  const message =
    `[Env] 缺少关键环境变量：${env.missingKeys.join(', ')}。` +
    `请复制 .env.example 为 .env.local 并填写；当前降级为本地演示模式。`;

  if (env.isProd) {
    console.error('[Env][Production] ' + message);
  } else {
    console.warn('[Env][Development] ' + message);
  }

  return { ready: false, env };
}

/**
 * 生成脱敏的环境状态描述（用于诊断页或日志，绝不输出密钥明文）
 */
export function describeEnvStatus(env: AppEnv = getEnv()): string {
  const mask = (value: string): string => {
    if (!value) {
      return '(未配置)';
    }
    if (value.length <= 8) {
      return '***';
    }
    return `${value.slice(0, 4)}***${value.slice(-4)}`;
  };

  return [
    `apiBaseUrl=${env.apiBaseUrl || '(未配置)'}`,
    `apiAnonKey=${mask(env.apiAnonKey)}`,
    `vapidPublicKey=${mask(env.vapidPublicKey)}`,
    `useRealBackend=${env.useRealBackend}`,
    `isConfigured=${env.isConfigured}`,
    `missing=${env.missingKeys.join(',') || '(无)'}`,
  ].join(' | ');
}
