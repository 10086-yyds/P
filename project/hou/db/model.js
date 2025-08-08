
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


const UserModel = mongoose.model("user", userSchema, "user");

const processSchema = new mongoose.Schema({
  // 项目名称
  name: {
    type: String,
    required: [true, '项目名称是必需的'],
    trim: true,
    maxlength: 100
  },
  // 项目简称
  shortName: {
    type: String,
    required: [true, '项目简称是必需的'],
    trim: true,
    maxlength: 50
  },
  // 项目类型
  type: {
    type: String,
    required: [true, '项目类型是必需的'],
    enum: ['development', 'research', 'maintenance', 'consulting', 'training', 'other'],
    default: 'development'
  },
  // 项目编号
  projectCode: {
    type: String,
    required: [true, '项目编号是必需的'],
    unique: true,
    trim: true,
    maxlength: 20,
    match: [/^[A-Z0-9-]+$/, '项目编号只能包含大写字母、数字和连字符']
  },
  // 项目状态
  status: {
    type: String,
    enum: ['planning', 'active', 'on-hold', 'completed', 'cancelled'],
    default: 'planning',
    index: true
  },
  // 项目描述
  description: {
    type: String,
    required: [true, '项目描述是必需的'],
    trim: true,
    maxlength: 1000
  },
  // 所属部门
  department: {
    type: String,
    required: [true, '所属部门是必需的'],
    trim: true,
    maxlength: 100
  },
  // 项目优先级
  priority: {
    type: Number,
    enum: [1, 2, 3, 4, 5],
    default: 3,
    index: true
  },
  // 工程进度（百分比）
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
    index: true
  },
  // 项目图片（数组）
  images: [{
    url: {
      type: String,
      required: true,
      trim: true
    },
    name: {
      type: String,
      trim: true,
      maxlength: 100
    },
    description: {
      type: String,
      trim: true,
      maxlength: 200
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user"
    }
  }],
  // 外部合作方
  externalPartners: [{
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    contact: {
      type: String,
      trim: true,
      maxlength: 100
    },
    role: {
      type: String,
      trim: true,
      maxlength: 100
    }
  }],
  // 创建人
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
    index: true
  },
  // 更新人
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user"
  },
  // 负责人
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user"
  },
  // 创建时间
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  // 更新时间
  updatedAt: {
    type: Date,
    default: Date.now
  },
  // 完成时间
  completedAt: {
    type: Date,
    default: null
  },
  // 删除人
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user"
  },
  // 删除时间
  deletedAt: {
    type: Date,
    default: null
  },
  // 是否删除
  isDeleted: {
    type: Boolean,
    default: false,
    index: true
  }
});

// 流程模型索引
processSchema.index({ projectCode: 1 });
processSchema.index({ status: 1, isDeleted: 1 });
processSchema.index({ createdBy: 1, isDeleted: 1 });
processSchema.index({ department: 1, isDeleted: 1 });
processSchema.index({ type: 1, isDeleted: 1 });
processSchema.index({ priority: 1, isDeleted: 1 });
processSchema.index({ progress: 1, isDeleted: 1 });

// 流程模型方法
processSchema.methods.complete = function(userId) {
  this.status = 'completed';
  this.completedAt = new Date();
  this.updatedBy = userId;
  return this.save();
};

processSchema.methods.cancel = function(userId) {
  this.status = 'cancelled';
  this.updatedBy = userId;
  return this.save();
};

processSchema.methods.isOverdue = function() {
  // 可以根据项目类型和优先级计算是否逾期
  return false;
};

// 流程模型静态方法
processSchema.statics.findActive = function() {
  return this.find({ 
    status: { $in: ['planning', 'active'] },
    isDeleted: false 
  });
};

processSchema.statics.findByUser = function(userId) {
  return this.find({ 
    createdBy: userId, 
    isDeleted: false 
  });
};

processSchema.statics.findByDepartment = function(department) {
  return this.find({ 
    department: department,
    isDeleted: false 
  });
};

processSchema.statics.findByType = function(type) {
  return this.find({ 
    type: type,
    isDeleted: false 
  });
};

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
