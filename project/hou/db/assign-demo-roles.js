const mongoose = require('mongoose');
const { UserModel, roleModel } = require('./model');
const config = require('../config/config');

// {{ AURA-X: Create - 演示用户角色分配脚本，用于测试权限系统. }}

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

// 为用户分配角色
async function assignRoles() {
    try {
        console.log('🚀 开始分配用户角色...\n');

        // 获取所有角色
        const roles = await roleModel.find({});
        const roleMap = {};
        roles.forEach(role => {
            roleMap[role.name] = role._id;
        });

        console.log('📋 系统角色列表:');
        roles.forEach(role => {
            console.log(`- ${role.name} (${role.permissions.length}个权限)`);
        });
        console.log('');

        // 查找现有用户
        const users = await UserModel.find({}).limit(10);
        
        if (users.length === 0) {
            console.log('⚠️ 没有找到用户，请先注册一些用户');
            return;
        }

        console.log(`🔍 找到 ${users.length} 个用户:`);
        users.forEach((user, index) => {
            console.log(`${index + 1}. ${user.phone} (${user.username || '未设置用户名'})`);
        });
        console.log('');

        // 自动分配角色示例
        const assignments = [
            { phone: users[0]?.phone, role: '项目经理' },
            { phone: users[1]?.phone, role: '施工员' },
            { phone: users[2]?.phone, role: '审批人员' }
        ];

        for (const assignment of assignments) {
            if (!assignment.phone) continue;
            
            const roleId = roleMap[assignment.role];
            if (!roleId) {
                console.log(`❌ 角色 "${assignment.role}" 不存在`);
                continue;
            }

            // 更新用户角色
            const result = await UserModel.updateOne(
                { phone: assignment.phone },
                { $set: { role: roleId } }
            );

            if (result.matchedCount > 0) {
                console.log(`✅ 已为用户 ${assignment.phone} 分配角色: ${assignment.role}`);
            } else {
                console.log(`❌ 用户 ${assignment.phone} 不存在`);
            }
        }

        console.log('\n🎉 角色分配完成！');

        // 显示分配结果
        console.log('\n📊 用户角色分配结果:');
        const usersWithRoles = await UserModel.find({}).populate('role');
        usersWithRoles.forEach(user => {
            const roleName = user.role ? user.role.name : '未分配';
            const permissions = user.role ? user.role.permissions.length : 0;
            console.log(`- ${user.phone}: ${roleName} (${permissions}个权限)`);
        });

    } catch (error) {
        console.error('❌ 角色分配失败:', error);
    }
}

// 手动分配角色功能
async function assignRoleToUser(phone, roleName) {
    try {
        // 查找用户
        const user = await UserModel.findOne({ phone });
        if (!user) {
            console.log(`❌ 用户 ${phone} 不存在`);
            return;
        }

        // 查找角色
        const role = await roleModel.findOne({ name: roleName });
        if (!role) {
            console.log(`❌ 角色 "${roleName}" 不存在`);
            return;
        }

        // 分配角色
        user.role = role._id;
        await user.save();

        console.log(`✅ 成功为用户 ${phone} 分配角色: ${roleName}`);
        console.log(`📋 权限列表: ${role.permissions.join(', ')}`);

    } catch (error) {
        console.error('❌ 角色分配失败:', error);
    }
}

// 查看用户权限
async function showUserPermissions(phone) {
    try {
        const user = await UserModel.findOne({ phone }).populate('role');
        
        if (!user) {
            console.log(`❌ 用户 ${phone} 不存在`);
            return;
        }

        console.log(`\n👤 用户信息: ${phone}`);
        console.log(`📱 用户名: ${user.username || '未设置'}`);
        
        if (user.role) {
            console.log(`🎭 角色: ${user.role.name}`);
            console.log(`📝 角色描述: ${user.role.description}`);
            console.log(`🔑 权限列表 (${user.role.permissions.length}个):`);
            user.role.permissions.forEach(permission => {
                console.log(`  - ${permission}`);
            });
        } else {
            console.log('🎭 角色: 未分配');
            console.log('🔑 权限: 无');
        }

    } catch (error) {
        console.error('❌ 查询用户权限失败:', error);
    }
}

// 主函数
async function main() {
    await connectDB();
    
    // 检查命令行参数
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        // 默认：自动分配角色
        await assignRoles();
    } else if (args[0] === 'assign' && args.length === 3) {
        // 手动分配：node assign-demo-roles.js assign 13800138000 项目经理
        const [, phone, roleName] = args;
        await assignRoleToUser(phone, roleName);
    } else if (args[0] === 'show' && args.length === 2) {
        // 查看权限：node assign-demo-roles.js show 13800138000
        const [, phone] = args;
        await showUserPermissions(phone);
    } else {
        console.log('使用方法:');
        console.log('  node assign-demo-roles.js                    # 自动分配角色');
        console.log('  node assign-demo-roles.js assign 手机号 角色名  # 手动分配角色');
        console.log('  node assign-demo-roles.js show 手机号          # 查看用户权限');
        console.log('');
        console.log('角色名称: 项目经理、施工员、审批人员');
    }
    
    await mongoose.disconnect();
    console.log('👋 数据库连接已关闭');
}

// 如果直接运行此脚本
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { assignRoleToUser, showUserPermissions }; 