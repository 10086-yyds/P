const mongoose = require('mongoose');
const { roleModel } = require('./model');
const config = require('../config/config');

// {{ AURA-X: Create - 角色权限初始化脚本，定义三种角色及其权限. }}

// 连接数据库
async function connectDB() {
    try {
        await mongoose.connect(config.database.uri);
        console.log('✅ 数据库连接成功');
    } catch (error) {
        console.error('❌ 数据库连接失败:', error);
        process.exit(1);
    }
}

// 预定义的角色和权限
const rolesData = [
    {
        name: '项目经理',
        description: '负责项目整体管理，拥有所有权限',
        permissions: [
            'project:create',      // 创建项目
            'project:read',        // 查看项目
            'project:update',      // 更新项目
            'project:delete',      // 删除项目
            'user:manage',         // 用户管理
            'approval:create',     // 创建审批
            'approval:read',       // 查看审批
            'approval:update',     // 更新审批
            'approval:approve',    // 审批权限
            'approval:reject',     // 拒绝权限
            'construction:read',   // 查看施工进度
            'construction:manage', // 管理施工
            'report:generate',     // 生成报告
            'system:admin'         // 系统管理
        ]
    },
    {
        name: '施工员',
        description: '负责现场施工管理和进度上报',
        permissions: [
            'project:read',        // 查看项目
            'construction:create', // 创建施工记录
            'construction:read',   // 查看施工进度
            'construction:update', // 更新施工进度
            'approval:create',     // 创建审批申请
            'approval:read',       // 查看审批状态
            'report:create',       // 创建施工报告
            'profile:update'       // 更新个人信息
        ]
    },
    {
        name: '审批人员',
        description: '负责审批流程处理',
        permissions: [
            'project:read',        // 查看项目
            'approval:read',       // 查看审批
            'approval:approve',    // 审批权限
            'approval:reject',     // 拒绝权限
            'approval:update',     // 更新审批状态
            'construction:read',   // 查看施工进度
            'report:read',         // 查看报告
            'profile:update'       // 更新个人信息
        ]
    }
];

// 初始化角色数据
async function seedRoles() {
    try {
        console.log('🚀 开始初始化角色数据...');

        // 清除现有角色数据（可选）
        // await roleModel.deleteMany({});
        // console.log('🗑️ 清除现有角色数据');

        for (const roleData of rolesData) {
            // 检查角色是否已存在
            const existingRole = await roleModel.findOne({ name: roleData.name });
            
            if (existingRole) {
                // 更新现有角色权限
                existingRole.permissions = roleData.permissions;
                existingRole.description = roleData.description;
                existingRole.updatedAt = new Date();
                await existingRole.save();
                console.log(`🔄 更新角色: ${roleData.name}`);
            } else {
                // 创建新角色
                await roleModel.create(roleData);
                console.log(`✅ 创建角色: ${roleData.name}`);
            }
        }

        console.log('🎉 角色数据初始化完成！');
        
        // 显示所有角色
        const allRoles = await roleModel.find({});
        console.log('\n📋 当前系统角色:');
        allRoles.forEach(role => {
            console.log(`- ${role.name}: ${role.permissions.length}个权限`);
        });

    } catch (error) {
        console.error('❌ 角色初始化失败:', error);
    }
}

// 主函数
async function main() {
    await connectDB();
    await seedRoles();
    await mongoose.disconnect();
    console.log('👋 数据库连接已关闭');
}

// 如果直接运行此脚本
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { seedRoles, rolesData }; 