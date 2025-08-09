const path = require('path');

// 加载环境变量
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// 获取当前环境
const env = process.env.NODE_ENV || 'development';

// 基础配置
const baseConfig = {
  // 应用配置
  app: {
    name: 'hou',
    version: '0.0.0'
  },

  // 服务器配置
  server: {
    host: 'localhost',
    port: process.env.PORT || 3000
  },

  // 数据库配置
  database: {
    // MongoDB Atlas 连接字符串 - 从环境变量读取
    uri: process.env.MONGODB_URI || 'mongodb+srv://2732849023:kV2y2TU4cYPq6Y9C@cluster0.plvxg2d.mongodb.net/bookkeeping_dev',
    // 本地 MongoDB 配置（备用）
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 27017,
    name: process.env.DB_NAME || 'bookkeeping_dev'
  },

  // 日志配置
  logging: {
    level: 'info',
    format: 'combined'
  },

  // 安全配置
  security: {
    sessionSecret: process.env.SESSION_SECRET || 'development-only-secret',
    cors: {
      origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
      credentials: true
    }
  }
};

// 开发环境配置
const development = {
  ...baseConfig,
  server: {
    ...baseConfig.server,
    port: 3000
  },
  database: {
    ...baseConfig.database,
    // 开发环境使用环境变量或 MongoDB Atlas
    uri: process.env.MONGODB_URI || 'mongodb+srv://2732849023:kV2y2TU4cYPq6Y9C@cluster0.plvxg2d.mongodb.net/bookkeeping_dev',
    name: process.env.DB_NAME || 'bookkeeping_dev'
  },
  logging: {
    level: 'debug',
    format: 'dev'
  },
  security: {
    ...baseConfig.security,
    sessionSecret: process.env.SESSION_SECRET || 'dev-secret-key',
    cors: {
      origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
      credentials: true
    }
  }
};

// 生产环境配置
const production = {
  ...baseConfig,
  server: {
    ...baseConfig.server,
    host: '0.0.0.0'
  },
  database: {
    ...baseConfig.database,
    // 生产环境使用环境变量
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/hou_prod',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 27017,
    name: process.env.DB_NAME || 'hou_prod',
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD
  },
  logging: {
    level: 'warn',
    format: 'combined'
  },
  security: {
    ...baseConfig.security,
    sessionSecret: process.env.SESSION_SECRET || 'prod-secret-key',
    cors: {
      origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['https://yourdomain.com'],
      credentials: true
    }
  }
};

// 测试环境配置
const test = {
  ...baseConfig,
  server: {
    ...baseConfig.server,
    port: 3001
  },
  database: {
    ...baseConfig.database,
    // 测试环境使用环境变量或本地测试数据库
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/hou_test',
    name: process.env.DB_NAME || 'hou_test'
  },
  logging: {
    level: 'error',
    format: 'dev'
  }
};

// 配置映射
const configs = {
  development,
  production,
  test
};

// 导出当前环境的配置
module.exports = configs[env] || development; 