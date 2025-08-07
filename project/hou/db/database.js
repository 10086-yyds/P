const mongoose = require('mongoose');
const config = require('../config/config');

async function connect() {
  if (mongoose.connection.readyState === 1) {
    console.log('✅ 数据库已经连接');
    return;
  }
  const uri = config.database.uri;
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });
  console.log('✅ 数据库连接成功');
}

module.exports = { mongoose, connect };
