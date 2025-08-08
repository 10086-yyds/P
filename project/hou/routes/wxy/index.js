var express = require('express');
var router = express.Router();
var multiparty = require('multiparty');
var {UserModel, PermissionModel, MenuPermissionModel, MenuModel} = require('../../db/model.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const smsService = require('../utils/smsService');
const axios = require('axios');

// JWT密钥
const JWT_SECRET = 'your-secret-key';

// GitHub OAuth配置
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || 'Ov23liRss5VUaecAUaNU';
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || '2d50a5cb2108239d40adfe084214e599c1f7c30c';
const GITHUB_REDIRECT_URI = process.env.GITHUB_REDIRECT_URI || 'http://localhost:3000/wxy/auth/github/callback';

// {{ AURA-X: Add - 添加GitHub OAuth环境变量检查日志. }}
console.log('🔍 [GitHub OAuth] 配置检查:', {
    GITHUB_CLIENT_ID: GITHUB_CLIENT_ID ? GITHUB_CLIENT_ID.substring(0, 8) + '...' : 'undefined',
    GITHUB_CLIENT_SECRET: GITHUB_CLIENT_SECRET ? GITHUB_CLIENT_SECRET.substring(0, 8) + '...' : 'undefined',
    GITHUB_REDIRECT_URI: GITHUB_REDIRECT_URI
});

// {{ AURA-X: Add - 添加测试路由验证路由是否正确加载. }}
router.get('/test', (req, res) => {
    res.json({ 
        code: 200,
        data: {
            message: 'wxy路由正常工作',
            timestamp: new Date().toISOString()
        }
    });
});

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

        // {{ AURA-X: Add - 验证手机号不能为空且格式正确. }}
        if (!phone || !phone.trim()) {
            return res.status(400).json({ message: '手机号不能为空' });
        }
        
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

// === GitHub OAuth 登录相关接口 ===

// GitHub OAuth授权URL生成接口
router.get('/auth/github/url', (req, res) => {
    try {
        // 生成随机state参数防止CSRF攻击
        const state = Date.now().toString() + Math.random().toString(36);
        
        // 构建GitHub OAuth授权URL
        const scope = encodeURIComponent('user:email');
        const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(GITHUB_REDIRECT_URI)}&scope=${scope}&state=${state}`;
        
        console.log('🔍 [GitHub OAuth] 生成授权URL:', {
            state: state.substring(0, 10) + '...',
            authUrl: githubAuthUrl
        });
        
        res.json({
            code: 200,
            data: {
                authUrl: githubAuthUrl,
                state: state
            }
        });
    } catch (error) {
        console.error('生成GitHub授权URL失败:', error);
        res.status(500).json({ message: '生成授权URL失败' });
    }
});

// GitHub OAuth回调处理
router.get('/auth/github/callback', async (req, res) => {
    try {
        const { code, state } = req.query;
        
        // 验证必要参数
        if (!code) {
            return res.status(400).send(`
                <html>
                    <head>
                        <title>GitHub登录失败</title>
                        <meta charset="UTF-8">
                    </head>
                    <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                        <h1 style="color: #e74c3c;">❌ GitHub登录失败</h1>
                        <p>未获取到授权码，请重试</p>
                        <script>
                            setTimeout(() => {
                                window.close();
                            }, 3000);
                        </script>
                    </body>
                </html>
            `);
        }

        console.log('🔍 [GitHub OAuth] 收到回调:', { 
            code: code.substring(0, 10) + '...', 
            state: state ? state.substring(0, 10) + '...' : 'undefined' 
        });

        // 第一步：使用code获取access_token
        const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
            client_id: GITHUB_CLIENT_ID,
            client_secret: GITHUB_CLIENT_SECRET,
            code: code
        }, {
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Node-GitHub-OAuth/1.0'
            }
        });

        const { access_token, error, error_description } = tokenResponse.data;
        
        if (error || !access_token) {
            throw new Error(`GitHub Token获取失败: ${error_description || error || '未知错误'}`);
        }

        console.log('✅ [GitHub OAuth] 获取access token成功');

        // 第二步：使用access_token获取用户信息
        const userResponse = await axios.get('https://api.github.com/user', {
            headers: {
                'Authorization': `Bearer ${access_token}`,
                'User-Agent': 'Node-GitHub-OAuth/1.0'
            }
        });

        const githubUser = userResponse.data;
        console.log('✅ [GitHub OAuth] 获取用户信息成功:', {
            id: githubUser.id,
            login: githubUser.login,
            name: githubUser.name
        });

        // 第三步：获取用户邮箱（如果公开邮箱为空）
        let userEmail = githubUser.email;
        if (!userEmail) {
            try {
                const emailResponse = await axios.get('https://api.github.com/user/emails', {
                    headers: {
                        'Authorization': `Bearer ${access_token}`,
                        'User-Agent': 'Node-GitHub-OAuth/1.0'
                    }
                });
                
                // 获取主要邮箱
                const primaryEmail = emailResponse.data.find(email => email.primary);
                userEmail = primaryEmail ? primaryEmail.email : emailResponse.data[0]?.email;
            } catch (emailError) {
                console.warn('获取GitHub用户邮箱失败:', emailError.message);
            }
        }

        // 第四步：在数据库中查找或创建用户
        let user = await UserModel.findOne({ 
            $or: [
                { githubId: githubUser.id.toString() },
                { email: userEmail }
            ]
        });

        if (user) {
            // 用户已存在，更新GitHub信息
            user.githubId = githubUser.id.toString();
            user.githubLogin = githubUser.login;
            user.githubName = githubUser.name;
            user.avatar = githubUser.avatar_url;
            user.lastLoginAt = new Date();
            user.loginType = user.password ? 'mixed' : 'github';
            if (!user.email && userEmail) {
                user.email = userEmail;
            }
            await user.save();
            
            console.log('✅ [GitHub OAuth] 用户已存在，更新信息');
        } else {
            // 创建新用户 - GitHub登录用户
            // {{ AURA-X: Add - 为GitHub用户生成唯一username避免数据库冲突. }}
            const uniqueUsername = `github_${githubUser.login}_${Date.now()}`;
            
            user = new UserModel({
                username: uniqueUsername, // 生成唯一username
                githubId: githubUser.id.toString(),
                githubLogin: githubUser.login,
                githubName: githubUser.name,
                email: userEmail,
                avatar: githubUser.avatar_url,
                status: 'active',
                loginType: 'github',
                createdAt: new Date(),
                lastLoginAt: new Date()
            });
            await user.save();
            
            console.log('✅ [GitHub OAuth] 创建新用户，username:', uniqueUsername);
        }

        // 第五步：生成JWT token
        const token = jwt.sign(
            { 
                userId: user._id, 
                githubId: user.githubId,
                loginType: user.loginType
            },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        // 第六步：返回成功页面，并传递token给前端
        res.send(`
            <!DOCTYPE html>
            <html>
                <head>
                    <title>GitHub登录成功</title>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                        body {
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                            text-align: center;
                            padding: 50px;
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            margin: 0;
                            min-height: 100vh;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                        }
                        .container {
                            background: rgba(255, 255, 255, 0.95);
                            color: #333;
                            padding: 40px;
                            border-radius: 20px;
                            max-width: 400px;
                            margin: 0 auto;
                            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
                        }
                        .avatar {
                            width: 80px;
                            height: 80px;
                            border-radius: 50%;
                            margin: 0 auto 20px;
                            display: block;
                            border: 3px solid #667eea;
                        }
                        .success-icon {
                            font-size: 60px;
                            margin-bottom: 20px;
                        }
                        h1 {
                            color: #2c3e50;
                            margin-bottom: 10px;
                        }
                        p {
                            color: #7f8c8d;
                            margin-bottom: 20px;
                        }
                        .loading {
                            display: inline-block;
                            width: 20px;
                            height: 20px;
                            border: 3px solid #f3f3f3;
                            border-top: 3px solid #667eea;
                            border-radius: 50%;
                            animation: spin 1s linear infinite;
                        }
                        @keyframes spin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                        }
                        .user-info {
                            background: #f8f9fa;
                            padding: 15px;
                            border-radius: 10px;
                            margin: 20px 0;
                            text-align: left;
                        }
                        .user-info strong {
                            color: #495057;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="success-icon">✅</div>
                        <img src="${githubUser.avatar_url}" alt="Avatar" class="avatar" onerror="this.style.display='none'">
                        <h1>GitHub登录成功！</h1>
                        
                        <div class="user-info">
                            <p><strong>用户名:</strong> ${githubUser.login}</p>
                            <p><strong>姓名:</strong> ${githubUser.name || '未设置'}</p>
                            <p><strong>邮箱:</strong> ${userEmail || '未公开'}</p>
                        </div>
                        
                        <p>正在跳转到应用... <span class="loading"></span></p>
                    </div>
                    <script>
                        // 将token传递给父窗口或主应用
                        const token = '${token}';
                        const userInfo = {
                            githubId: '${user.githubId}',
                            githubLogin: '${user.githubLogin}',
                            githubName: '${user.githubName || ''}',
                            email: '${user.email || ''}',
                            avatar: '${user.avatar || ''}',
                            loginType: '${user.loginType}'
                        };
                        
                        console.log('GitHub登录成功，用户信息:', userInfo);
                        
                        // 尝试与父窗口通信
                        if (window.opener && !window.opener.closed) {
                            try {
                                window.opener.postMessage({
                                    type: 'GITHUB_LOGIN_SUCCESS',
                                    token: token,
                                    userInfo: userInfo
                                }, '*');
                                
                                setTimeout(() => {
                                    window.close();
                                }, 2000);
                            } catch (e) {
                                console.error('无法与父窗口通信:', e);
                                // 降级到localStorage方式
                                localStorage.setItem('github_login_token', token);
                                localStorage.setItem('github_login_userInfo', JSON.stringify(userInfo));
                                window.location.href = '/';
                            }
                        } else {
                            // 如果没有父窗口，使用localStorage存储并跳转
                            localStorage.setItem('github_login_token', token);
                            localStorage.setItem('github_login_userInfo', JSON.stringify(userInfo));
                            
                            setTimeout(() => {
                                window.location.href = '/';
                            }, 2000);
                        }
                    </script>
                </body>
            </html>
        `);

    } catch (error) {
        console.error('GitHub OAuth回调处理失败:', error);
        
        res.status(500).send(`
            <!DOCTYPE html>
            <html>
                <head>
                    <title>GitHub登录失败</title>
                    <meta charset="UTF-8">
                </head>
                <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                    <h1 style="color: #e74c3c;">❌ GitHub登录失败</h1>
                    <p style="color: #7f8c8d;">${error.message}</p>
                    <p style="color: #95a5a6;">页面将在3秒后自动关闭...</p>
                    <script>
                        setTimeout(() => {
                            if (window.opener && !window.opener.closed) {
                                window.close();
                            } else {
                                window.location.href = '/';
                            }
                        }, 3000);
                    </script>
                </body>
            </html>
        `);
    }
});

// GitHub用户信息获取接口
router.get('/auth/github/user', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ message: '未提供认证token' });
        }

        // 验证JWT token
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // 查找用户
        const user = await UserModel.findById(decoded.userId);
        
        if (!user) {
            return res.status(404).json({ message: '用户不存在' });
        }

        // 返回用户信息（不包含敏感信息）
        res.json({
            code: 200,
            data: {
                id: user._id,
                githubId: user.githubId,
                githubLogin: user.githubLogin,
                githubName: user.githubName,
                email: user.email,
                avatar: user.avatar,
                loginType: user.loginType,
                lastLoginAt: user.lastLoginAt
            }
        });
        
    } catch (error) {
        console.error('获取GitHub用户信息失败:', error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Token无效' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token已过期' });
        }
        res.status(500).json({ message: '获取用户信息失败' });
    }
});

module.exports = router
