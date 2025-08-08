# 角色权限系统使用指南

## 概述

本项目已集成完整的基于角色的权限管理系统（RBAC），支持三种预定义角色：
- **项目经理**：拥有所有权限，可管理项目、用户和审批流程
- **施工员**：负责现场施工管理和进度上报
- **审批人员**：负责审批流程处理

## 快速开始

### 1. 初始化角色数据

首次使用前，需要初始化系统角色数据：

```bash
cd hou
node db/seed-roles.js
```

这将创建三个预定义角色及其权限配置。

### 2. 为用户分配角色

#### 方法一：通过API接口分配

```bash
# 获取所有角色列表
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/admin/roles

# 为用户分配角色
curl -X POST http://localhost:3000/admin/roles/assign \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "userId": "USER_ID",
    "roleId": "ROLE_ID"
  }'
```

#### 方法二：直接在数据库中操作

```javascript
// 在MongoDB中直接更新用户角色
db.user.updateOne(
  { phone: "13800138000" },
  { $set: { role: ObjectId("ROLE_ID") } }
)
```

## 权限系统详解

### 预定义权限列表

```javascript
// 项目管理权限
'project:create'      // 创建项目
'project:read'        // 查看项目
'project:update'      // 更新项目
'project:delete'      // 删除项目

// 用户管理权限
'user:manage'         // 用户管理

// 审批相关权限
'approval:create'     // 创建审批
'approval:read'       // 查看审批
'approval:update'     // 更新审批
'approval:approve'    // 审批权限
'approval:reject'     // 拒绝权限

// 施工相关权限
'construction:create' // 创建施工记录
'construction:read'   // 查看施工进度
'construction:update' // 更新施工进度
'construction:manage' // 管理施工

// 报告权限
'report:create'       // 创建报告
'report:read'         // 查看报告
'report:generate'     // 生成报告

// 系统管理权限
'system:admin'        // 系统管理
'profile:update'      // 更新个人信息
```

### 角色权限矩阵

| 权限 | 项目经理 | 施工员 | 审批人员 |
|------|----------|--------|----------|
| 项目管理 | ✅ 全部 | ✅ 查看 | ✅ 查看 |
| 用户管理 | ✅ | ❌ | ❌ |
| 审批管理 | ✅ 全部 | ✅ 创建/查看 | ✅ 审批/查看 |
| 施工管理 | ✅ 全部 | ✅ 创建/更新/查看 | ✅ 查看 |
| 报告管理 | ✅ 全部 | ✅ 创建 | ✅ 查看 |
| 系统管理 | ✅ | ❌ | ❌ |

## API接口使用

### 认证相关接口

#### 登录接口（已更新支持角色）

```javascript
// 密码登录
POST /wxy/auth/login
{
  "phone": "13800138000",
  "password": "123456"
}

// 返回结果包含角色信息
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "_id": "...",
      "username": "张三",
      "phone": "13800138000",
      "role": {
        "_id": "...",
        "name": "项目经理",
        "description": "负责项目整体管理，拥有所有权限"
      },
      "permissions": [
        "project:create",
        "project:read",
        // ... 更多权限
      ]
    }
  }
}
```

#### 获取当前用户信息

```javascript
GET /wxy/auth/me
Authorization: Bearer YOUR_TOKEN

// 返回包含角色和权限的用户信息
```

### 权限验证中间件使用

在路由中使用权限验证：

```javascript
const { authenticateToken, requirePermission, requireRole } = require('../middleware/auth');

// 需要登录
router.get('/protected', authenticateToken, (req, res) => {
  // req.user 包含用户信息和角色
});

// 需要特定权限
router.post('/project', 
  authenticateToken, 
  requirePermission('project:create'), 
  (req, res) => {
    // 只有拥有 project:create 权限的用户才能访问
  }
);

// 需要多个权限
router.put('/project/:id', 
  authenticateToken, 
  requirePermission(['project:update', 'project:read']), 
  (req, res) => {
    // 需要同时拥有两个权限
  }
);

// 需要特定角色
router.get('/admin/dashboard', 
  authenticateToken, 
  requireRole('项目经理'), 
  (req, res) => {
    // 只有项目经理才能访问
  }
);
```

### 角色管理接口

```javascript
// 获取所有角色
GET /admin/roles
Authorization: Bearer YOUR_TOKEN (需要 system:admin 权限)

// 创建新角色
POST /admin/roles
{
  "name": "质检员",
  "description": "负责质量检查",
  "permissions": ["project:read", "construction:read"]
}

// 分配用户角色
POST /admin/roles/assign
{
  "userId": "USER_ID",
  "roleId": "ROLE_ID"
}

// 获取用户列表及角色
GET /admin/roles/users/list?page=1&limit=10
```

## 前端集成

### 权限判断

```javascript
// 检查用户是否有特定权限
function hasPermission(permission) {
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  return userInfo.permissions && userInfo.permissions.includes(permission);
}

// 检查用户角色
function hasRole(roleName) {
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  return userInfo.role && userInfo.role.name === roleName;
}

// 使用示例
if (hasPermission('project:create')) {
  // 显示创建项目按钮
}

if (hasRole('项目经理')) {
  // 显示管理员功能
}
```

### 请求拦截器

```javascript
// 在 uni.request 或 axios 中添加 token
uni.request({
  url: 'http://localhost:3000/wxy/auth/me',
  method: 'GET',
  header: {
    'Authorization': 'Bearer ' + uni.getStorageSync('token'),
    'Content-Type': 'application/json'
  }
})
```

## 数据库操作

### 查看用户角色

```javascript
// 查看所有用户及其角色
db.user.aggregate([
  {
    $lookup: {
      from: "role",
      localField: "role",
      foreignField: "_id",
      as: "roleInfo"
    }
  },
  {
    $project: {
      username: 1,
      phone: 1,
      "roleInfo.name": 1,
      "roleInfo.description": 1
    }
  }
])
```

### 批量分配角色

```javascript
// 获取角色ID
const managerRole = db.role.findOne({name: "项目经理"})._id;
const workerRole = db.role.findOne({name: "施工员"})._id;
const approverRole = db.role.findOne({name: "审批人员"})._id;

// 批量分配角色
db.user.updateOne({phone: "13800138001"}, {$set: {role: managerRole}});
db.user.updateOne({phone: "13800138002"}, {$set: {role: workerRole}});
db.user.updateOne({phone: "13800138003"}, {$set: {role: approverRole}});
```

## 安全注意事项

1. **JWT密钥安全**：确保在生产环境中使用强密钥
2. **权限最小化**：只分配必要的权限
3. **定期审查**：定期检查用户权限分配
4. **日志记录**：记录重要操作的权限检查日志

## 扩展开发

### 添加新权限

1. 在 `db/seed-roles.js` 中添加新权限
2. 重新运行初始化脚本
3. 在相关路由中使用 `requirePermission` 中间件

### 创建新角色

```javascript
// 通过API创建
POST /admin/roles
{
  "name": "新角色名称",
  "description": "角色描述",
  "permissions": ["permission1", "permission2"]
}
```

## 故障排除

### 常见问题

1. **权限不足错误**：检查用户是否已分配正确角色
2. **Token失效**：检查token是否过期或格式是否正确
3. **角色未加载**：确保登录接口正确填充了角色信息

### 调试技巧

```javascript
// 在中间件中添加调试日志
console.log('用户权限:', req.user.role?.permissions);
console.log('需要权限:', requiredPermissions);
```

## 更新日志

- ✅ 完成基础RBAC权限系统
- ✅ 集成JWT认证中间件  
- ✅ 更新所有登录接口支持角色
- ✅ 提供完整的角色管理API
- ✅ 创建角色初始化脚本

---

**注意**：首次使用请务必运行 `node db/seed-roles.js` 初始化角色数据！ 