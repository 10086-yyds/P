# 🔧 GitHub OAuth 配置说明

## 📋 您的GitHub OAuth凭证

✅ **Client ID**: `Ov23liRss5VUaecAUaNU`  
✅ **Client Secret**: `2d50a5cb2108239d40adfe084214e599c1f7c30c`  
✅ **回调URL**: `http://localhost:3000/wxy/auth/github/callback`

## 🚀 快速配置步骤

### 1. 创建环境变量文件

在 `hou` 目录下创建 `.env` 文件：

```bash
cd hou
touch .env
```

### 2. 添加配置内容

将以下内容复制到 `.env` 文件中：

```env
# GitHub OAuth 配置
GITHUB_CLIENT_ID=Ov23liRss5VUaecAUaNU
GITHUB_CLIENT_SECRET=2d50a5cb2108239d40adfe084214e599c1f7c30c
GITHUB_REDIRECT_URI=http://localhost:3000/wxy/auth/github/callback

# JWT 密钥 (建议生产环境使用更安全的密钥)
JWT_SECRET=your-super-secret-jwt-key-2024-github-oauth

# 数据库和应用配置
NODE_ENV=development
PORT=3000
```

### 3. 验证配置

启动后端服务：

```bash
cd hou
npm run dev
```

查看控制台输出，应该能看到：
```
🔍 [GitHub OAuth] 配置检查: {
  GITHUB_CLIENT_ID: 'Ov23liRs...',
  GITHUB_CLIENT_SECRET: '2d50a5cb...',
  GITHUB_REDIRECT_URI: 'http://localhost:3000/wxy/auth/github/callback'
}
```

## 🧪 测试GitHub登录

1. **启动服务**：
   ```bash
   # 后端
   cd hou && npm run dev
   
   # 前端 (新终端窗口)
   cd process && npm run dev
   ```

2. **测试登录**：
   - 访问登录页面
   - 点击 "GitHub登录" 按钮
   - 在弹出窗口中完成GitHub授权
   - 验证登录成功并跳转到首页

## 🔐 安全提醒

⚠️ **重要**: 
- `.env` 文件包含敏感信息，不应提交到版本控制系统
- 已自动添加到 `.gitignore` 中
- 生产环境请使用更安全的密钥

## 🏗️ GitHub OAuth应用设置

如果需要修改GitHub应用设置，请访问：
[GitHub Developer Settings](https://github.com/settings/applications/2394847)

确保以下设置正确：
- **Authorization callback URL**: `http://localhost:3000/wxy/auth/github/callback`
- **Homepage URL**: `http://localhost:3000`

## 🚨 故障排除

### 问题1: "Application not found" 错误
- 检查 `GITHUB_CLIENT_ID` 是否正确
- 确认GitHub OAuth应用状态为活跃

### 问题2: "unauthorized_client" 错误
- 检查 `GITHUB_REDIRECT_URI` 是否与GitHub应用配置一致
- 确认回调URL完全匹配（包括协议和端口）

### 问题3: 无法获取用户信息
- 检查 `GITHUB_CLIENT_SECRET` 是否正确
- 确认网络连接正常

### 问题4: 前端登录按钮无响应
- 检查前端是否正确启动
- 查看浏览器控制台是否有错误信息
- 确认后端API接口正常响应

## 📞 支持

如果遇到其他问题，请检查：
1. 环境变量是否正确加载
2. 后端控制台的详细日志
3. 浏览器网络面板的请求状态
4. GitHub API的响应内容

---

配置完成后，您的GitHub第三方登录功能就可以正常使用了！🎉 