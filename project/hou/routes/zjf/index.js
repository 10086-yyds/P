var express = require('express');
var router = express.Router();
const bcrypt = require('bcryptjs');
const { userModel } = require('../../db/model');

// 密码强度检测函数
function checkPasswordStrength(password) {
  const length = password.length;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  let score = 0;
  let strength = 'weak';
  let suggestions = [];
  
  // 长度评分
  if (length >= 8) score += 1;
  else suggestions.push('密码长度至少8位');
  
  if (length >= 12) score += 1;
  
  // 字符类型评分
  if (hasUpperCase) score += 1;
  else suggestions.push('包含大写字母');
  
  if (hasLowerCase) score += 1;
  else suggestions.push('包含小写字母');
  
  if (hasNumbers) score += 1;
  else suggestions.push('包含数字');
  
  if (hasSpecialChar) score += 1;
  else suggestions.push('包含特殊字符');
  
  // 判断强度等级
  if (score >= 5) {
    strength = 'strong';
  } else if (score >= 3) {
    strength = 'medium';
  } else {
    strength = 'weak';
  }
  
  return {
    strength,
    score,
    suggestions,
    isValid: score >= 3 // 至少中等强度才允许使用
  };
}

// 检查密码是否过期
function isPasswordExpired(passwordSetAt, expirationDays = 90) {
  const now = new Date();
  const passwordAge = now - new Date(passwordSetAt);
  const maxAge = expirationDays * 24 * 60 * 60 * 1000; // 转换为毫秒
  return passwordAge > maxAge;
}

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/change-password', async(req, res, next) => {
  try {
    const { oldPassword, newPassword, phone } = req.body;
    console.log('密码修改请求:', { phone, hasOldPassword: !!oldPassword, hasNewPassword: !!newPassword });
   
    // 基础验证
    if (!oldPassword || !newPassword) {
      return res.error('旧密码和新密码都是必填的', 400);
    }
    
    if (!phone) {
      return res.error('手机号是必填的', 400);
    }
    
    // 1. 根据手机号查找用户
    const user = await userModel.findOne({ phone: phone });
    if (!user) {
      return res.error('用户不存在', 404);
    }
    
    // 2. 验证旧密码
    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPasswordValid) {
      return res.error('旧密码错误', 400);
    }
    
    // 3. 检查新密码强度
    const passwordCheck = checkPasswordStrength(newPassword);
    if (!passwordCheck.isValid) {
      return res.error(`密码强度不足，建议：${passwordCheck.suggestions.join('、')}`, 400);
    }
    
    // 4. 检查是否与旧密码相同
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.error('新密码不能与旧密码相同', 400);
    }
    
    // 5. 加密新密码
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
    
    // 6. 更新数据库中的密码和相关字段
    await userModel.findByIdAndUpdate(user._id, {
      password: hashedNewPassword,
      passwordStrength: passwordCheck.strength,
      passwordSetAt: new Date(),
      passwordExpired: false,
      updatedAt: new Date()
    });
    
    console.log('密码修改成功:', { 
      userId: user._id, 
      phone: phone, 
      strength: passwordCheck.strength 
    });
    
    res.success({
      statusCode: 200,
      passwordStrength: passwordCheck.strength,
      strengthScore: passwordCheck.score,
      suggestions: passwordCheck.suggestions
    }, '密码修改成功');
    
  } catch (error) {
    console.error('密码修改错误:', error);
    res.error('密码修改失败，请重试', 500);
  }
});


// 密码强度检测API
router.post('/check-password-strength', async(req, res, next) => {
  try {
    const { password } = req.body;
    
    if (!password) {
      return res.error('密码不能为空', 400);
    }
    
    const passwordCheck = checkPasswordStrength(password);
    
    res.success({
      strength: passwordCheck.strength,
      score: passwordCheck.score,
      suggestions: passwordCheck.suggestions,
      isValid: passwordCheck.isValid
    }, '密码强度检测成功');
    
  } catch (error) {
    console.error('密码强度检测错误:', error);
    res.error('密码强度检测失败', 500);
  }
});

// 检查用户密码是否过期
router.post('/check-password-expiry', async(req, res, next) => {
  try {
    const { phone } = req.body;
    
    if (!phone) {
      return res.error('手机号是必填的', 400);
    }
    
    const user = await userModel.findOne({ phone: phone });
    if (!user) {
      return res.error('用户不存在', 404);
    }
    
    const expired = isPasswordExpired(user.passwordSetAt);
    const passwordAge = Math.floor((new Date() - new Date(user.passwordSetAt)) / (1000 * 60 * 60 * 24));
    
    // 如果密码过期，更新用户状态
    if (expired && !user.passwordExpired) {
      await userModel.findByIdAndUpdate(user._id, {
        passwordExpired: true
      });
    }
    
    res.success({
      expired: expired,
      passwordAge: passwordAge,
      passwordSetAt: user.passwordSetAt,
      passwordStrength: user.passwordStrength,
      maxAge: 90 // 最大天数
    }, expired ? '密码已过期，请及时更新' : '密码未过期');
    
  } catch (error) {
    console.error('密码过期检查错误:', error);
    res.error('密码过期检查失败', 500);
  }
});

// 获取用户密码信息
router.post('/get-password-info', async(req, res, next) => {
  try {
    const { phone } = req.body;
    
    if (!phone) {
      return res.error('手机号是必填的', 400);
    }
    
    const user = await userModel.findOne({ phone: phone });
    if (!user) {
      return res.error('用户不存在', 404);
    }
    
    const expired = isPasswordExpired(user.passwordSetAt);
    const passwordAge = Math.floor((new Date() - new Date(user.passwordSetAt)) / (1000 * 60 * 60 * 24));
    const daysUntilExpiry = 90 - passwordAge;
    
    res.success({
      passwordStrength: user.passwordStrength || 'weak',
      passwordSetAt: user.passwordSetAt,
      passwordExpired: expired,
      passwordAge: passwordAge,
      daysUntilExpiry: daysUntilExpiry > 0 ? daysUntilExpiry : 0,
      needsUpdate: expired || daysUntilExpiry <= 7 // 过期或7天内过期都需要更新
    }, '获取密码信息成功');
    
  } catch (error) {
    console.error('获取密码信息错误:', error);
    res.error('获取密码信息失败', 500);
  }
});

router.get('/get-user-info', async(req, res, next) => {
  try {
    const { phone } = req.query;
    
    if (!phone) {
      return res.error('手机号是必填的', 400);
    }
    
    const user = await userModel.findOne({ phone: phone });
    if (!user) {
      return res.error('用户不存在', 404);
    }
    
    // 返回用户信息，但不包含密码等敏感信息
    const userInfo = {
      _id: user._id,
      name: user.username,
      phone: user.phone,
      email: user.email,
      gender: user.gender,
      department: user.department,
      role: user.role,
      passwordStrength: user.passwordStrength,
      passwordSetAt: user.passwordSetAt,
      passwordExpired: user.passwordExpired
    };
    
    res.success({
      userInfo,
      statusCode:200
    }, '获取用户信息成功');
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.error('获取用户信息失败', 500);
  }
});

router.post('/edit', async(req, res, next) => {
  try {
    const { phone, name } = req.body;
    console.log('修改用户信息请求:', { phone, name });
    
    // 验证必填字段
    if (!phone) {
      return res.error('手机号是必填的', 400);
    }
    
    if (!name || !name.trim()) {
      return res.error('用户名称是必填的', 400);
    }
    
    // 查找用户
    const user = await userModel.findOne({ phone: phone });
    if (!user) {
      return res.error('用户不存在', 404);
    }
    
    // 更新用户名称
    const updatedUser = await userModel.findByIdAndUpdate(
      user._id, 
      { 
        username: name.trim(),
        updatedAt: new Date()
      },
      { new: true } // 返回更新后的文档
    );
    
    console.log('用户信息修改成功:', { 
      userId: user._id, 
      phone: phone, 
      newName: name.trim() 
    });
    
    res.success({
      statusCode: 200,
      userInfo: {
        _id: updatedUser._id,
        name: updatedUser.username,
        phone: updatedUser.phone,
        email: updatedUser.email,
        gender: updatedUser.gender,
        department: updatedUser.department,
        role: updatedUser.role
      }
    }, '用户信息修改成功');
    
  } catch (error) {
    console.error('修改用户信息错误:', error);
    res.error('修改用户信息失败，请重试', 500);
  }
});


module.exports = router;
