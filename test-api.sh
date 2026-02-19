#!/bin/bash

echo "🧪 测试 Crypto Tools Platform API"
echo "=================================="
echo ""

# 测试登录 API
echo "1️⃣ 测试登录 API..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"cardKey":"DEMO2024"}')

echo "响应: $LOGIN_RESPONSE"
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ 登录失败"
  exit 1
fi

echo "✅ 登录成功，Token: ${TOKEN:0:20}..."
echo ""

# 测试验证 API
echo "2️⃣ 测试 Token 验证..."
VERIFY_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/verify \
  -H "Authorization: Bearer $TOKEN")

echo "响应: $VERIFY_RESPONSE"

if echo "$VERIFY_RESPONSE" | grep -q '"valid":true'; then
  echo "✅ Token 验证成功"
else
  echo "❌ Token 验证失败"
  exit 1
fi

echo ""
echo "🎉 所有测试通过！"
