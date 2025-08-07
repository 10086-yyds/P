let mongoose = require("./database");

let userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  }, //姓名
  password: {
    type: String,
    required: true,
  },
  //密码
  email: {
    type: String,
    required: true,
    unique: true,
  },
  //邮箱
  phone: {
    type: String,
    required: true,
    unique: true,
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
});

let userModel = mongoose.model("user", userSchema, "user");

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

module.exports = {
  userModel,
  processModel,
  roleModel,
};
