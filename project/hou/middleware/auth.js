const jwt = require('jsonwebtoken');
const { UserModel, roleModel } = require('../db/model');

// {{ AURA-X: Create - JWT认证和角色权限验证中间件. }}

// JWT密钥
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

/**
 * JWT认证中间件
 */
const authenticateToken = async (req, res, next) => {
    try {
        // 从请求头获取token
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({
                code: 401,
                message: '访问令牌缺失',
                data: null
            });
        }

        // 验证token
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // 获取用户信息并填充角色
        const user = await UserModel.findById(decoded.userId).populate('role');
        
        if (!user) {
            return res.status(401).json({
                code: 401,
                message: '用户不存在',
                data: null
            });
        }

        if (user.status !== 'active') {
            return res.status(401).json({
                code: 401,
                message: '用户账号已被禁用',
                data: null
            });
        }

        // 将用户信息添加到请求对象
        req.user = user;
        next();

    } catch (error) {
        console.error('🔐 [认证中间件] 错误:', error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                code: 401,
                message: '无效的访问令牌',
                data: null
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                code: 401,
                message: '访问令牌已过期',
                data: null
            });
        }

        return res.status(500).json({
            code: 500,
            message: '认证服务异常',
            data: null
        });
    }
};

/**
 * 权限验证中间件工厂函数
 * @param {string|string[]} requiredPermissions - 必需的权限
 * @returns {Function} 中间件函数
 */
const requirePermission = (requiredPermissions) => {
    // 确保permissions是数组
    const permissions = Array.isArray(requiredPermissions) 
        ? requiredPermissions 
        : [requiredPermissions];

    return async (req, res, next) => {
        try {
            // 检查用户是否已认证
            if (!req.user) {
                return res.status(401).json({
                    code: 401,
                    message: '用户未认证',
                    data: null
                });
            }

            // 检查用户是否有角色
            if (!req.user.role) {
                return res.status(403).json({
                    code: 403,
                    message: '用户未分配角色',
                    data: null
                });
            }

            // 获取用户角色权限
            const userPermissions = req.user.role.permissions || [];

            // 检查是否是超级管理员（拥有system:admin权限）
            if (userPermissions.includes('system:admin')) {
                return next();
            }

            // 检查是否拥有所需权限
            const hasPermission = permissions.every(permission => 
                userPermissions.includes(permission)
            );

            if (!hasPermission) {
                console.log(`🚫 [权限检查] 用户 ${req.user.username} 缺少权限:`, permissions);
                console.log(`📋 [权限检查] 用户当前权限:`, userPermissions);
                
                return res.status(403).json({
                    code: 403,
                    message: '权限不足，无法访问此资源',
                    data: {
                        required: permissions,
                        current: userPermissions
                    }
                });
            }

            next();

        } catch (error) {
            console.error('🔐 [权限中间件] 错误:', error);
            return res.status(500).json({
                code: 500,
                message: '权限验证服务异常',
                data: null
            });
        }
    };
};

/**
 * 角色验证中间件工厂函数
 * @param {string|string[]} requiredRoles - 必需的角色名称
 * @returns {Function} 中间件函数
 */
const requireRole = (requiredRoles) => {
    // 确保roles是数组
    const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

    return async (req, res, next) => {
        try {
            // 检查用户是否已认证
            if (!req.user) {
                return res.status(401).json({
                    code: 401,
                    message: '用户未认证',
                    data: null
                });
            }

            // 检查用户是否有角色
            if (!req.user.role) {
                return res.status(403).json({
                    code: 403,
                    message: '用户未分配角色',
                    data: null
                });
            }

            // 检查角色是否匹配
            const userRole = req.user.role.name;
            const hasRole = roles.includes(userRole);

            if (!hasRole) {
                console.log(`🚫 [角色检查] 用户 ${req.user.username} 角色不匹配:`, {
                    required: roles,
                    current: userRole
                });
                
                return res.status(403).json({
                    code: 403,
                    message: '角色权限不足，无法访问此资源',
                    data: {
                        required: roles,
                        current: userRole
                    }
                });
            }

            next();

        } catch (error) {
            console.error('🔐 [角色中间件] 错误:', error);
            return res.status(500).json({
                code: 500,
                message: '角色验证服务异常',
                data: null
            });
        }
    };
};

/**
 * 生成JWT token
 * @param {Object} user - 用户对象
 * @returns {string} JWT token
 */
const generateToken = (user) => {
    const payload = {
        userId: user._id,
        username: user.username,
        role: user.role
    };

    return jwt.sign(payload, JWT_SECRET, { 
        expiresIn: '24h' // token有效期24小时
    });
};

/**
 * 获取用户权限列表
 * @param {Object} user - 用户对象（已populate role）
 * @returns {Array} 权限列表
 */
const getUserPermissions = (user) => {
    if (!user || !user.role) {
        return [];
    }
    return user.role.permissions || [];
};

module.exports = {
    authenticateToken,
    requirePermission,
    requireRole,
    generateToken,
    getUserPermissions
}; 