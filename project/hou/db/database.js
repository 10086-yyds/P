const mongoose = require('mongoose');
const config = require('../config/config');

async function connect() {
  try {
    if (mongoose.connection.readyState === 1) {
      console.log('✅ 数据库已经连接');
      return;
    }
    
    const uri = config.database.uri;
    console.log(`🔗 正在连接到数据库: ${uri.replace(/\/\/.*:.*@/, '//***:***@')}`); // 隐藏密码
    
    // MongoDB Atlas 连接选项
    const options = {
      serverSelectionTimeoutMS: 30000, // 增加超时时间
      socketTimeoutMS: 45000,
      retryWrites: true,
      w: 'majority'
    };
    
    await mongoose.connect(uri, options);
    
    console.log('✅ 数据库连接成功');
    console.log(`📍 数据库: ${config.database.name}`);
    
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
    console.log('💡 请检查以下事项:');
    console.log('   1. MongoDB Atlas 集群是否正在运行');
    console.log('   2. 网络访问权限是否正确配置');
    console.log('   3. 用户名和密码是否正确');
    console.log('   4. 数据库名称是否正确');
    
    // 重新抛出错误，让调用者处理
    throw error;
  }
}

module.exports = { mongoose, connect };
