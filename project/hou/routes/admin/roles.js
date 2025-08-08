const express = require('express');
const router = express.Router();
const { UserModel, roleModel } = require('../../db/model');
const { authenticateToken, requirePermission, requireRole } = require('../../middleware/auth');

// {{ AURA-X: Create - 角色管理路由，提供角色CRUD和用户角色分配功能. }}

/**
 * 获取所有角色列表
 * GET /admin/roles
 */
router.get('/', authenticateToken, requirePermission('system:admin'), async (req, res) => {
    try {
        const roles = await roleModel.find({}).sort({ createdAt: -1 });
        
        res.json({
            code: 200,
            message: '获取角色列表成功',
            data: roles
        });
    } catch (error) {
        console.error('❌ [角色管理] 获取角色列表失败:', error);
        res.status(500).json({
            code: 500,
            message: '获取角色列表失败',
            data: null
        });
    }
});

/**
 * 获取单个角色详情
 * GET /admin/roles/:id
 */
router.get('/:id', authenticateToken, requirePermission('system:admin'), async (req, res) => {
    try {
        const { id } = req.params;
        const role = await roleModel.findById(id);
        
        if (!role) {
            return res.status(404).json({
                code: 404,
                message: '角色不存在',
                data: null
            });
        }
        
        res.json({
            code: 200,
            message: '获取角色详情成功',
            data: role
        });
    } catch (error) {
        console.error('❌ [角色管理] 获取角色详情失败:', error);
        res.status(500).json({
            code: 500,
            message: '获取角色详情失败',
            data: null
        });
    }
});

/**
 * 创建新角色
 * POST /admin/roles
 */
router.post('/', authenticateToken, requirePermission('system:admin'), async (req, res) => {
    try {
        const { name, description, permissions } = req.body;
        
        // 验证必需字段
        if (!name || !description) {
            return res.status(400).json({
                code: 400,
                message: '角色名称和描述不能为空',
                data: null
            });
        }
        
        // 检查角色名是否已存在
        const existingRole = await roleModel.findOne({ name });
        if (existingRole) {
            return res.status(400).json({
                code: 400,
                message: '角色名称已存在',
                data: null
            });
        }
        
        // 创建新角色
        const newRole = await roleModel.create({
            name,
            description,
            permissions: permissions || []
        });
        
        res.status(201).json({
            code: 201,
            message: '创建角色成功',
            data: newRole
        });
    } catch (error) {
        console.error('❌ [角色管理] 创建角色失败:', error);
        res.status(500).json({
            code: 500,
            message: '创建角色失败',
            data: null
        });
    }
});

/**
 * 更新角色
 * PUT /admin/roles/:id
 */
router.put('/:id', authenticateToken, requirePermission('system:admin'), async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, permissions } = req.body;
        
        // 查找角色
        const role = await roleModel.findById(id);
        if (!role) {
            return res.status(404).json({
                code: 404,
                message: '角色不存在',
                data: null
            });
        }
        
        // 检查角色名是否已被其他角色使用
        if (name && name !== role.name) {
            const existingRole = await roleModel.findOne({ name, _id: { $ne: id } });
            if (existingRole) {
                return res.status(400).json({
                    code: 400,
                    message: '角色名称已存在',
                    data: null
                });
            }
        }
        
        // 更新角色
        const updatedRole = await roleModel.findByIdAndUpdate(
            id,
            {
                name: name || role.name,
                description: description || role.description,
                permissions: permissions || role.permissions,
                updatedAt: new Date()
            },
            { new: true }
        );
        
        res.json({
            code: 200,
            message: '更新角色成功',
            data: updatedRole
        });
    } catch (error) {
        console.error('❌ [角色管理] 更新角色失败:', error);
        res.status(500).json({
            code: 500,
            message: '更新角色失败',
            data: null
        });
    }
});

/**
 * 删除角色
 * DELETE /admin/roles/:id
 */
router.delete('/:id', authenticateToken, requirePermission('system:admin'), async (req, res) => {
    try {
        const { id } = req.params;
        
        // 检查是否有用户正在使用此角色
        const usersWithRole = await UserModel.countDocuments({ role: id });
        if (usersWithRole > 0) {
            return res.status(400).json({
                code: 400,
                message: `无法删除角色，还有 ${usersWithRole} 个用户正在使用此角色`,
                data: null
            });
        }
        
        // 删除角色
        const deletedRole = await roleModel.findByIdAndDelete(id);
        if (!deletedRole) {
            return res.status(404).json({
                code: 404,
                message: '角色不存在',
                data: null
            });
        }
        
        res.json({
            code: 200,
            message: '删除角色成功',
            data: deletedRole
        });
    } catch (error) {
        console.error('❌ [角色管理] 删除角色失败:', error);
        res.status(500).json({
            code: 500,
            message: '删除角色失败',
            data: null
        });
    }
});

/**
 * 为用户分配角色
 * POST /admin/roles/assign
 */
router.post('/assign', authenticateToken, requirePermission('user:manage'), async (req, res) => {
    try {
        const { userId, roleId } = req.body;
        
        if (!userId || !roleId) {
            return res.status(400).json({
                code: 400,
                message: '用户ID和角色ID不能为空',
                data: null
            });
        }
        
        // 检查用户是否存在
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                code: 404,
                message: '用户不存在',
                data: null
            });
        }
        
        // 检查角色是否存在
        const role = await roleModel.findById(roleId);
        if (!role) {
            return res.status(404).json({
                code: 404,
                message: '角色不存在',
                data: null
            });
        }
        
        // 分配角色
        user.role = roleId;
        await user.save();
        
        // 返回更新后的用户信息（包含角色）
        const updatedUser = await UserModel.findById(userId).populate('role');
        
        res.json({
            code: 200,
            message: '分配角色成功',
            data: {
                user: {
                    _id: updatedUser._id,
                    username: updatedUser.username,
                    phone: updatedUser.phone,
                    email: updatedUser.email,
                    role: updatedUser.role
                }
            }
        });
    } catch (error) {
        console.error('❌ [角色管理] 分配角色失败:', error);
        res.status(500).json({
            code: 500,
            message: '分配角色失败',
            data: null
        });
    }
});

/**
 * 获取用户列表及其角色
 * GET /admin/roles/users
 */
router.get('/users/list', authenticateToken, requirePermission('user:manage'), async (req, res) => {
    try {
        const { page = 1, limit = 10, role } = req.query;
        
        // 构建查询条件
        const query = {};
        if (role) {
            query.role = role;
        }
        
        // 分页查询用户
        const users = await UserModel.find(query)
            .populate('role')
            .select('-password') // 排除密码字段
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);
            
        const total = await UserModel.countDocuments(query);
        
        res.json({
            code: 200,
            message: '获取用户列表成功',
            data: {
                users,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('❌ [角色管理] 获取用户列表失败:', error);
        res.status(500).json({
            code: 500,
            message: '获取用户列表失败',
            data: null
        });
    }
});

module.exports = router; 