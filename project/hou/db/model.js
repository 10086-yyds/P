
const { mongoose } = require('./database');

const userSchema = new mongoose.Schema({
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
  
  // {{ AURA-X: Add - 添加第三方登录字段支持水滴聚合登录. }}
  //第三方登录信息
  thirdPartyId: {
    type: String,
    default: null,
    unique: false,
    sparse: true
  },
  thirdPartyPlatform: {
    type: String,
    default: null
  },
  thirdPartyInfo: {
    openid: {
      type: String,
      default: null
    },
    nickname: {
      type: String,
      default: null
    },
    avatar: {
      type: String,
      default: null
    },
    platform: {
      type: String,
      default: null
    },
    loginAt: {
      type: Date,
      default: null
    },
    lastLoginAt: {
      type: Date,
      default: null
    }
  }
});


const userModel = mongoose.model("user", userSchema, "user");

const processSchema = new mongoose.Schema({
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

const processModel = mongoose.model("process", processSchema, "process");

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


const roleModel = mongoose.model("role", roleSchema, "role");

module.exports = {
  UserModel,
  processModel,
  roleModel,
};
