const mongoose = require('mongoose');
const config = require('../config/config');

// 数据库连接类
class Database {
  constructor() {
    this.isConnected = false;
  }

  // 连接到数据库
  async connect() {
    try {
      if (this.isConnected) {
        console.log('✅ 数据库已经连接');
        return;
      }

      const dbConfig = config.database;
      const uri = dbConfig.uri;

      console.log(`🔗 正在连接到数据库...`);
      console.log(`📍 环境: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🗄️  数据库: ${dbConfig.name}`);

      // 连接选项
      const options = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      };

      // 连接到 MongoDB
      await mongoose.connect(uri, options);

      this.isConnected = true;
      console.log('✅ 数据库连接成功');

      // 监听连接事件
      mongoose.connection.on('error', (err) => {
        console.error('❌ 数据库连接错误:', err);
        this.isConnected = false;
      });

      mongoose.connection.on('disconnected', () => {
        console.log('⚠️  数据库连接断开');
        this.isConnected = false;
      });

      mongoose.connection.on('reconnected', () => {
        console.log('🔄 数据库重新连接');
        this.isConnected = true;
      });

    } catch (error) {
      console.error('❌ 数据库连接失败:', error.message);
      throw error;
    }
  }

  // 断开数据库连接
  async disconnect() {
    try {
      if (this.isConnected) {
        await mongoose.disconnect();
        this.isConnected = false;
        console.log('🔌 数据库连接已断开');
      }
    } catch (error) {
      console.error('❌ 断开数据库连接失败:', error.message);
      throw error;
    }
  }

  // 获取连接状态
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      readyState: mongoose.connection.readyState
    };
  }
}

// 创建单例实例
const database = new Database();

module.exports = database;
