var express = require('express');
var router = express.Router();
var multiparty = require('multiparty');
var {UserModel, PermissionModel, MenuPermissionModel, MenuModel} = require('../../db/model.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const smsService = require('../utils/smsService');

// JWT密钥
const JWT_SECRET = 'your-secret-key';

// 生成随机验证码
function generateVerifyCode() {
    // 生成4位随机验证码
    return Math.floor(1000 + Math.random() * 9000).toString();
}

// 发送验证码
router.post('/auth/send-code', async (req, res) => {
    try {
        const { phone } = req.body;
        
        // 验证手机号格式
        if (!/^1[3-9]\d{9}$/.test(phone)) {
            return res.status(400).json({ message: '手机号格式不正确' });
        }

        // 检查是否频繁发送
        const user = await UserModel.findOne({ phone });
        
        // 检查手机号是否已注册
        if (user && user.password) {
            return res.status(400).json({ message: '该手机号已注册' });
        }
        
        if (user && user.verifyCode && user.verifyCode.expireAt) {
            const lastSendTime = new Date(user.verifyCode.expireAt).getTime() - 5 * 60 * 1000;
            const now = Date.now();
            if (now - lastSendTime < 60 * 1000) { // 1分钟内不能重复发送
                return res.status(400).json({ 
                    message: '发送太频繁，请稍后再试',
                    waitTime: Math.ceil((60 * 1000 - (now - lastSendTime)) / 1000)
                });
            }
        }

        // 生成4位验证码
        const verifyCode = generateVerifyCode();
        
        // 设置验证码有效期（5分钟）
        const expireAt = new Date(Date.now() + 5 * 60 * 1000);

        // 调用短信服务发送验证码
        const result = await smsService.sendSms(phone, verifyCode);
        
        if (result.success) {
            // {{ AURA-X: Add - 添加验证码保存调试日志. }}
            console.log('🔍 [验证码保存] 准备保存验证码:', {
                phone,
                verifyCode,
                expireAt: expireAt.toISOString()
            });

            // 保存验证码到数据库
            const updateResult = await UserModel.findOneAndUpdate(
                { phone },
                { 
                    verifyCode: {
                        code: verifyCode,
                        expireAt
                    }
                },
                { upsert: true, new: true }
            );

            console.log('✅ [验证码保存] 保存成功:', {
                userId: updateResult._id,
                phone: updateResult.phone,
                savedVerifyCode: updateResult.verifyCode
            });

            res.json({ 
                code: 200,
                message: '验证码发送成功'
            });
        } else {
            throw new Error(result.message || '短信发送失败');
        }
    } catch (error) {
        console.error('发送验证码错误:', error);
        res.status(500).json({ message: error.message || '发送验证码失败' });
    }
});

// 用户注册
router.post('/auth/register', async (req, res) => {
    try {
        const { phone, password, verifyCode } = req.body;

        // 验证手机号格式
        if (!/^1[3-9]\d{9}$/.test(phone)) {
            return res.status(400).json({ message: '手机号格式不正确' });
        }

        // 验证密码长度
        if (password.length < 6 || password.length > 20) {
            return res.status(400).json({ message: '密码长度应在6-20位之间' });
        }

        // {{ AURA-X: Add - 添加查询调试日志. }}
        console.log('🔍 [验证码验证] 开始验证，手机号:', phone);
        
        // 查找用户验证码信息
        const user = await UserModel.findOne({ phone });
        
        // {{ AURA-X: Add - 添加调试日志查看验证码验证过程. }}
        console.log('🔍 [验证码验证] 查询结果:', {
            userFound: !!user,
            userId: user?._id,
            userPhone: user?.phone,
            hasVerifyCode: !!(user?.verifyCode),
            verifyCodeObject: user?.verifyCode,
            inputVerifyCode: verifyCode,
            inputType: typeof verifyCode
        });
        
        // 验证验证码 - 确保类型一致性
        const inputCode = String(verifyCode).trim();
        const storedCode = String(user?.verifyCode?.code || '').trim();
        
        if (!user || !user.verifyCode || storedCode !== inputCode) {
            console.log('❌ [验证码验证] 验证失败:', {
                userExists: !!user,
                verifyCodeExists: !!(user?.verifyCode),
                codeMatch: storedCode === inputCode,
                inputCode: inputCode,
                storedCode: storedCode,
                inputType: typeof verifyCode,
                storedType: typeof user?.verifyCode?.code
            });
            return res.status(400).json({ message: '验证码错误' });
        }

        // 验证验证码是否过期
        const now = new Date();
        const expireAt = new Date(user.verifyCode.expireAt);
        if (now > expireAt) {
            console.log('❌ [验证码验证] 验证码已过期:', {
                currentTime: now.toISOString(),
                expireTime: expireAt.toISOString(),
                isExpired: now > expireAt
            });
            return res.status(400).json({ message: '验证码已过期' });
        }

        console.log('✅ [验证码验证] 验证码验证成功!');

        // 检查手机号是否已注册
        if (user.password) {
            return res.status(400).json({ message: '该手机号已注册' });
        }

        // 加密密码
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 更新用户信息
        await UserModel.findOneAndUpdate(
            { phone },
            { 
                password: hashedPassword,
                verifyCode: null, // 清除验证码
                status: 'active'
            }
        );

        res.json({ 
            code: 200,
            message: '注册成功' 
        });
    } catch (error) {
        console.error('注册错误:', error);
        res.status(500).json({ message: '注册失败' });
    }
});

// 用户登录
router.post('/auth/login', async (req, res) => {
    try {
        const { phone, password } = req.body;

        // 查找用户
        const user = await UserModel.findOne({ phone });
        
        // 验证用户是否存在
        if (!user || !user.password) {
            return res.status(400).json({ message: '用户不存在' });
        }

        // 验证用户状态
        if (user.status !== 'active') {
            return res.status(400).json({ message: '账号已被禁用' });
        }

        // 验证密码
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: '密码错误' });
        }

        // 生成 JWT token
        const token = jwt.sign(
            { userId: user._id, phone: user.phone },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        // 更新最后登录时间
        await UserModel.findByIdAndUpdate(user._id, {
            lastLoginAt: new Date()
        });

        res.json({
            code: 200,
            message: '登录成功',
            data: { token }
        });
    } catch (error) {
        console.error('登录错误:', error);
        res.status(500).json({ message: '登录失败' });
    }
});

// 发送短信登录验证码
router.post('/auth/send-login-code', async (req, res) => {
    try {
        const { phone } = req.body;
        
        // 验证手机号格式
        if (!/^1[3-9]\d{9}$/.test(phone)) {
            return res.status(400).json({ message: '手机号格式不正确' });
        }

        // 检查用户是否存在
        const user = await UserModel.findOne({ phone });
        
        // 如果用户不存在或没有密码，说明未注册
        if (!user || !user.password) {
            return res.status(400).json({ message: '该手机号未注册，请先注册' });
        }
        
        // 检查是否频繁发送
        if (user && user.verifyCode && user.verifyCode.expireAt) {
            const lastSendTime = new Date(user.verifyCode.expireAt).getTime() - 5 * 60 * 1000;
            const now = Date.now();
            if (now - lastSendTime < 60 * 1000) { // 1分钟内不能重复发送
                return res.status(400).json({ 
                    message: '发送太频繁，请稍后再试',
                    waitTime: Math.ceil((60 * 1000 - (now - lastSendTime)) / 1000)
                });
            }
        }

        // 生成4位验证码
        const verifyCode = generateVerifyCode();
        
        // 设置验证码有效期（5分钟）
        const expireAt = new Date(Date.now() + 5 * 60 * 1000);

        // {{ AURA-X: Add - 添加短信登录验证码保存调试日志. }}
        console.log('🔍 [短信登录验证码] 准备保存验证码:', {
            phone,
            verifyCode,
            expireAt: expireAt.toISOString()
        });

        // 调用短信服务发送验证码
        const result = await smsService.sendSms(phone, verifyCode);
        
        if (result.success) {
            // 保存验证码到数据库
            const updateResult = await UserModel.findOneAndUpdate(
                { phone },
                { 
                    verifyCode: {
                        code: verifyCode,
                        expireAt
                    }
                },
                { new: true }
            );

            console.log('✅ [短信登录验证码] 保存成功:', {
                userId: updateResult._id,
                phone: updateResult.phone,
                savedVerifyCode: updateResult.verifyCode
            });

            res.json({ 
                code: 200,
                message: '验证码发送成功'
            });
        } else {
            throw new Error(result.message || '短信发送失败');
        }
    } catch (error) {
        console.error('发送短信登录验证码错误:', error);
        res.status(500).json({ message: error.message || '发送验证码失败' });
    }
});

// 短信验证码登录
router.post('/auth/sms-login', async (req, res) => {
    try {
        const { phone, verifyCode } = req.body;

        // 验证手机号格式
        if (!/^1[3-9]\d{9}$/.test(phone)) {
            return res.status(400).json({ message: '手机号格式不正确' });
        }

        // {{ AURA-X: Add - 添加短信登录验证调试日志. }}
        console.log('🔍 [短信登录验证] 开始验证，手机号:', phone);
        
        // 查找用户验证码信息
        const user = await UserModel.findOne({ phone });
        
        // {{ AURA-X: Add - 添加调试日志查看短信登录验证过程. }}
        console.log('🔍 [短信登录验证] 查询结果:', {
            userFound: !!user,
            userId: user?._id,
            userPhone: user?.phone,
            hasPassword: !!(user?.password),
            hasVerifyCode: !!(user?.verifyCode),
            verifyCodeObject: user?.verifyCode,
            inputVerifyCode: verifyCode,
            inputType: typeof verifyCode
        });

        // 验证用户是否存在且已注册
        if (!user || !user.password) {
            return res.status(400).json({ message: '该手机号未注册' });
        }

        // 验证用户状态
        if (user.status !== 'active') {
            return res.status(400).json({ message: '账号已被禁用' });
        }

        // 验证验证码 - 确保类型一致性
        const inputCode = String(verifyCode).trim();
        const storedCode = String(user?.verifyCode?.code || '').trim();
        
        if (!user.verifyCode || storedCode !== inputCode) {
            console.log('❌ [短信登录验证] 验证码验证失败:', {
                verifyCodeExists: !!(user?.verifyCode),
                codeMatch: storedCode === inputCode,
                inputCode: inputCode,
                storedCode: storedCode,
                inputType: typeof verifyCode,
                storedType: typeof user?.verifyCode?.code
            });
            return res.status(400).json({ message: '验证码错误' });
        }

        // 验证验证码是否过期
        const now = new Date();
        const expireAt = new Date(user.verifyCode.expireAt);
        if (now > expireAt) {
            console.log('❌ [短信登录验证] 验证码已过期:', {
                currentTime: now.toISOString(),
                expireTime: expireAt.toISOString(),
                isExpired: now > expireAt
            });
            return res.status(400).json({ message: '验证码已过期' });
        }

        console.log('✅ [短信登录验证] 验证码验证成功!');

        // 生成 JWT token
        const token = jwt.sign(
            { userId: user._id, phone: user.phone },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        // 更新最后登录时间并清除验证码
        await UserModel.findByIdAndUpdate(user._id, {
            lastLoginAt: new Date(),
            verifyCode: null // 清除验证码
        });

        res.json({
            code: 200,
            message: '登录成功',
            data: { token }
        });
    } catch (error) {
        console.error('短信登录错误:', error);
        res.status(500).json({ message: '登录失败' });
    }
});

// 水滴聚合第三方登录
router.post('/auth/shuidi-login', async (req, res) => {
    try {
        const { platform, userInfo, accessToken } = req.body;
        
        console.log('🔍 [水滴聚合登录] 收到登录请求:', {
            platform,
            userInfo: userInfo ? '已提供' : '未提供',
            accessToken: accessToken ? '已提供' : '未提供'
        });

        // 验证必要参数
        if (!platform || !userInfo || !accessToken) {
            return res.status(400).json({ 
                code: 400,
                message: '缺少必要的登录参数' 
            });
        }

        // 从用户信息中提取关键字段
        const { 
            openid,           // 第三方平台用户ID
            nickname,         // 昵称
            avatar,          // 头像
            email,           // 邮箱
            phone,           // 手机号（如果有）
            unionid          // 微信unionid（如果是微信）
        } = userInfo;

        if (!openid) {
            return res.status(400).json({ 
                code: 400,
                message: '无效的用户信息' 
            });
        }

        // 构造第三方账号标识
        const thirdPartyId = `${platform}_${openid}`;
        
        // 查找是否已有绑定的用户
        let user = await UserModel.findOne({
            $or: [
                { thirdPartyId: thirdPartyId },
                { phone: phone }, // 如果提供了手机号，也尝试匹配
                { email: email }  // 如果提供了邮箱，也尝试匹配
            ]
        });

        if (user) {
            // 用户已存在，更新第三方信息
            console.log('✅ [水滴聚合登录] 找到已存在用户:', user._id);
            
            // 更新用户的第三方登录信息
            await UserModel.findByIdAndUpdate(user._id, {
                thirdPartyId: thirdPartyId,
                thirdPartyPlatform: platform,
                thirdPartyInfo: {
                    openid,
                    nickname,
                    avatar,
                    platform,
                    lastLoginAt: new Date()
                },
                lastLoginAt: new Date()
            });
        } else {
            // 创建新用户
            console.log('📝 [水滴聚合登录] 创建新用户');
            
            user = new UserModel({
                username: nickname || `${platform}_user_${Date.now()}`,
                phone: phone || '',
                email: email || '',
                avatar: avatar || '',
                thirdPartyId: thirdPartyId,
                thirdPartyPlatform: platform,
                thirdPartyInfo: {
                    openid,
                    nickname,
                    avatar,
                    platform,
                    loginAt: new Date()
                },
                status: 'active',
                createdAt: new Date(),
                lastLoginAt: new Date()
            });

            await user.save();
            console.log('✅ [水滴聚合登录] 新用户创建成功:', user._id);
        }

        // 生成 JWT token
        const token = jwt.sign(
            { 
                userId: user._id, 
                phone: user.phone,
                platform: platform,
                loginType: 'third_party'
            },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        // 返回登录成功信息
        res.json({
            code: 200,
            message: `${platform}登录成功`,
            data: {
                token,
                userInfo: {
                    id: user._id,
                    username: user.username,
                    nickname: nickname,
                    avatar: avatar,
                    phone: user.phone,
                    email: user.email,
                    platform: platform,
                    loginType: 'third_party'
                }
            }
        });

    } catch (error) {
        console.error('水滴聚合登录错误:', error);
        res.status(500).json({ 
            code: 500,
            message: '第三方登录失败' 
        });
    }
});

// 水滴聚合回调处理（如果需要服务器端回调）
router.get('/auth/shuidi-callback', async (req, res) => {
    try {
        const { code, state, error } = req.query;
        
        console.log('🔗 [水滴聚合回调] 收到回调:', { code, state, error });

        if (error) {
            console.error('❌ [水滴聚合回调] 授权失败:', error);
            return res.redirect(`/pages/login/login?error=${encodeURIComponent(error)}`);
        }

        if (!code || !state) {
            console.error('❌ [水滴聚合回调] 缺少必要参数');
            return res.redirect('/pages/login/login?error=missing_params');
        }

        // 这里可以添加服务器端的回调处理逻辑
        // 目前主要在前端处理，所以这里简单重定向
        res.redirect(`/pages/login/login?code=${code}&state=${state}`);

    } catch (error) {
        console.error('水滴聚合回调处理错误:', error);
        res.redirect('/pages/login/login?error=callback_error');
    }
});

module.exports = router
