# 谷歌2FA解码器

一个现代化的谷歌两步验证解码器，基于Cloudflare的全栈解决方案。

## 功能特性

- 🔐 **安全认证**: 基于账户密码的登录系统
- 🔑 **2FA密钥管理**: 支持添加、删除和管理2FA密钥
- ⏰ **多种验证方式**: 支持基于时间和基于计数器的验证
- 📱 **QR码生成**: 自动生成QR码供移动应用扫描
- 🌙 **暗黑模式**: 支持明暗主题切换
- 📱 **响应式设计**: 完美适配桌面和移动设备
- 🚀 **高性能**: 基于Cloudflare Workers的快速响应

## 技术栈

### 前端
- **React 18** - 现代化的用户界面
- **TypeScript** - 类型安全
- **Tailwind CSS** - 实用优先的CSS框架
- **Lucide React** - 精美的图标库
- **React Router** - 客户端路由

### 后端
- **Cloudflare Workers** - 边缘计算平台
- **Cloudflare KV** - 键值存储
- **itty-router** - 轻量级路由

## 快速开始

### 🚀 一键部署（推荐）

[![Deploy to Cloudflare](https://img.shields.io/badge/Deploy%20to%20Cloudflare-FF6B6B?style=for-the-badge&logo=cloudflare&logoColor=white)](https://github.com/your-username/google-2fa-decoder)

点击上面的按钮，按照提示配置即可自动部署！

### 📋 手动部署

#### 1. 安装依赖

```bash
npm install
```

#### 2. 配置Cloudflare

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 创建两个KV命名空间：
   - `USERS` - 存储用户信息
   - `KEYS` - 存储2FA密钥

3. 更新 `wrangler.toml` 中的KV ID：

```toml
[[kv_namespaces]]
binding = "USERS"
id = "your-users-kv-id"
preview_id = "your-users-kv-preview-id"

[[kv_namespaces]]
binding = "KEYS"
id = "your-keys-kv-id"
preview_id = "your-keys-kv-preview-id"
```

#### 3. 本地开发

```bash
# 启动开发服务器
npm run dev
```

#### 4. 部署

```bash
# 构建并部署到Cloudflare
npm run deploy
```

### 🔄 GitHub Actions 自动部署

详细配置请查看 [DEPLOYMENT.md](./DEPLOYMENT.md)

## 默认账户

- **用户名**: `admin`
- **密码**: `your-new-password`

## API接口

### 认证

- `POST /api/auth/login` - 用户登录

### 密钥管理

- `GET /api/keys` - 获取所有密钥
- `POST /api/keys` - 添加新密钥
- `DELETE /api/keys/:id` - 删除密钥
- `GET /api/keys/:id/generate` - 生成验证码

### QR码

- `POST /api/qr` - 生成QR码

## 项目结构

```
├── src/
│   ├── components/          # React组件
│   │   ├── Login.tsx       # 登录页面
│   │   ├── Dashboard.tsx   # 主仪表板
│   │   ├── AddKeyModal.tsx # 添加密钥模态框
│   │   └── QRCodeModal.tsx # QR码模态框
│   ├── contexts/           # React上下文
│   │   ├── AuthContext.tsx # 认证上下文
│   │   └── ThemeContext.tsx # 主题上下文
│   ├── worker/             # Cloudflare Workers
│   │   ├── index.ts        # 主入口
│   │   ├── handlers/       # 请求处理器
│   │   ├── middleware/     # 中间件
│   │   └── utils/          # 工具函数
│   ├── App.tsx             # 主应用组件
│   ├── main.tsx            # 应用入口
│   └── index.css           # 全局样式
├── package.json
├── wrangler.toml           # Cloudflare配置
├── vite.config.ts          # Vite配置
└── tailwind.config.js      # Tailwind配置
```

## 安全说明

- 所有密钥都存储在Cloudflare KV中，使用用户隔离
- 支持基于JWT的认证机制
- 密码在传输和存储时都经过加密处理
- 支持token轮换和过期机制

## 许可证

MIT License

## 贡献

欢迎提交Issue和Pull Request！

## 支持

如果您遇到任何问题，请创建Issue或联系开发者。 "# 2FA" 
