# GitHub OAuth 集成设置指南

## 🚀 快速开始

本项目已成功集成GitHub第三方登录功能，用户可以使用GitHub账号快速登录系统。

## 📋 功能特性

- ✅ **安全的OAuth 2.0流程**：使用标准OAuth 2.0授权码模式
- ✅ **CSRF防护**：使用state参数防止跨站请求伪造攻击
- ✅ **多平台支持**：支持H5、APP等多个平台
- ✅ **用户信息同步**：自动获取GitHub用户信息并创建/更新本地用户
- ✅ **混合登录**：支持GitHub登录与手机号登录并存
- ✅ **优雅的UI**：精美的登录成功页面和错误处理

## ⚙️ 配置步骤

### 1. 创建GitHub OAuth应用

1. 登录到GitHub，访问 [Developer settings](https://github.com/settings/developers)
2. 点击 "New OAuth App" 创建新应用
3. 填写应用信息：
   - **Application name**: 您的应用名称
   - **Homepage URL**: `http://localhost:3000` (开发环境)
   - **Authorization callback URL**: `http://localhost:3000/wxy/auth/github/callback`
4. 点击 "Register application" 完成创建
5. 记录下 **Client ID** 和 **Client Secret**

### 2. 配置环境变量

在后端项目根目录创建 `.env` 文件：

```env
# GitHub OAuth 配置
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here  
GITHUB_REDIRECT_URI=http://localhost:3000/wxy/auth/github/callback

# JWT 密钥 (建议生产环境使用更安全的密钥)
JWT_SECRET=your-super-secret-jwt-key-here

# 其他配置
NODE_ENV=development
PORT=3000
```

### 3. 生产环境配置

生产环境需要修改以下配置：

```env
# 生产环境GitHub OAuth配置
GITHUB_CLIENT_ID=your_production_client_id
GITHUB_CLIENT_SECRET=your_production_client_secret
GITHUB_REDIRECT_URI=https://yourdomain.com/wxy/auth/github/callback

# 生产环境JWT密钥
JWT_SECRET=your-very-secure-production-jwt-secret
```

## 🏗️ 技术架构

### 后端接口

1. **GET /wxy/auth/github/url** - 获取GitHub授权URL
2. **GET /wxy/auth/github/callback** - 处理GitHub OAuth回调
3. **GET /wxy/auth/github/user** - 获取GitHub用户信息

### 前端集成

- 支持H5浏览器环境的弹窗登录
- 支持APP环境的系统浏览器登录
- 自动处理登录成功后的token存储和页面跳转

### 数据库模型

用户模型包含以下GitHub相关字段：
- `githubId`: GitHub用户ID
- `githubLogin`: GitHub用户名
- `githubName`: GitHub显示名称
- `loginType`: 登录类型（phone/github/mixed）

## 🔐 安全特性

1. **State参数验证**：防止CSRF攻击
2. **Token安全存储**：JWT token安全生成和验证
3. **用户信息保护**：敏感信息不暴露给前端
4. **错误处理**：完善的错误处理和用户提示

## 🎨 用户体验

- **流畅的登录流程**：一键跳转到GitHub授权页面
- **实时状态反馈**：加载动画和进度提示
- **美观的成功页面**：显示用户头像和基本信息
- **智能跳转**：登录成功后自动跳转到应用主页

## 🧪 测试指南

1. 启动后端服务：`npm run dev`
2. 启动前端应用
3. 访问登录页面，点击"GitHub登录"按钮
4. 在弹出的窗口中完成GitHub授权
5. 验证登录成功并正确跳转

## 🚨 常见问题

### Q: GitHub授权页面显示"Application not found"
A: 检查GITHUB_CLIENT_ID是否正确配置

### Q: 回调时显示"unauthorized_client"错误  
A: 检查GITHUB_REDIRECT_URI是否与GitHub应用配置一致

### Q: 无法获取用户邮箱
A: 确保OAuth scope包含"user:email"权限

### Q: 前端无法接收到登录成功消息
A: 检查浏览器是否阻止了弹窗或跨域通信

## 📞 技术支持

如果在集成过程中遇到问题，请检查：
1. GitHub OAuth应用配置是否正确
2. 环境变量是否正确设置
3. 网络连接是否正常
4. 浏览器控制台是否有错误信息

## 🔄 更新日志

- **v1.0.0** - 初始版本，支持基本的GitHub OAuth登录
- **v1.1.0** - 增加安全性增强和错误处理优化
- **v1.2.0** - 支持混合登录模式和用户信息同步 