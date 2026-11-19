/**
 * file: app.config.ts
 * description: 系统全局配置 · 后端连接、安全策略、隐私与版本信息
 * author: YYC³ Team
 * version: v1.1.0
 * created: 2026-06-16
 * updated: 2026-11-19
 * status: active
 * tags: [config],[security],[privacy],[backend]
 *
 * brief: 集中管理后端连接、安全策略与隐私配置；凭证一律经环境变量注入。
 *
 * details:
 * - 后端 baseUrl 与 anonKey 改由 import.meta.env 注入，不再硬编码
 * - useRealBackend 在关键凭证缺失时自动降级为 false，避免无凭证空跑
 * - WebAuthn rpId 生产环境需固定域名，当前沿用 hostname 但显式标注
 * - 保留 NAS / 自研后端迁移的切换位：仅需替换 VITE_API_BASE_URL
 *
 * dependencies: ./env
 * exports: AppConfig
 * notes: 严禁在此写入任何密钥字面量
 */

import { getEnv } from './env';

const env = getEnv();

export const AppConfig = {
  // --- 后端连接配置 ---
  api: {
    /** 后端基地址：经 VITE_API_BASE_URL 注入（自研架构迁移后指向自研网关） */
    baseUrl: env.apiBaseUrl,

    /** 匿名访问令牌：经 VITE_API_ANON_KEY 注入（严禁 service_role 级别密钥） */
    anonKey: env.apiAnonKey,

    /** 超时设置（毫秒） */
    timeout: 15000,

    /**
     * 是否启用真实 API 连接
     * true: 连接后端
     * false: 使用前端本地模拟数据（演示/离线模式）
     * 关键凭证缺失时自动置为 false，由 env 模块统一判定
     */
    useRealBackend: env.useRealBackend,
  },

  // --- 安全配置 ---
  security: {
    /** WebAuthn 生物识别配置 */
    webAuthn: {
      rpName: 'HaiLan Private Health',
      /** 生产环境必须替换为固定域名（待确认：部署域名） */
      rpId: typeof window !== 'undefined' ? window.location.hostname : 'localhost',
      timeout: 60000,
    },
    /** 自动锁定时间（秒） */
    autoLockTimeout: 300,
  },

  // --- 隐私配置 ---
  privacy: {
    /** 数据本地存储键前缀，防止与其他应用冲突 */
    storagePrefix: 'hailan_secure_',
    /** 默认数据保留天数 */
    defaultRetentionDays: 30,
  },

  // --- 版本信息 ---
  version: '1.2.0-beta',
};
