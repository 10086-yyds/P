const mongoose = require('mongoose');
const database = require('./database');

let userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: false,
    unique: false,
  }, //姓名
  password: {
    type: String,
    required: false,
  },
  //密码
  email: {
    type: String,
    required: false,
    unique: false,
  },
  //邮箱
  phone: {
    type: String,
    required: false, // 改为非必需，在业务逻辑中验证
    unique: true,
    sparse: true, // 允许null值，但如果有值必须唯一
  },
  //手机号
  avatar: {
    type: String,
    default: "",
  },
  //角色
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "role",
  },
  //状态
  status: {
    type: String,
    default: "active",
  },
  //创建时间
  createdAt: {
    type: Date,
    default: Date.now,
  },
  // {{ AURA-X: Add - 添加验证码字段支持注册功能. }}
  //验证码信息
  verifyCode: {
    code: {
      type: String,
      default: null
    },
    expireAt: {
      type: Date,
      default: null
    }
  },
  // {{ AURA-X: Add - 添加GitHub OAuth登录相关字段. }}
  // GitHub OAuth相关字段
  githubId: {
    type: String,
    unique: true,
    sparse: true // 允许null值，但如果有值必须唯一
  },
  githubLogin: {
    type: String,
    default: null
  },
  githubName: {
    type: String,
    default: null
  },
  loginType: {
    type: String,
    enum: ['phone', 'github', 'mixed'],
    default: 'phone'
  },
  lastLoginAt: {
    type: Date,
    default: null
  }

});

let UserModel = mongoose.model("user", userSchema, "user");

let processSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  //描述
  description: {
    type: String,
    required: true,
  },
  //状态
  status: {
    type: String,
    default: "active",
  },
  //创建人
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  //创建时间
  createdAt: {
    type: Date,
    default: Date.now,
  },
  //更新人
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  //更新时间
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  //删除人
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  //删除时间
  deletedAt: {
    type: Date,
    default: Date.now,
  },
  //是否删除
  isDeleted: {
    type: Boolean,
    default: false,
  },
  //是否完成
  isCompleted: {
    type: Boolean,
    default: false,
  },
  //完成时间
  completedAt: {
    type: Date,
    default: null,
  },
  //是否取消
  isCanceled: {
    type: Boolean,
    default: false,
  },
  //取消时间
  canceledAt: {
    type: Date,
    default: null,
  },
});

let processModel = mongoose.model("process", processSchema, "process");

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  }, //角色名称
  description: {
    type: String,
    required: true,
  }, //角色描述
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  //权限
  permissions: {
    type: Array,
    default: [],
  },
});
let roleModel = mongoose.model("role", roleSchema, "role");
module.exports = {
  UserModel,
  processModel,
  roleModel,
};
