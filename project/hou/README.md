# Hou 项目

一个支持多环境配置的 Express.js 应用，集成 MongoDB Atlas 数据库。

## 环境配置

项目支持三种环境：
- **开发环境 (development)** - 用于本地开发
- **生产环境 (production)** - 用于生产部署
- **测试环境 (test)** - 用于测试

## 数据库配置

项目使用 MongoDB Atlas 云数据库：
- **开发环境**: `bookkeeping_dev` 数据库
- **生产环境**: `bookkeeping` 数据库  
- **测试环境**: `bookkeeping_test` 数据库

## 安装依赖

```bash
npm install
```

## 运行项目

### 开发环境
```bash
npm run dev
```
- 使用 nodemon 自动重启
- 详细调试日志
- 端口 3000
- 连接 `bookkeeping_dev` 数据库

### 生产环境
```bash
npm start
```
- 生产优化配置
- 安全头设置
- 错误处理优化
- 连接 `bookkeeping` 数据库

### 测试环境
```bash
npm test
```
- 端口 3001
- 最小日志输出
- 连接 `bookkeeping_test` 数据库

### 调试模式
```bash
npm run debug
```
- 开启 Node.js 调试器
- 开发环境配置

## 环境变量

复制 `env.example` 为 `.env` 并配置：

```bash
# 环境配置
NODE_ENV=development

# 服务器配置
PORT=3000

# MongoDB Atlas 配置
MONGODB_URI=mongodb+srv://2732849023:kV2y2TU4cYPq6Y9C@cluster0.plvxg2d.mongodb.net/bookkeeping

# 数据库配置 (生产环境备用)
DB_HOST=localhost
DB_PORT=27017
DB_NAME=bookkeeping
DB_USERNAME=your_username
DB_PASSWORD=your_password

# 安全配置 (生产环境)
SESSION_SECRET=your-super-secret-session-key
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

## 配置说明

### 开发环境特性
- 详细的控制台日志
- 自动重启服务
- 调试信息输出
- 宽松的安全设置
- 连接开发数据库

### 生产环境特性
- 优化的日志级别
- 安全头设置
- 环境变量配置
- 错误信息保护
- 连接生产数据库

### 测试环境特性
- 独立的端口配置
- 最小日志输出
- 测试数据库配置
- 连接测试数据库

## 数据库模型

项目包含以下数据模型：
- **User**: 用户信息
- **Transaction**: 记账交易记录

## 项目结构

```
hou/
├── config/
│   └── config.js          # 环境配置文件
├── db/
│   ├── database.js        # 数据库连接模块
│   └── model.js          # 数据模型
├── bin/
│   └── www               # 服务器启动文件
├── routes/               # 路由文件
├── views/                # 视图模板
├── public/               # 静态文件
├── app.js               # 应用主文件
├── package.json         # 项目配置
└── env.example          # 环境变量示例
```

## 数据库连接状态

应用启动时会自动连接数据库，并在控制台显示连接状态：
- ✅ 数据库连接成功
- ❌ 数据库连接失败
- ⚠️ 数据库连接断开
- 🔄 数据库重新连接 