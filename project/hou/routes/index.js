var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// API健康检查接口
router.get('/api/health', function(req, res, next) {
  res.success({
    status: 'ok',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  }, '服务运行正常');
});

// API信息接口
router.get('/api/info', function(req, res, next) {
  res.success({
    name: 'hou',
    version: '0.0.0',
    description: '工程小程序后端API',
    environment: process.env.NODE_ENV || 'development'
  }, '获取API信息成功');
});

module.exports = router;
