var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.success([], '获取用户列表成功');
});

/* 示例：用户详情接口 */
router.get('/:id', function(req, res, next) {
  const userId = req.params.id;
  if (!userId) {
    return res.error('用户ID不能为空', 400);
  }
  
  // 模拟用户数据
  res.success({
    id: userId,
    username: 'demo_user',
    email: 'demo@example.com',
    createdAt: new Date().toISOString()
  }, '获取用户详情成功');
});

module.exports = router;
