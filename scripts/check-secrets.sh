#!/usr/bin/env bash
# ============================================================
# YYC³（YanYuCloudCube™ · 注册商标）
# 言启象限 | 语枢未来
# Words Initiate Quadrants, Language Serves as Core for Future
# ============================================================
# Copyright (c) 2026 YanYuCloudCube™（YYC³）
# Contact: admin@0379.email
# ============================================================
# @Project : YYC3-HaiLan-Pro
# @File    : check-secrets.sh
# @Author  : YYC³ Team
# @Desc    : 密钥硬编码扫描 · 防止凭证回归入库（CI/提交前门禁）
# ============================================================

set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT" || exit 2

SCAN_DIRS=(src utils public scripts supabase)
HIT=0
REPORT_HITS=()

report() {
  REPORT_HITS+=("$1")
  echo "  [命中] $1"
}

echo "=== YYC³ 密钥硬编码扫描 ==="
echo "--- 扫描目录: ${SCAN_DIRS[*]}"

# 规则 1：JWT 形态字符串（Supabase anon key / service_role key 等）
JWT_RE='eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}'
# 规则 2：私钥头
PEM_RE='BEGIN (RSA |EC |OPENSSH |PGP )?PRIVATE KEY'
# 规则 3：高危角色密钥字面量赋值
ROLE_RE='(service_role|serviceRole|SERVICE_ROLE)[^A-Za-z0-9]{1,4}["'"'"'][A-Za-z0-9_.-]{10,}'

for dir in "${SCAN_DIRS[@]}"; do
  [ -d "$dir" ] || continue
  while IFS= read -r line; do
    [ -z "$line" ] && continue
    report "$line"
  done < <(grep -rnE "$JWT_RE|$PEM_RE|$ROLE_RE" "$dir" 2>/dev/null | grep -v node_modules)
done

# 规则 4：Supabase project ref 硬编码
# 形态：小写字母数字混合、长度 20、且所在行含 supabase 语义（避免误报普通标识符）
PID_RE='[a-z]{20,}'
while IFS= read -r line; do
  [ -z "$line" ] && continue
  report "$line"
done < <(grep -rnE "$PID_RE" src utils 2>/dev/null \
  | grep -v node_modules \
  | grep -iE 'supabase|projectid|project_id|projectId' \
  | grep -vE '^\s*//' \
  | grep -vE '(description|title|@desc|brief|details|notes):')

# 规则 5：.env 类文件是否被 git 跟踪
TRACKED=$(git ls-files 2>/dev/null | grep -E '^\.env($|\.)' | grep -v '\.env\.example$' || true)
if [ -n "$TRACKED" ]; then
  report "环境文件已被 git 跟踪: $TRACKED"
fi

if [ "${#REPORT_HITS[@]}" -gt 0 ]; then
  echo "❌ 密钥扫描失败：发现 ${#REPORT_HITS[@]} 处疑似硬编码凭证，请整改后再提交。"
  exit 1
fi

echo "✅ 密钥扫描通过：未发现硬编码凭证。"
exit 0
