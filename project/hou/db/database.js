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
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      };

      // 连接到 MongoDB
      await mongoose.connect(uri, options);

      this.isConnected = true;
      console.log('✅ 数据库连接成功');

      // {{ AURA-X: Add - 连接后进行索引修复，移除 user.username 上的历史唯一索引以避免 E11000。 }}
      try {
        const admin = mongoose.connection.db.admin();
        const info = await admin.serverStatus();
        console.log('🧭 Mongo 版本:', info.version);

        const userCollection = mongoose.connection.collection('user');
        const indexes = await userCollection.indexes();
        // {{ AURA-X: Modify - 通用修复 username/email 的历史唯一索引。 }}
        const fieldsToFix = ['username', 'email'];
        for (const field of fieldsToFix) {
          const idx = indexes.find(i => (i.key && i.key[field] === 1));
          if (idx && idx.unique) {
            console.warn(`⚠️ 检测到 user.${field} 唯一索引，准备移除以兼容当前注册流程:`, idx.name);
            await userCollection.dropIndex(idx.name);
            // 视需要重建为非唯一、稀疏索引，避免 null/缺失字段冲突
            await userCollection.createIndex({ [field]: 1 }, { unique: false, sparse: true });
            console.log(`✅ 已移除并重建非唯一稀疏索引: user.${field}`);
          }
        }
      } catch (idxErr) {
        console.warn('索引检查/修复失败（可忽略）:', idxErr.message);
      }

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
  const uri = config.database.uri;
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });
  console.log('✅ 数据库连接成功');
}

module.exports = { mongoose, connect };
