/**
 * file: supabase.ts
 * description: Supabase 客户端单例 · 环境变量注入与凭证缺失安全降级
 * author: YYC³ Team
 * version: v1.1.0
 * created: 2026-06-16
 * updated: 2026-11-19
 * status: active
 * tags: [service],[supabase],[auth],[config],[security]
 *
 * brief: 创建 Supabase 客户端单例；凭证缺失时返回 null 而非抛错，避免应用白屏。
 *
 * details:
 * - 移除硬编码 projectId / publicAnonKey，改由 VITE_API_BASE_URL / VITE_API_ANON_KEY 注入
 * - 保持单例模式，避免 HMR 下重复实例导致的 GoTrueClient 警告
 * - 凭证缺失时导出 null，调用方需做空值判定（Realtime 能力将自动禁用）
 * - 自研架构迁移后，本模块可整体下线，调用点收敛至 env 判定
 *
 * dependencies: @supabase/supabase-js, ../config/env
 * exports: supabase, isSupabaseConfigured
 * notes: 严禁在本文件写入任何密钥字面量
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getEnv } from '../config/env';

const env = getEnv();

/**
 * Supabase 客户端是否可用（凭证齐备时为 true）
 */
export const isSupabaseConfigured = env.isConfigured;

/**
 * Supabase 客户端单例
 * 凭证缺失时为 null，调用方须判空
 */
export const supabase: SupabaseClient | null = (() => {
  if (!env.isConfigured) {
    console.warn(
      '[Supabase] 未配置 VITE_API_BASE_URL / VITE_API_ANON_KEY，实时能力已禁用（其余功能走本地模式）。'
    );
    return null;
  }

  // Singleton pattern to prevent "Multiple GoTrueClient instances" warning
  // especially useful during HMR or if the module is re-evaluated
  let instance: SupabaseClient | null = null;

  if (typeof window !== 'undefined') {
    // @ts-ignore
    if (window.__supabaseInstance) {
      // @ts-ignore
      instance = window.__supabaseInstance;
    }
  }

  if (!instance) {
    instance = createClient(env.apiBaseUrl, env.apiAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    });
    if (typeof window !== 'undefined') {
      // @ts-ignore
      window.__supabaseInstance = instance;
    }
  }

  return instance;
})();
