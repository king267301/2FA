#!/bin/bash

echo "🚀 开始部署谷歌2FA解码器..."

# 安装依赖
echo "📦 安装依赖..."
npm install

# 构建前端
echo "🔨 构建前端..."
npm run build:pages

# 部署到Cloudflare
echo "☁️ 部署到Cloudflare..."
npm run deploy

echo "✅ 部署完成！"
echo "🌐 您的应用现在应该可以在Cloudflare Pages上访问了" 