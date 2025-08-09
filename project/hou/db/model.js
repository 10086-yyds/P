
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

// 合同申请模型
const contractApplicationSchema = new mongoose.Schema({
  // 申请人信息
  applicant: {
    name: {
      type: String,
      required: [true, '申请人姓名是必需的'],
      trim: true,
      maxlength: 50
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true
    }
  },
  
  // 项目信息
  project: {
    name: {
      type: String,
      required: [true, '项目名称是必需的'],
      trim: true,
      maxlength: 200
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000
    }
  },
  
  // 合同基本信息
  contract: {
    name: {
      type: String,
      required: [true, '合同名称是必需的'],
      trim: true,
      maxlength: 200
    },
    type: {
      type: String,
      required: [true, '合同类型是必需的'],
      enum: ['工程合同', '采购合同', '服务合同', '其他'],
      default: '工程合同'
    },
    partyA: {
      name: {
        type: String,
        required: [true, '甲方单位是必需的'],
        trim: true,
        maxlength: 200
      },
      contact: {
        type: String,
        trim: true,
        maxlength: 100
      }
    },
    partyB: {
      name: {
        type: String,
        required: [true, '乙方单位是必需的'],
        trim: true,
        maxlength: 200
      },
      contact: {
        type: String,
        trim: true,
        maxlength: 100
      }
    },
    startDate: {
      type: Date,
      required: [true, '开始日期是必需的']
    },
    endDate: {
      type: Date,
      required: [true, '结束日期是必需的']
    },
    paymentTerms: {
      type: String,
      trim: true,
      maxlength: 500
    }
  },
  
  // 财务信息
  financial: {
    amountIncludingTax: {
      type: Number,
      required: [true, '含税金额是必需的'],
      min: 0
    },
    taxRate: {
      type: Number,
      required: [true, '税率是必需的'],
      min: 0,
      max: 100
    },
    taxAmount: {
      type: Number,
      required: [true, '税额是必需的'],
      min: 0
    },
    amountExcludingTax: {
      type: Number,
      required: [true, '不含税金额是必需的'],
      min: 0
    },
    invoiceType: {
      type: String,
      required: [true, '发票类型是必需的'],
      enum: ['增值税普通发票(蓝)', '增值税专用发票', '其他'],
      default: '增值税普通发票(蓝)'
    }
  },
  
  // 收款计划
  paymentPlan: [{
    date: {
      type: Date,
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    description: {
      type: String,
      trim: true,
      maxlength: 200
    },
    status: {
      type: String,
      enum: ['待收款', '已收款', '逾期'],
      default: '待收款'
    }
  }],
  
  // 材料清单
  materials: [{
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    quantity: {
      type: Number,
      required: true,
      min: 0
    },
    unit: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0
    },
    supplier: {
      type: String,
      trim: true,
      maxlength: 200
    }
  }],
  
  // 附件
  attachments: [{
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    url: {
      type: String,
      required: true,
      trim: true
    },
    size: {
      type: Number,
      min: 0
    },
    type: {
      type: String,
      trim: true,
      maxlength: 50
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
  
  // 备注
  remarks: {
    type: String,
    trim: true,
    maxlength: 2000
  },
  
  // 申请状态
  status: {
    type: String,
    enum: ['草稿', '待审批', '审批中', '已批准', '已拒绝', '已取消'],
    default: '草稿',
    index: true
  },
  
  // 审批流程
  approval: {
    currentLevel: {
      type: Number,
      default: 1
    },
    totalLevels: {
      type: Number,
      default: 1
    },
    approvers: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
      },
      level: {
        type: Number,
        required: true
      },
      status: {
        type: String,
        enum: ['待审批', '已批准', '已拒绝'],
        default: '待审批'
      },
      comments: {
        type: String,
        trim: true,
        maxlength: 500
      },
      approvedAt: {
        type: Date
      }
    }],
    approvedAt: {
      type: Date
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user"
    },
    rejectedAt: {
      type: Date
    },
    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user"
    },
    rejectionReason: {
      type: String,
      trim: true,
      maxlength: 500
    }
  },
  
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

// 合同申请模型索引
contractApplicationSchema.index({ status: 1, isDeleted: 1 });
contractApplicationSchema.index({ 'applicant.userId': 1, isDeleted: 1 });
contractApplicationSchema.index({ 'contract.startDate': 1, isDeleted: 1 });
contractApplicationSchema.index({ 'contract.endDate': 1, isDeleted: 1 });
contractApplicationSchema.index({ 'financial.amountIncludingTax': 1, isDeleted: 1 });
contractApplicationSchema.index({ createdAt: 1, isDeleted: 1 });

// 合同申请模型方法
contractApplicationSchema.methods.submitForApproval = function() {
  this.status = '待审批';
  this.updatedAt = new Date();
  return this.save();
};

contractApplicationSchema.methods.approve = function(userId, comments) {
  this.status = '已批准';
  this.approval.approvedAt = new Date();
  this.approval.approvedBy = userId;
  this.updatedAt = new Date();
  
  // 更新当前审批人的状态
  const currentApprover = this.approval.approvers.find(a => a.userId.equals(userId));
  if (currentApprover) {
    currentApprover.status = '已批准';
    currentApprover.comments = comments;
    currentApprover.approvedAt = new Date();
  }
  
  return this.save();
};

contractApplicationSchema.methods.reject = function(userId, reason) {
  this.status = '已拒绝';
  this.approval.rejectedAt = new Date();
  this.approval.rejectedBy = userId;
  this.approval.rejectionReason = reason;
  this.updatedAt = new Date();
  
  // 更新当前审批人的状态
  const currentApprover = this.approval.approvers.find(a => a.userId.equals(userId));
  if (currentApprover) {
    currentApprover.status = '已拒绝';
    currentApprover.comments = reason;
    currentApprover.approvedAt = new Date();
  }
  
  return this.save();
};

contractApplicationSchema.methods.cancel = function(userId) {
  this.status = '已取消';
  this.updatedBy = userId;
  this.updatedAt = new Date();
  return this.save();
};

// 合同申请模型静态方法
contractApplicationSchema.statics.findPendingApproval = function() {
  return this.find({ 
    status: { $in: ['待审批', '审批中'] },
    isDeleted: false 
  });
};

contractApplicationSchema.statics.findByApplicant = function(userId) {
  return this.find({ 
    'applicant.userId': userId, 
    isDeleted: false 
  });
};

contractApplicationSchema.statics.findByStatus = function(status) {
  return this.find({ 
    status: status,
    isDeleted: false 
  });
};

contractApplicationSchema.statics.findByDateRange = function(startDate, endDate) {
  return this.find({
    'contract.startDate': { $gte: startDate },
    'contract.endDate': { $lte: endDate },
    isDeleted: false
  });
};

const contractApplicationModel = mongoose.model("contractApplication", contractApplicationSchema, "contractApplication");

module.exports = {
  UserModel,
  processModel,
  roleModel,
  contractApplicationModel,
};
