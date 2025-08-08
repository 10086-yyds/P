var express = require("express");
var router = express.Router();
const { processModel } = require("../../db/model");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

// 测试接口
router.get("/api/test", function (req, res, next) {
  res.json({
    success: true,
    message: "API正常工作",
    timestamp: new Date().toISOString(),
  });
});

// 获取项目列表
router.get("/api/projects", async function (req, res, next) {
  try {
    console.log("开始获取项目列表");

    const { status, type, department, priority, keyword, startDate, endDate } =
      req.query;

    // 构建查询条件
    const query = { isDeleted: false };

    if (status) query.status = status;
    if (type) query.type = type;
    if (department) query.department = department;
    if (priority) query.priority = parseInt(priority);
    if (keyword) {
      query.$or = [
        { name: { $regex: keyword, $options: "i" } },
        { shortName: { $regex: keyword, $options: "i" } },
        { projectCode: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
      ];
    }

    // 添加时间范围过滤
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }

    console.log("查询条件:", query);

    // 查询数据
    const projects = await processModel
      .find(query)
      .populate("createdBy", "username phone")
      .populate("assignedTo", "username phone")
      .sort({ createdAt: -1 });

    console.log("查询到项目数量:", projects.length);

    res.success(
      {
        projects,
        total: projects.length,
      },
      "获取项目列表成功"
    );
  } catch (error) {
    console.error("获取项目列表错误:", error);
    res.error(error.message, "获取项目列表失败");
  }
});

// 获取单个项目详情
router.get("/api/projects/:id", async function (req, res, next) {
  try {
    const { id } = req.params;

    console.log("获取项目详情，ID:", id);

    // 验证ObjectId格式
    const mongoose = require("mongoose");
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log("无效的ObjectId格式:", id);
      return res.status(400).json({
        success: false,
        code: 400,
        message: "无效的项目ID格式",
        data: null,
        timestamp: new Date().toISOString(),
      });
    }

    const project = await processModel
      .findOne({ _id: id, isDeleted: false })
      .populate("createdBy", "username phone")
      .populate("assignedTo", "username phone")
      .populate("updatedBy", "username phone");

    console.log("查询结果:", project ? "找到项目" : "项目不存在");

    if (!project) {
      return res.status(404).json({
        success: false,
        code: 404,
        message: "项目不存在",
        data: null,
        timestamp: new Date().toISOString(),
      });
    }

    res.success(project, "获取项目详情成功");
  } catch (error) {
    console.error("获取项目详情错误:", error);
    res.status(500).json({
      success: false,
      code: 500,
      message: error.message,
      data: null,
      timestamp: new Date().toISOString(),
    });
  }
});

// 创建项目
router.post("/api/projects", async function (req, res, next) {
  try {
    // 确保 req.body 存在
    if (!req.body) {
      return res.error("请求体不能为空", "创建项目失败", 400);
    }

    console.log("创建项目请求体:", JSON.stringify(req.body, null, 2));

    const {
      name,
      shortName,
      type,
      projectCode,
      description,
      department,
      priority,
      externalPartners,
      assignedTo,
    } = req.body || {};

    // 验证必填字段
    if (
      !name ||
      !shortName ||
      !type ||
      !projectCode ||
      !description ||
      !department
    ) {
      return res.error("缺少必填字段", "创建项目失败", 400);
    }

    // 检查项目编号是否已存在
    const existingProject = await processModel.findOne({
      projectCode,
      isDeleted: false,
    });

    if (existingProject) {
      return res.error("项目编号已存在", "创建项目失败", 400);
    }

    // 创建项目
    const project = new processModel({
      name,
      shortName,
      type,
      projectCode,
      description,
      department,
      priority: priority || 3,
      externalPartners: externalPartners || [],
      assignedTo,
      createdBy: req.user ? req.user._id : "64f8b8b8b8b8b8b8b8b8b8b8", // 临时用户ID，实际应该从认证中间件获取
      status: "planning",
    });

    await project.save();

    // 返回创建的项目（包含关联数据）
    const createdProject = await processModel
      .findById(project._id)
      .populate("createdBy", "username phone")
      .populate("assignedTo", "username phone");

    res.success(createdProject, "创建项目成功", 201);
  } catch (error) {
    console.error("创建项目错误:", error);
    res.error(error.message, "创建项目失败");
  }
});

// 更新项目
router.put("/api/projects/:id", async function (req, res, next) {
  try {
    const { id } = req.params;

    // 验证ObjectId格式
    const mongoose = require("mongoose");
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.error("无效的项目ID格式", "更新项目失败", 400);
    }

    // 确保 req.body 存在
    if (!req.body) {
      return res.error("请求体不能为空", "更新项目失败", 400);
    }

    const updateData = req.body;

    // 查找项目
    const project = await processModel.findOne({ _id: id, isDeleted: false });

    if (!project) {
      return res.error("项目不存在", "更新项目失败", 404);
    }

    // 如果要更新项目编号，检查是否重复
    if (
      updateData.projectCode &&
      updateData.projectCode !== project.projectCode
    ) {
      const existingProject = await processModel.findOne({
        projectCode: updateData.projectCode,
        isDeleted: false,
        _id: { $ne: id },
      });

      if (existingProject) {
        return res.error("项目编号已存在", "更新项目失败", 400);
      }
    }

    // 更新项目
    updateData.updatedBy = req.user ? req.user._id : "64f8b8b8b8b8b8b8b8b8b8b8";
    updateData.updatedAt = new Date();

    const updatedProject = await processModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate("createdBy", "username phone")
      .populate("assignedTo", "username phone")
      .populate("updatedBy", "username phone");

    res.success(updatedProject, "更新项目成功");
  } catch (error) {
    res.error(error.message, "更新项目失败");
  }
});

// 删除项目（软删除）
router.delete("/api/projects/:id", async function (req, res, next) {
  try {
    const { id } = req.params;

    // 验证ObjectId格式
    const mongoose = require("mongoose");
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.error("无效的项目ID格式", "删除项目失败", 400);
    }

    const project = await processModel.findOne({ _id: id, isDeleted: false });

    if (!project) {
      return res.error("项目不存在", "删除项目失败", 404);
    }

    // 软删除
    await processModel.findByIdAndUpdate(id, {
      isDeleted: true,
      deletedBy: req.user ? req.user._id : "64f8b8b8b8b8b8b8b8b8b8b8",
      deletedAt: new Date(),
    });

    res.success(null, "删除项目成功");
  } catch (error) {
    res.error(error.message, "删除项目失败");
  }
});

// 完成项目
router.post("/api/projects/:id/complete", async function (req, res, next) {
  try {
    const { id } = req.params;

    // 验证ObjectId格式
    const mongoose = require("mongoose");
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.error("无效的项目ID格式", "完成项目失败", 400);
    }

    const project = await processModel.findOne({ _id: id, isDeleted: false });

    if (!project) {
      return res.error("项目不存在", "完成项目失败", 404);
    }

    if (project.status === "completed") {
      return res.error("项目已完成", "完成项目失败", 400);
    }

    await project.complete(
      req.user ? req.user._id : "64f8b8b8b8b8b8b8b8b8b8b8"
    );

    const updatedProject = await processModel
      .findById(id)
      .populate("createdBy", "username phone")
      .populate("assignedTo", "username phone")
      .populate("updatedBy", "username phone");

    res.success(updatedProject, "项目完成成功");
  } catch (error) {
    res.error(error.message, "完成项目失败");
  }
});

// 取消项目
router.post("/api/projects/:id/cancel", async function (req, res, next) {
  try {
    const { id } = req.params;

    // 验证ObjectId格式
    const mongoose = require("mongoose");
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.error("无效的项目ID格式", "取消项目失败", 400);
    }

    const project = await processModel.findOne({ _id: id, isDeleted: false });

    if (!project) {
      return res.error("项目不存在", "取消项目失败", 404);
    }

    if (project.status === "cancelled") {
      return res.error("项目已取消", "取消项目失败", 400);
    }

    await project.cancel(req.user ? req.user._id : "64f8b8b8b8b8b8b8b8b8b8b8");

    const updatedProject = await processModel
      .findById(id)
      .populate("createdBy", "username phone")
      .populate("assignedTo", "username phone")
      .populate("updatedBy", "username phone");

    res.success(updatedProject, "项目取消成功");
  } catch (error) {
    res.error(error.message, "取消项目失败");
  }
});

// 通过项目编号获取项目ID
router.get(
  "/api/projects/by-code/:projectCode",
  async function (req, res, next) {
    try {
      const { projectCode } = req.params;

      console.log("通过项目编号获取项目ID，项目编号:", projectCode);

      if (!projectCode) {
        return res.status(400).json({
          success: false,
          code: 400,
          message: "项目编号不能为空",
          data: null,
          timestamp: new Date().toISOString(),
        });
      }

      // 查找项目
      const project = await processModel
        .findOne({
          projectCode: projectCode,
          isDeleted: false,
        })
        .select("_id name shortName projectCode status");

      if (!project) {
        return res.status(404).json({
          success: false,
          code: 404,
          message: "项目不存在",
          data: null,
          timestamp: new Date().toISOString(),
        });
      }

      res.success(
        {
          _id: project._id,
          name: project.name,
          shortName: project.shortName,
          projectCode: project.projectCode,
          status: project.status,
        },
        "获取项目ID成功"
      );
    } catch (error) {
      console.error("通过项目编号获取项目ID错误:", error);
      res.status(500).json({
        success: false,
        code: 500,
        message: error.message,
        data: null,
        timestamp: new Date().toISOString(),
      });
    }
  }
);

// 获取项目统计信息（简化版）
router.get("/api/projects/stats", async function (req, res, next) {
  try {
    console.log("获取项目统计信息");

    const total = await processModel.countDocuments({ isDeleted: false });
    const active = await processModel.countDocuments({
      status: { $in: ["planning", "active"] },
      isDeleted: false,
    });
    const completed = await processModel.countDocuments({
      status: "completed",
      isDeleted: false,
    });
    const cancelled = await processModel.countDocuments({
      status: "cancelled",
      isDeleted: false,
    });

    const result = {
      total,
      active,
      completed,
      cancelled,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };

    res.success(result, "获取项目统计成功");
  } catch (error) {
    console.error("获取项目统计错误:", error);
    res.error(error.message, "获取项目统计失败");
  }
});

// 获取待办事项列表
router.get("/api/todos", async function (req, res, next) {
  try {
    console.log("获取待办事项列表");

    // 模拟待办事项数据
    const todos = [
      {
        id: 1,
        title: "完成项目需求分析",
        description: "分析用户需求并制定项目计划",
        status: "pending",
        priority: "high",
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
      },
      {
        id: 2,
        title: "设计系统架构",
        description: "设计系统整体架构和技术方案",
        status: "in_progress",
        priority: "medium",
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
      },
      {
        id: 3,
        title: "编写技术文档",
        description: "编写项目技术文档和API文档",
        status: "pending",
        priority: "low",
        dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
      },
    ];

    // 直接返回数组，而不是包装在对象中
    res.success(todos, "获取待办事项成功");
  } catch (error) {
    console.error("获取待办事项错误:", error);
    res.error(error.message, "获取待办事项失败");
  }
});

// 获取月度统计数据
router.get("/api/stats/monthly", async function (req, res, next) {
  try {
    console.log("获取月度统计数据");

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // 获取当前月份的开始和结束时间
    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const endOfMonth = new Date(
      currentYear,
      currentMonth + 1,
      0,
      23,
      59,
      59,
      999
    );

    console.log("查询时间范围:", startOfMonth, "到", endOfMonth);

    // 查询本月创建的项目
    const monthlyProjects = await processModel.find({
      createdAt: { $gte: startOfMonth, $lte: endOfMonth },
      isDeleted: false,
    });

    // 统计本月项目数据
    const totalProjects = monthlyProjects.length;
    const newProjects = monthlyProjects.filter(
      (p) => p.status === "planning"
    ).length;
    const completedProjects = monthlyProjects.filter(
      (p) => p.status === "completed"
    ).length;
    const ongoingProjects = monthlyProjects.filter((p) =>
      ["active", "on-hold"].includes(p.status)
    ).length;

    // 计算平均进度
    const avgProgress =
      monthlyProjects.length > 0
        ? Math.round(
            monthlyProjects.reduce((sum, p) => sum + (p.progress || 0), 0) /
              monthlyProjects.length
          )
        : 0;

    // 模拟任务数据
    const totalTasks = totalProjects * 3; // 假设每个项目平均3个任务
    const completedTasks = Math.round(totalTasks * 0.7); // 假设70%的任务已完成
    const pendingTasks = totalTasks - completedTasks;

    const monthlyStats = {
      month: currentMonth + 1,
      year: currentYear,
      totalProjects,
      newProjects,
      completedProjects,
      ongoingProjects,
      totalTasks,
      completedTasks,
      pendingTasks,
      avgProgress,
      productivity: {
        completionRate:
          totalProjects > 0
            ? Math.round((completedProjects / totalProjects) * 100)
            : 0,
        averageTime: 12.5,
        efficiency: 85,
      },
    };

    console.log("月度统计数据:", monthlyStats);
    res.success(monthlyStats, "获取月度统计成功");
  } catch (error) {
    console.error("获取月度统计错误:", error);
    res.error(error.message, "获取月度统计失败");
  }
});

// 获取最近活动
router.get("/api/recent", async function (req, res, next) {
  try {
    console.log("获取最近活动");

    // 获取最近的项目活动
    const recentProjects = await processModel
      .find({ isDeleted: false })
      .sort({ updatedAt: -1 })
      .limit(5)
      .select("name shortName status updatedAt progress");

    // 模拟最近活动数据
    const recentActivities = [
      {
        id: 1,
        type: "project_created",
        title: "新项目创建",
        description: "项目 '移动端开发' 已创建",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        user: "张三",
      },
      {
        id: 2,
        type: "project_updated",
        title: "项目状态更新",
        description: "项目 '网站重构' 状态更新为进行中",
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        user: "李四",
      },
      {
        id: 3,
        type: "task_completed",
        title: "任务完成",
        description: "任务 '需求分析' 已完成",
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        user: "王五",
      },
    ];

    // 直接返回活动数组，而不是包装在对象中
    res.success(recentActivities, "获取最近活动成功");
  } catch (error) {
    console.error("获取最近活动错误:", error);
    res.error(error.message, "获取最近活动失败");
  }
});

// 获取通知数量
router.get("/api/notifications/count", async function (req, res, next) {
  try {
    console.log("获取通知数量");

    // 模拟通知数据
    const notificationCount = {
      total: 8,
      unread: 3,
      types: {
        project: 4,
        task: 2,
        system: 2,
      },
    };

    res.success(notificationCount, "获取通知数量成功");
  } catch (error) {
    console.error("获取通知数量错误:", error);
    res.error(error.message, "获取通知数量失败");
  }
});

// 获取项目数据（支持时间范围过滤）
router.get("/api/projects/data", async function (req, res, next) {
  try {
    console.log("获取项目数据");

    const { startDate, endDate, status, department } = req.query;

    // 构建查询条件
    const query = { isDeleted: false };

    // 时间范围过滤
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }

    // 状态过滤
    if (status) {
      query.status = status;
    }

    // 部门过滤
    if (department) {
      query.department = department;
    }

    console.log("项目数据查询条件:", query);

    // 查询项目数据
    const projects = await processModel
      .find(query)
      .select("name shortName status progress department createdAt updatedAt")
      .sort({ createdAt: -1 });

    console.log("查询到项目数量:", projects.length);

    // 统计信息
    const totalProjects = projects.length;
    const activeProjects = projects.filter((p) => p.status === "active").length;
    const completedProjects = projects.filter(
      (p) => p.status === "completed"
    ).length;
    const planningProjects = projects.filter(
      (p) => p.status === "planning"
    ).length;
    const avgProgress =
      projects.length > 0
        ? Math.round(
            projects.reduce((sum, p) => sum + (p.progress || 0), 0) /
              projects.length
          )
        : 0;

    const result = {
      projects,
      statistics: {
        total: totalProjects,
        active: activeProjects,
        completed: completedProjects,
        planning: planningProjects,
        avgProgress,
      },
    };

    res.success(result, "获取项目数据成功");
  } catch (error) {
    console.error("获取项目数据错误:", error);
    res.error(error.message, "获取项目数据失败");
  }
});

// 创建测试数据
router.post("/api/projects/test-data", async function (req, res, next) {
  try {
    console.log("开始创建测试数据");

    // 创建多个测试项目
    const testProjects = [
      {
        name: "移动端开发项目",
        shortName: "移动端",
        type: "development",
        projectCode: "PRJ-MOBILE-001",
        description: "开发公司移动端应用",
        department: "技术部",
        priority: 1,
        progress: 75,
        status: "active",
        externalPartners: [
          {
            name: "设计公司",
            contact: "13800138001",
            role: "UI设计",
          },
        ],
      },
      {
        name: "网站重构项目",
        shortName: "网站重构",
        type: "maintenance",
        projectCode: "PRJ-WEB-002",
        description: "重构公司官网",
        department: "技术部",
        priority: 2,
        progress: 45,
        status: "active",
        externalPartners: [],
      },
      {
        name: "数据分析系统",
        shortName: "数据分析",
        type: "research",
        projectCode: "PRJ-DATA-003",
        description: "开发数据分析系统",
        department: "数据部",
        priority: 3,
        progress: 90,
        status: "completed",
        externalPartners: [
          {
            name: "数据公司",
            contact: "13800138002",
            role: "数据顾问",
          },
        ],
      },
      {
        name: "员工培训系统",
        shortName: "培训系统",
        type: "training",
        projectCode: "PRJ-TRAIN-004",
        description: "开发员工在线培训系统",
        department: "人事部",
        priority: 4,
        progress: 30,
        status: "planning",
        externalPartners: [],
      },
      {
        name: "客户管理系统",
        shortName: "CRM系统",
        type: "development",
        projectCode: "PRJ-CRM-005",
        description: "开发客户关系管理系统",
        department: "销售部",
        priority: 2,
        progress: 60,
        status: "active",
        externalPartners: [],
      },
    ];

    const createdProjects = [];

    for (const projectData of testProjects) {
      const project = new processModel({
        ...projectData,
        createdBy: "64f8b8b8b8b8b8b8b8b8b8b8",
        createdAt: new Date(
          Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
        ), // 随机创建时间
      });

      await project.save();
      createdProjects.push(project);
    }

    console.log("成功创建", createdProjects.length, "个测试项目");
    res.success(
      {
        message: `成功创建 ${createdProjects.length} 个测试项目`,
        projects: createdProjects,
      },
      "测试数据创建成功",
      201
    );
  } catch (error) {
    console.error("创建测试数据错误:", error);
    res.error(error.message, "创建测试数据失败");
  }
});

module.exports = router;
