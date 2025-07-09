# 🚀 GitHub Actions 自动部署指南

## 概述

本项目支持两种自动部署方式：
1. **自动创建KV命名空间** - GitHub Actions自动创建所需的KV存储
2. **手动绑定KV命名空间** - 使用您在Cloudflare后台手动创建的KV

## 方式一：自动创建KV命名空间（推荐）

### 步骤1：获取Cloudflare API Token

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 进入 **My Profile** → **API Tokens**
3. 点击 **Create Token**
4. 选择 **Custom token** 模板
5. 配置权限：
   - **Account Resources**: All accounts
   - **Zone Resources**: All zones
   - **Permissions**:
     - Account: Workers Scripts (Edit)
     - Account: Workers KV Storage (Edit)
     - Account: Workers Routes (Edit)
     - Zone: Workers Routes (Edit)
6. 点击 **Continue to summary** → **Create Token**
7. 复制生成的API Token

### 步骤2：配置GitHub Secrets

在您的GitHub仓库中：

1. 进入 **Settings** → **Secrets and variables** → **Actions**
2. 点击 **New repository secret**
3. 添加以下Secret：
   - **Name**: `CLOUDFLARE_API_TOKEN`
   - **Value**: 您刚才复制的API Token

### 步骤3：配置GitHub Variables

1. 在 **Settings** → **Secrets and variables** → **Actions** 中
2. 切换到 **Variables** 标签
3. 点击 **New repository variable**
4. 添加以下变量：
   - **Name**: `AUTO_CREATE_KV`
   - **Value**: `true`
   - **Name**: `CLOUDFLARE_PROJECT_NAME`
   - **Value**: 您想要的项目名称（如：`my-2fa-app`）

### 步骤4：推送代码触发部署

```bash
git add .
git commit -m "Add GitHub Actions deployment"
git push origin main
```

## 方式二：手动绑定KV命名空间

### 步骤1：手动创建KV命名空间

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 进入 **Workers & Pages** → **KV**
3. 创建两个KV命名空间：
   - `USERS` - 存储用户信息
   - `KEYS` - 存储2FA密钥
4. 记录每个命名空间的ID

### 步骤2：配置GitHub Secrets

添加以下Secrets：

- `CLOUDFLARE_API_TOKEN` - Cloudflare API Token
- `USERS_KV_ID` - USERS KV命名空间ID
- `USERS_KV_PREVIEW_ID` - USERS预览KV命名空间ID
- `KEYS_KV_ID` - KEYS KV命名空间ID
- `KEYS_KV_PREVIEW_ID` - KEYS预览KV命名空间ID

### 步骤3：使用手动KV部署工作流

将 `.github/workflows/deploy.yml` 重命名为 `.github/workflows/deploy-auto.yml`，然后将 `deploy-manual-kv.yml` 重命名为 `deploy.yml`。

## 部署流程

### 自动触发
- 推送到 `main` 或 `master` 分支时自动部署
- 创建Pull Request时进行预览部署

### 手动触发
1. 进入GitHub仓库的 **Actions** 标签
2. 选择 **Deploy to Cloudflare** 工作流
3. 点击 **Run workflow**
4. 选择分支并点击 **Run workflow**

## 部署状态检查

### 查看部署日志
1. 进入GitHub仓库的 **Actions** 标签
2. 点击最新的部署运行
3. 查看详细日志

### 查看Cloudflare部署
1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 进入 **Workers & Pages**
3. 查看您的项目部署状态

## 故障排除

### 常见问题

1. **API Token权限不足**
   - 确保API Token有足够的权限
   - 检查Token是否过期

2. **KV命名空间创建失败**
   - 检查账户是否有KV配额
   - 确保项目名称唯一

3. **构建失败**
   - 检查代码是否有语法错误
   - 查看构建日志中的具体错误

4. **部署失败**
   - 检查wrangler.toml配置
   - 确保所有必要的Secrets已配置

### 调试步骤

1. 查看GitHub Actions日志
2. 检查Cloudflare Dashboard中的错误信息
3. 验证所有环境变量和Secrets配置正确
4. 尝试本地构建测试

## 自定义配置

### 修改项目名称
在GitHub Variables中修改 `CLOUDFLARE_PROJECT_NAME` 的值。

### 修改部署分支
编辑 `.github/workflows/deploy.yml` 中的 `branches` 配置。

### 添加环境变量
在wrangler.toml中添加环境变量，或在GitHub Secrets中配置。

## 安全注意事项

1. **API Token安全**
   - 不要将API Token提交到代码仓库
   - 定期轮换API Token
   - 使用最小权限原则

2. **KV数据安全**
   - KV数据按用户隔离
   - 定期备份重要数据
   - 监控KV使用量

3. **访问控制**
   - 限制GitHub Actions的权限
   - 定期审查部署日志
   - 使用分支保护规则

## 监控和维护

### 监控指标
- 部署成功率
- 构建时间
- KV存储使用量
- 应用响应时间

### 维护任务
- 定期更新依赖
- 清理旧的部署版本
- 监控API使用量
- 备份重要数据 