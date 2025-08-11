var express = require("express");
var router = express.Router();
const mongoose = require("mongoose");
const { processModel, contractApplicationModel, UserModel } = require("../../db/model");
const multiparty = require("multiparty");
const path = require("path");
const fs = require("fs");

/**
 * 图片管理说明：
 * 1. 上传新图片：使用 POST /api/projects/:id/images
 * 2. 更新项目时包含图片：PUT /api/projects/:id 中的 images 数组必须包含已上传的图片对象
 * 3. 不允许在更新项目时直接发送 blob URLs 或文件对象
 * 4. 图片对象结构：{ url: string, name: string, description: string, uploadedAt: Date, uploadedBy: ObjectId }
 */

// 确保上传目录存在
const uploadDir = path.join(__dirname, "../../public/uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 图片上传中间件
const uploadImage = (req, res, next) => {
  const form = new multiparty.Form({
    uploadDir: uploadDir,
    maxFilesSize: 10 * 1024 * 1024, // 10MB限制
    autoFiles: true,
    filter: function ({ name, originalFilename, mimetype }) {
      // 只允许图片文件
      return mimetype && mimetype.includes("image/");
    }
  });

  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: "文件上传失败",
        error: err.message
      });
    }

    req.uploadedFiles = files;
    req.formFields = fields;
    next();
  });
};

// 图片上传接口
router.post("/api/upload/image", uploadImage, async function (req, res, next) {
  try {
    console.log("开始处理图片上传请求");
    
    // 检查是否有上传的文件
    if (!req.uploadedFiles || Object.keys(req.uploadedFiles).length === 0) {
      return res.error("没有选择图片文件", "图片上传失败", 400);
    }

    const uploadedImages = [];
    const errors = [];

    // 处理每个上传的文件
    for (const [fieldName, files] of Object.entries(req.uploadedFiles)) {
      for (const file of files) {
        try {
          console.log("处理文件:", file.originalFilename);
          
          // 验证文件类型
          if (!file.headers['content-type'] || !file.headers['content-type'].includes('image/')) {
            errors.push(`${file.originalFilename}: 不是有效的图片文件`);
            // 删除无效文件
            if (fs.existsSync(file.path)) {
              fs.unlinkSync(file.path);
            }
            continue;
          }

          // 生成唯一的文件名
          const fileExt = path.extname(file.originalFilename);
          const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}${fileExt}`;
          const newFilePath = path.join(uploadDir, fileName);
          
          // 重命名文件
          fs.renameSync(file.path, newFilePath);
          
          // 构建图片信息
          const imageInfo = {
            url: `/uploads/${fileName}`,
            name: file.originalFilename || fileName,
            description: req.formFields.description ? req.formFields.description[0] : '',
            uploadedAt: new Date(),
            uploadedBy: req.user ? req.user._id : null,
            fileSize: file.size,
            mimeType: file.headers['content-type']
          };
          
          uploadedImages.push(imageInfo);
          console.log("图片上传成功:", imageInfo.url);
          
        } catch (fileError) {
          console.error("处理文件时出错:", fileError);
          errors.push(`${file.originalFilename}: ${fileError.message}`);
          // 清理文件
          if (file.path && fs.existsSync(file.path)) {
            try {
              fs.unlinkSync(file.path);
            } catch (cleanupError) {
              console.error("清理文件失败:", cleanupError);
            }
          }
        }
      }
    }

    // 检查是否有成功上传的图片
    if (uploadedImages.length === 0) {
      return res.error("没有图片上传成功", "图片上传失败", 400);
    }

    // 返回上传结果
    const result = {
      success: true,
      message: `成功上传 ${uploadedImages.length} 张图片`,
      data: {
        images: uploadedImages,
        totalCount: uploadedImages.length,
        errors: errors.length > 0 ? errors : undefined
      }
    };

    if (errors.length > 0) {
      result.message += `，但有 ${errors.length} 个文件上传失败`;
      console.warn("部分文件上传失败:", errors);
    }

    console.log("图片上传完成，成功:", uploadedImages.length, "失败:", errors.length);
    res.json(result);

  } catch (error) {
    console.error("图片上传接口错误:", error);
    
    // 清理可能上传的文件
    if (req.uploadedFiles) {
      for (const files of Object.values(req.uploadedFiles)) {
        for (const file of files) {
          if (file.path && fs.existsSync(file.path)) {
            try {
              fs.unlinkSync(file.path);
            } catch (cleanupError) {
              console.error("清理文件失败:", cleanupError);
            }
          }
        }
      }
    }
    
    res.error("图片上传失败", "服务器内部错误", 500);
  }
});

// 批量图片上传接口
router.post("/api/upload-images", uploadImage, async function (req, res, next) {
  try {
    console.log("开始处理批量图片上传请求");
    
    // 检查是否有上传的文件
    if (!req.uploadedFiles || Object.keys(req.uploadedFiles).length === 0) {
      return res.error("没有选择图片文件", "批量图片上传失败", 400);
    }

    const uploadedImages = [];
    const errors = [];

    // 处理每个上传的文件
    for (const [fieldName, files] of Object.entries(req.uploadedFiles)) {
      for (const file of files) {
        try {
          console.log("处理文件:", file.originalFilename);
          
          // 验证文件类型
          if (!file.headers['content-type'] || !file.headers['content-type'].includes('image/')) {
            errors.push(`${file.originalFilename}: 不是有效的图片文件`);
            // 删除无效文件
            if (fs.existsSync(file.path)) {
              fs.unlinkSync(file.path);
            }
            continue;
          }

          // 生成唯一的文件名
          const fileExt = path.extname(file.originalFilename);
          const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}${fileExt}`;
          const newFilePath = path.join(uploadDir, fileName);
          
          // 重命名文件
          fs.renameSync(file.path, newFilePath);
          
          // 构建图片信息
          const imageInfo = {
            url: `/uploads/${fileName}`,
            name: file.originalFilename || fileName,
            description: req.formFields.description ? req.formFields.description[0] : '',
            uploadedAt: new Date(),
            uploadedBy: req.user ? req.user._id : null,
            fileSize: file.size,
            mimeType: file.headers['content-type']
          };
          
          uploadedImages.push(imageInfo);
          console.log("图片上传成功:", imageInfo.url);
          
        } catch (fileError) {
          console.error("处理文件时出错:", fileError);
          errors.push(`${file.originalFilename}: ${fileError.message}`);
          // 清理文件
          if (file.path && fs.existsSync(file.path)) {
            try {
              fs.unlinkSync(file.path);
            } catch (cleanupError) {
              console.error("清理文件失败:", cleanupError);
            }
          }
        }
      }
    }

    // 检查是否有成功上传的图片
    if (uploadedImages.length === 0) {
      return res.error("没有图片上传成功", "批量图片上传失败", 400);
    }

    // 返回上传结果
    const result = {
      success: true,
      message: `成功上传 ${uploadedImages.length} 张图片`,
      data: {
        images: uploadedImages,
        totalCount: uploadedImages.length,
        errors: errors.length > 0 ? errors : undefined
      }
    };

    if (errors.length > 0) {
      result.message += `，但有 ${errors.length} 个文件上传失败`;
      console.warn("部分文件上传失败:", errors);
    }

    console.log("批量图片上传完成，成功:", uploadedImages.length, "失败:", errors.length);
    res.json(result);

  } catch (error) {
    console.error("批量图片上传接口错误:", error);
    
    // 清理可能上传的文件
    if (req.uploadedFiles) {
      for (const files of Object.values(req.uploadedFiles)) {
        for (const file of files) {
          if (file.path && fs.existsSync(file.path)) {
            try {
              fs.unlinkSync(file.path);
            } catch (cleanupError) {
              console.error("清理文件失败:", cleanupError);
            }
          }
        }
      }
    }
    
    res.error("批量图片上传失败", "服务器内部错误", 500);
  }
});

// 删除图片文件接口
router.delete("/api/images/:filename", async function (req, res, next) {
  try {
    const { filename } = req.params;
    
    // 安全检查：防止路径遍历攻击
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.error("无效的文件名", "删除图片失败", 400);
    }
    
    const filePath = path.join(uploadDir, filename);
    
    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
      return res.error("图片文件不存在", "删除图片失败", 404);
    }
    
    // 删除文件
    fs.unlinkSync(filePath);
    
    console.log("图片文件删除成功:", filename);
    res.success(null, "图片删除成功");
    
  } catch (error) {
    console.error("删除图片文件错误:", error);
    res.error("删除图片失败", "服务器内部错误", 500);
  }
});

// 获取图片列表接口
router.get("/api/images", async function (req, res, next) {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // 读取上传目录
    if (!fs.existsSync(uploadDir)) {
      return res.success({ images: [], total: 0, page: parseInt(page), limit: parseInt(limit) }, "获取图片列表成功");
    }
    
    const files = fs.readdirSync(uploadDir);
    let imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'].includes(ext);
    });
    
    // 搜索过滤
    if (search) {
      imageFiles = imageFiles.filter(file => 
        file.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    const total = imageFiles.length;
    const paginatedFiles = imageFiles.slice(skip, skip + parseInt(limit));
    
    // 构建图片信息
    const images = paginatedFiles.map(filename => {
      const filePath = path.join(uploadDir, filename);
      const stats = fs.statSync(filePath);
      
      return {
        filename,
        url: `/uploads/${filename}`,
        name: filename,
        size: stats.size,
        uploadedAt: stats.mtime,
        mimeType: getMimeType(filename)
      };
    });
    
    res.success({
      images,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit))
    }, "获取图片列表成功");
    
  } catch (error) {
    console.error("获取图片列表错误:", error);
    res.error("获取图片列表失败", "服务器内部错误", 500);
  }
});

// 辅助函数：根据文件扩展名获取MIME类型
function getMimeType(filename) {
  const ext = path.extname(filename).toLowerCase();
  const mimeTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.bmp': 'image/bmp',
    '.webp': 'image/webp'
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

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
      createdBy: req.user ? req.user._id : null, // 临时用户ID，实际应该从认证中间件获取
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
    // 检查数据库连接状态
    const dbState = mongoose.connection.readyState;
    console.log("数据库连接状态:", dbState, {
      0: "已断开",
      1: "已连接",
      2: "正在连接",
      3: "正在断开"
    }[dbState]);
    
    if (dbState !== 1) {
      return res.error("数据库连接异常", "更新项目失败", 503);
    }
    
    const { id } = req.params;

    // 验证ObjectId格式
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.error("无效的项目ID格式", "更新项目失败", 400);
    }

    // 确保 req.body 存在
    if (!req.body) {
      return res.error("请求体不能为空", "更新项目失败", 400);
    }

    // 验证请求体是否为对象
    if (typeof req.body !== 'object' || req.body === null) {
      return res.error("请求体必须是有效的JSON对象", "更新项目失败", 400);
    }

    const updateData = req.body;
    
    // 添加请求数据日志
    console.log("更新项目请求数据:", {
      projectId: id,
      updateData: JSON.stringify(updateData, null, 2),
      hasImages: updateData.images ? Array.isArray(updateData.images) : false,
      imagesCount: updateData.images ? updateData.images.length : 0,
      requestHeaders: req.headers,
      contentType: req.get('Content-Type')
    });

    // 查找项目
    console.log("开始查找项目...");
    let project;
    try {
      project = await processModel.findOne({ _id: id, isDeleted: false });
      console.log("项目查找完成");
    } catch (findError) {
      console.error("查找项目失败:", findError);
      throw findError;
    }

    if (!project) {
      return res.error("项目不存在", "更新项目失败", 404);
    }
    
    console.log("找到项目:", {
      id: project._id,
      name: project.name,
      status: project.status,
      hasCreatedBy: !!project.createdBy,
      hasAssignedTo: !!project.assignedTo
    });
    
    // 验证项目数据的完整性
    if (!project.createdBy) {
      console.warn("警告: 项目缺少createdBy字段:", id);
    }

    // 如果要更新项目编号，检查是否重复
    if (
      updateData.projectCode &&
      updateData.projectCode !== project.projectCode
    ) {
      console.log("检查项目编号是否重复:", updateData.projectCode);
      let existingProject;
      try {
        existingProject = await processModel.findOne({
          projectCode: updateData.projectCode,
          isDeleted: false,
          _id: { $ne: id },
        });
        console.log("项目编号重复检查完成");
      } catch (checkError) {
        console.error("检查项目编号重复失败:", checkError);
        throw checkError;
      }

      if (existingProject) {
        return res.error("项目编号已存在", "更新项目失败", 400);
      }
    }

    // 处理图片数据 - 验证图片数组结构
    if (updateData.images !== undefined) {
      console.log("开始验证图片数据...");
      if (!Array.isArray(updateData.images)) {
        return res.error("图片数据必须是数组格式", "更新项目失败", 400);
      }
      
      console.log(`验证${updateData.images.length}张图片...`);
      
      // 验证每个图片对象的结构
      for (let i = 0; i < updateData.images.length; i++) {
        const image = updateData.images[i];
        console.log(`验证第${i + 1}张图片:`, image);
        
        // 检查是否为对象
        if (typeof image !== 'object' || image === null) {
          return res.error(`图片数据第${i + 1}项必须是对象格式`, "更新项目失败", 400);
        }
        
        // 检查必要字段
        if (!image.url || typeof image.url !== 'string') {
          return res.error(`图片数据第${i + 1}项缺少有效的url字段`, "更新项目失败", 400);
        }
        
        // 检查是否为blob URL（不允许）
        if (image.url.startsWith('blob:')) {
          return res.error(`图片数据第${i + 1}项包含无效的blob URL，请先上传图片`, "更新项目失败", 400);
        }
        
        // 检查URL格式（应该是服务器端路径）
        if (!image.url.startsWith('/uploads/') && !image.url.startsWith('http')) {
          return res.error(`图片数据第${i + 1}项的URL格式无效`, "更新项目失败", 400);
        }
        
        // 确保图片有必要的字段
        if (!image.uploadedAt) {
          image.uploadedAt = new Date();
        }
        if (!image.uploadedBy) {
          // 如果没有用户信息，使用null而不是无效的ObjectId
          image.uploadedBy = req.user ? req.user._id : null;
        }
        
        // 验证uploadedBy字段（如果存在）
        if (image.uploadedBy && !mongoose.Types.ObjectId.isValid(image.uploadedBy)) {
          return res.error(`图片数据第${i + 1}项的uploadedBy字段必须是有效的ObjectId`, "更新项目失败", 400);
        }
        
        // 验证其他字段类型
        if (image.name && typeof image.name !== 'string') {
          return res.error(`图片数据第${i + 1}项的name字段必须是字符串`, "更新项目失败", 400);
        }
        if (image.description && typeof image.description !== 'string') {
          return res.error(`图片数据第${i + 1}项的description字段必须是字符串`, "更新项目失败", 400);
        }
        
        console.log(`第${i + 1}张图片验证通过`);
      }
      
      console.log("所有图片验证通过");
    }

    // 更新项目
    updateData.updatedBy = req.user ? req.user._id : null;
    updateData.updatedAt = new Date();
    
    // 验证updatedBy字段（如果存在）
    if (updateData.updatedBy && !mongoose.Types.ObjectId.isValid(updateData.updatedBy)) {
      return res.error("updatedBy字段必须是有效的ObjectId", "更新项目失败", 400);
    }

    // 验证项目数据的完整性
    console.log("验证项目数据完整性...");
    if (updateData.name && typeof updateData.name !== 'string') {
      return res.error("项目名称必须是字符串", "更新项目失败", 400);
    }
    if (updateData.description && typeof updateData.description !== 'string') {
      return res.error("项目描述必须是字符串", "更新项目失败", 400);
    }
    if (updateData.progress !== undefined && (typeof updateData.progress !== 'number' || updateData.progress < 0 || updateData.progress > 100)) {
      return res.error("项目进度必须是0-100之间的数字", "更新项目失败", 400);
    }
    if (updateData.priority !== undefined && ![1, 2, 3, 4, 5].includes(updateData.priority)) {
      return res.error("项目优先级必须是1-5之间的数字", "更新项目失败", 400);
    }
    if (updateData.status !== undefined && !['planning', 'active', 'on-hold', 'completed', 'cancelled'].includes(updateData.status)) {
      return res.error("项目状态值无效", "更新项目失败", 400);
    }
    console.log("项目数据验证通过");

    // 添加运行验证选项
    console.log("开始执行数据库更新操作...");
    console.log("更新数据:", JSON.stringify(updateData, null, 2));
    
    let updatedProject;
    try {
      updatedProject = await processModel
        .findByIdAndUpdate(id, updateData, { 
          new: true, 
          runValidators: true,
          context: 'query'
        });
      console.log("数据库更新操作完成");
    } catch (dbError) {
      console.error("数据库更新操作失败:", dbError);
      throw dbError;
    }

    if (!updatedProject) {
      return res.error("项目更新失败，未找到更新后的项目", "更新项目失败", 500);
    }

    // 尝试填充关联字段，如果失败则继续
    console.log("开始填充关联字段...");
    try {
      if (updatedProject.createdBy) {
        await updatedProject.populate("createdBy", "username phone");
        console.log("createdBy字段填充成功");
      }
      if (updatedProject.assignedTo) {
        await updatedProject.populate("assignedTo", "username phone");
        console.log("assignedTo字段填充成功");
      }
      if (updatedProject.updatedBy) {
        await updatedProject.populate("updatedBy", "username phone");
        console.log("updatedBy字段填充成功");
      }
      console.log("所有关联字段填充完成");
    } catch (populateError) {
      console.warn("填充关联字段失败，但项目更新成功:", populateError.message);
      console.warn("错误详情:", populateError);
    }

    console.log("项目更新成功，项目ID:", id, "更新字段:", Object.keys(updateData));
    console.log("更新后的项目数据:", {
      id: updatedProject._id,
      name: updatedProject.name,
      progress: updatedProject.progress,
      imagesCount: updatedProject.images ? updatedProject.images.length : 0,
      updatedAt: updatedProject.updatedAt
    });

    res.success(updatedProject, "更新项目成功");
  } catch (error) {
    console.error("更新项目错误:", error);
    console.error("错误详情:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    
    // 如果是验证错误，返回更详细的错误信息
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.error(`数据验证失败: ${validationErrors.join(', ')}`, "更新项目失败", 400);
    }
    
    // 如果是类型转换错误，返回更详细的错误信息
    if (error.name === 'CastError') {
      return res.error(`数据类型错误: ${error.message}`, "更新项目失败", 400);
    }
    
    // 如果是数据库连接错误
    if (error.name === 'MongoNetworkError' || error.name === 'MongoServerSelectionError') {
      return res.error("数据库连接错误，请稍后重试", "更新项目失败", 503);
    }
    
    // 如果是数据库操作超时
    if (error.name === 'MongoTimeoutError') {
      return res.error("数据库操作超时，请稍后重试", "更新项目失败", 503);
    }
    
    // 如果是其他数据库错误
    if (error.code) {
      console.error("数据库错误代码:", error.code);
    }
    
    // 添加通用错误处理，确保总是返回响应
    try {
      res.error(error.message || "未知错误", "更新项目失败");
    } catch (responseError) {
      console.error("发送错误响应失败:", responseError);
      // 如果连错误响应都发送失败，尝试发送基本的HTTP状态
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: "更新项目失败",
          error: error.message || "未知错误"
        });
      }
    }
  }
});

// 删除项目（软删除）
router.delete("/api/projects/:id", async function (req, res, next) {
  try {
    const { id } = req.params;

    // 验证ObjectId格式
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
      deletedBy: req.user ? req.user._id : null,
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
              req.user ? req.user._id : null
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

            await project.cancel(req.user ? req.user._id : null);

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

// 创建测试用户数据
router.post("/api/users/test-data", async function (req, res, next) {
  try {
    console.log("开始创建测试用户数据");
    
    const testUsers = [
      {
        _id: null,
        username: '张三',
        phone: '13800138001',
        email: 'zhangsan@example.com',
        password: 'password123',
        role: 'user'
      },
      {
        _id: null,
        username: '李四',
        phone: '13800138002', 
        email: 'lisi@example.com',
        password: 'password123',
        role: 'user'
      }
    ];
    
    const createdUsers = [];
    
    for (const userData of testUsers) {
      // 检查用户是否已存在
      const existingUser = await UserModel.findById(userData._id);
      if (!existingUser) {
        const user = new UserModel(userData);
        await user.save();
        createdUsers.push(user);
        console.log('创建用户:', userData.username);
      } else {
        console.log('用户已存在:', userData.username);
      }
    }
    
    res.success(
      {
        message: `检查/创建了 ${testUsers.length} 个测试用户，新创建 ${createdUsers.length} 个`,
        users: createdUsers
      },
      "测试用户数据处理成功",
      201
    );
  } catch (error) {
    console.error("创建测试用户数据错误:", error);
    res.error(error.message, "创建测试用户数据失败");
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
        createdBy: null,
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

// ==================== 合同申请相关接口 ====================

// 创建合同申请
router.post("/api/contracts", async function (req, res, next) {
  try {
    console.log("开始创建合同申请");
    console.log("请求体:", JSON.stringify(req.body, null, 2));

    const {
      applicant,
      project,
      contract,
      financial,
      paymentPlan,
      materials,
      remarks
    } = req.body;

    // 验证必填字段
    if (!applicant || !applicant.name || !applicant.userId) {
      return res.error("申请人信息不完整", "创建合同申请失败", 400);
    }

    if (!project || !project.name) {
      return res.error("项目信息不完整", "创建合同申请失败", 400);
    }

    if (!contract || !contract.name || !contract.partyA || !contract.partyB) {
      return res.error("合同信息不完整", "创建合同申请失败", 400);
    }

    if (!financial || !financial.amountIncludingTax) {
      return res.error("财务信息不完整", "创建合同申请失败", 400);
    }

    // 验证或创建申请人
    let user = await UserModel.findById(applicant.userId);
    if (!user) {
      console.log('用户不存在，自动创建用户:', applicant.userId);
      
      // 自动创建用户
      try {
        user = new UserModel({
          _id: null,
          username: applicant.name || '未知用户',
          phone: '13800138000',
          email: `user_${applicant.userId}@example.com`,
          password: 'default123',
          role: 'user'
        });
        await user.save();
        console.log('用户创建成功:', user.username);
      } catch (createError) {
        console.error('创建用户失败:', createError);
        // 如果创建用户失败，继续执行但记录错误
      }
    }

    // 创建合同申请
    const contractApplication = new contractApplicationModel({
      applicant: {
        name: applicant.name,
        userId: applicant.userId
      },
      project: {
        name: project.name,
        description: project.description || ""
      },
      contract: {
        name: contract.name,
        type: contract.type || "工程合同",
        partyA: {
          name: contract.partyA.name,
          contact: contract.partyA.contact || ""
        },
        partyB: {
          name: contract.partyB.name,
          contact: contract.partyB.contact || ""
        },
        startDate: new Date(contract.startDate),
        endDate: new Date(contract.endDate),
        paymentTerms: contract.paymentTerms || ""
      },
      financial: {
        amountIncludingTax: financial.amountIncludingTax,
        taxRate: financial.taxRate || 0,
        taxAmount: financial.taxAmount || 0,
        amountExcludingTax: financial.amountExcludingTax || 0,
        invoiceType: financial.invoiceType || "增值税普通发票(蓝)"
      },
      paymentPlan: paymentPlan || [],
      materials: materials || [],
      remarks: remarks || "",
      createdBy: req.user ? req.user._id : null
    });

    await contractApplication.save();

    // 返回创建的合同申请（包含关联数据）
    const createdContract = await contractApplicationModel
      .findById(contractApplication._id)
      .populate("applicant.userId", "username phone")
      .populate("createdBy", "username");

    console.log("合同申请创建成功，ID:", contractApplication._id);

    res.success(createdContract, "合同申请创建成功", 201);
  } catch (error) {
    console.error("创建合同申请错误:", error);
    res.error(error.message, "创建合同申请失败");
  }
});

// 获取合同申请列表
router.get("/api/contracts", async function (req, res, next) {
  try {
    console.log("🔍 开始获取合同申请列表");
    console.log("📋 请求参数:", req.query);

    const { page = 1, limit = 10, status, applicantId, keyword } = req.query;
    const skip = (page - 1) * limit;
    
    let query = { isDeleted: false };
    
    if (status) {
      query.status = status;
    }
    
    if (applicantId) {
      query['applicant.userId'] = applicantId;
    }
    
    if (keyword) {
      query.$or = [
        { 'applicant.name': { $regex: keyword, $options: 'i' } },
        { 'project.name': { $regex: keyword, $options: 'i' } },
        { 'contract.name': { $regex: keyword, $options: 'i' } },
        { 'contract.partyA.name': { $regex: keyword, $options: 'i' } },
        { 'contract.partyB.name': { $regex: keyword, $options: 'i' } }
      ];
    }

    console.log("🔍 MongoDB查询条件:", JSON.stringify(query, null, 2));

    // 首先检查数据库中总计有多少条记录
    const totalRecords = await contractApplicationModel.countDocuments({});
    const totalNonDeleted = await contractApplicationModel.countDocuments({ isDeleted: false });
    
    console.log("📊 数据库统计:");
    console.log("  - 总记录数:", totalRecords);
    console.log("  - 未删除记录数:", totalNonDeleted);

    const applications = await contractApplicationModel
      .find(query)
      .populate("applicant.userId", "username phone")
      .populate("createdBy", "username")
      .populate("updatedBy", "username")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await contractApplicationModel.countDocuments(query);

    console.log("📊 查询结果:");
    console.log("  - 符合条件的记录数:", total);
    console.log("  - 返回的记录数:", applications.length);
    
    if (applications.length > 0) {
      console.log("📝 第一条记录示例:", {
        id: applications[0]._id,
        applicant: applications[0].applicant?.name,
        project: applications[0].project?.name,
        contract: applications[0].contract?.name,
        status: applications[0].status
      });
    }

    res.success(
      {
        applications,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      },
      "获取合同申请列表成功"
    );
  } catch (error) {
    console.error("❌ 获取合同申请列表错误:", error);
    res.error(error.message, "获取合同申请列表失败");
  }
});

// 获取合同申请详情
router.get("/api/contracts/:id", async function (req, res, next) {
  try {
    const { id } = req.params;

    console.log("获取合同申请详情，ID:", id);

    // 验证ObjectId格式
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log("无效的ObjectId格式:", id);
      return res.status(400).json({
        success: false,
        code: 400,
        message: "无效的合同申请ID格式",
        data: null,
        timestamp: new Date().toISOString(),
      });
    }

    const application = await contractApplicationModel
      .findOne({ _id: id, isDeleted: false })
      .populate("applicant.userId", "username phone email")
      .populate("createdBy", "username")
      .populate("updatedBy", "username")
      .populate("approval.approvers.userId", "username")
      .populate("approval.approvedBy", "username")
      .populate("approval.rejectedBy", "username")
      .populate("attachments.uploadedBy", "username");

    console.log("查询结果:", application ? "找到合同申请" : "合同申请不存在");

    if (!application) {
      return res.status(404).json({
        success: false,
        code: 404,
        message: "合同申请不存在",
        data: null,
        timestamp: new Date().toISOString(),
      });
    }

    res.success(application, "获取合同申请详情成功");
  } catch (error) {
    console.error("获取合同申请详情错误:", error);
    res.status(500).json({
      success: false,
      code: 500,
      message: error.message,
      data: null,
      timestamp: new Date().toISOString(),
    });
  }
});

// 更新合同申请
router.put("/api/contracts/:id", async function (req, res, next) {
  try {
    const { id } = req.params;

    // 验证ObjectId格式
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.error("无效的合同申请ID格式", "更新合同申请失败", 400);
    }

    console.log("更新合同申请，ID:", id);
    console.log("请求体:", JSON.stringify(req.body, null, 2));

    const updateData = req.body;

    // 查找合同申请
    const application = await contractApplicationModel.findOne({ 
      _id: id, 
      isDeleted: false 
    });

    if (!application) {
      return res.error("合同申请不存在", "更新合同申请失败", 404);
    }

    // 只有草稿状态的申请可以修改
    if (application.status !== '草稿') {
      return res.error("只有草稿状态的申请可以修改", "更新合同申请失败", 400);
    }

    // 更新数据
    updateData.updatedBy = req.user ? req.user._id : application.createdBy;
    updateData.updatedAt = new Date();

    const updatedApplication = await contractApplicationModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate("applicant.userId", "username phone")
      .populate("createdBy", "username")
      .populate("updatedBy", "username");

    console.log("合同申请更新成功");

    res.success(updatedApplication, "合同申请更新成功");
  } catch (error) {
    console.error("更新合同申请错误:", error);
    res.error(error.message, "更新合同申请失败");
  }
});

// 提交审批
router.post("/api/contracts/:id/submit", async function (req, res, next) {
  try {
    const { id } = req.params;
    const { approvers } = req.body;

    console.log("提交合同申请审批，ID:", id);

    // 验证ObjectId格式
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.error("无效的合同申请ID格式", "提交审批失败", 400);
    }

    const application = await contractApplicationModel.findOne({ 
      _id: id, 
      isDeleted: false 
    });

    if (!application) {
      return res.error("合同申请不存在", "提交审批失败", 404);
    }

    if (application.status !== '草稿') {
      return res.error("只有草稿状态的申请可以提交审批", "提交审批失败", 400);
    }

    // 设置审批人
    if (approvers && approvers.length > 0) {
      application.approval.approvers = approvers.map((approver, index) => ({
        userId: approver.userId,
        level: index + 1,
        status: '待审批'
      }));
      application.approval.totalLevels = approvers.length;
    }

    await application.submitForApproval();

    console.log("合同申请提交审批成功");

    res.success(application, "合同申请提交审批成功");
  } catch (error) {
    console.error("提交审批错误:", error);
    res.error(error.message, "提交审批失败");
  }
});

// 审批操作
router.post("/api/contracts/:id/approve", async function (req, res, next) {
  try {
    const { id } = req.params;
    const { action, comments } = req.body;

    console.log("审批合同申请，ID:", id, "操作:", action);

    // 验证ObjectId格式
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.error("无效的合同申请ID格式", "审批操作失败", 400);
    }

    const application = await contractApplicationModel.findOne({ 
      _id: id, 
      isDeleted: false 
    });

    if (!application) {
      return res.error("合同申请不存在", "审批操作失败", 404);
    }

    if (!['待审批', '审批中'].includes(application.status)) {
      return res.error("该申请不在审批状态", "审批操作失败", 400);
    }

    const userId = req.user ? req.user._id : null;

    if (action === 'approve') {
      await application.approve(userId, comments);
    } else if (action === 'reject') {
      await application.reject(userId, comments);
    } else {
      return res.error("无效的审批操作", "审批操作失败", 400);
    }

    console.log("合同申请审批操作成功");

    res.success(application, `合同申请${action === 'approve' ? '审批通过' : '审批拒绝'}成功`);
  } catch (error) {
    console.error("审批操作错误:", error);
    res.error(error.message, "审批操作失败");
  }
});

// 取消申请
router.post("/api/contracts/:id/cancel", async function (req, res, next) {
  try {
    const { id } = req.params;

    console.log("取消合同申请，ID:", id);

    // 验证ObjectId格式
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.error("无效的合同申请ID格式", "取消申请失败", 400);
    }

    const application = await contractApplicationModel.findOne({ 
      _id: id, 
      isDeleted: false 
    });

    if (!application) {
      return res.error("合同申请不存在", "取消申请失败", 404);
    }

    if (application.status === '已批准' || application.status === '已拒绝') {
      return res.error("已审批的申请不能取消", "取消申请失败", 400);
    }

    const userId = req.user ? req.user._id : application.createdBy;
    await application.cancel(userId);

    console.log("合同申请取消成功");

    res.success(application, "合同申请取消成功");
  } catch (error) {
    console.error("取消申请错误:", error);
    res.error(error.message, "取消申请失败");
  }
});

// 删除合同申请（软删除）
router.delete("/api/contracts/:id", async function (req, res, next) {
  try {
    const { id } = req.params;

    console.log("删除合同申请，ID:", id);

    // 验证ObjectId格式
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.error("无效的合同申请ID格式", "删除申请失败", 400);
    }

    const application = await contractApplicationModel.findOne({ 
      _id: id, 
      isDeleted: false 
    });

    if (!application) {
      return res.error("合同申请不存在", "删除申请失败", 404);
    }

    // 软删除
    application.isDeleted = true;
    application.deletedBy = req.user ? req.user._id : application.createdBy;
    application.deletedAt = new Date();
    await application.save();

    console.log("合同申请删除成功");

    res.success(null, "合同申请删除成功");
  } catch (error) {
    console.error("删除申请错误:", error);
    res.error(error.message, "删除申请失败");
  }
});

// 获取待审批的合同申请列表
router.get("/api/contracts/pending/approval", async function (req, res, next) {
  try {
    console.log("获取待审批的合同申请列表");

    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const applications = await contractApplicationModel
      .findPendingApproval()
      .populate("applicant.userId", "username phone")
      .populate("createdBy", "username")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await contractApplicationModel.countDocuments({
      status: { $in: ['待审批', '审批中'] },
      isDeleted: false
    });

    console.log("查询到待审批申请数量:", applications.length);

    res.success(
      {
        applications,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      },
      "获取待审批申请列表成功"
    );
  } catch (error) {
    console.error("获取待审批申请列表错误:", error);
    res.error(error.message, "获取待审批申请列表失败");
  }
});

// 获取合同申请统计数据
router.get("/api/contracts/stats/overview", async function (req, res, next) {
  try {
    console.log("获取合同申请统计数据");

    const stats = await Promise.all([
      contractApplicationModel.countDocuments({ isDeleted: false }),
      contractApplicationModel.countDocuments({ status: '草稿', isDeleted: false }),
      contractApplicationModel.countDocuments({ status: { $in: ['待审批', '审批中'] }, isDeleted: false }),
      contractApplicationModel.countDocuments({ status: '已批准', isDeleted: false }),
      contractApplicationModel.countDocuments({ status: '已拒绝', isDeleted: false })
    ]);

    const result = {
      total: stats[0],
      draft: stats[1],
      pending: stats[2],
      approved: stats[3],
      rejected: stats[4]
    };

    console.log("统计数据:", result);

    res.success(result, "获取统计数据成功");
  } catch (error) {
    console.error("获取统计数据错误:", error);
    res.error(error.message, "获取统计数据失败");
  }
});

// 检查数据库状态和连接
router.get("/api/contracts/debug", async function (req, res, next) {
  try {
    console.log("🔍 开始检查数据库状态...");
    
    // 检查数据库连接
    const mongoose = require('mongoose');
    const dbState = mongoose.connection.readyState;
    const dbStates = {
      0: 'disconnected',
      1: 'connected', 
      2: 'connecting',
      3: 'disconnecting'
    };
    
    console.log("📊 数据库连接状态:", dbStates[dbState]);
    
    // 检查集合是否存在
    const collections = await mongoose.connection.db.listCollections().toArray();
    const contractCollection = collections.find(c => c.name === 'contractApplication');
    
    console.log("📊 数据库集合:");
    console.log("  - 所有集合:", collections.map(c => c.name));
    console.log("  - 合同集合存在:", !!contractCollection);
    
    if (contractCollection) {
      // 检查数据库中的数据
      const totalDocs = await contractApplicationModel.countDocuments({});
      const nonDeletedDocs = await contractApplicationModel.countDocuments({ isDeleted: false });
      const statusStats = await contractApplicationModel.aggregate([
        { $match: { isDeleted: false } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]);
      
      console.log("📊 数据统计:");
      console.log("  - 总文档数:", totalDocs);
      console.log("  - 未删除文档数:", nonDeletedDocs);
      console.log("  - 状态统计:", statusStats);
      
      if (totalDocs > 0) {
        // 获取最近的几条记录作为示例
        const sampleDocs = await contractApplicationModel
          .find({})
          .limit(3)
          .select('applicant project contract status createdAt')
          .lean();
        
        console.log("📝 示例文档:", sampleDocs);
      }
      
      return res.success({
        database: {
          connected: dbState === 1,
          state: dbStates[dbState]
        },
        collection: {
          exists: !!contractCollection,
          name: 'contractApplication'
        },
        data: {
          total: totalDocs,
          nonDeleted: nonDeletedDocs,
          statusStats: statusStats
        }
      }, "数据库状态检查完成");
    } else {
      return res.success({
        database: {
          connected: dbState === 1,
          state: dbStates[dbState]
        },
        collection: {
          exists: false,
          name: 'contractApplication'
        },
        message: "合同申请集合不存在，可能需要创建测试数据"
      }, "数据库状态检查完成");
    }
    
  } catch (error) {
    console.error("❌ 数据库状态检查错误:", error);
    res.error(error.message, "数据库状态检查失败");
  }
});

// 创建测试合同申请数据
router.post("/api/contracts/test-data", async function (req, res, next) {
  try {
    console.log("开始创建测试合同申请数据");

    // 创建多个测试合同申请
    const testContracts = [
      {
        applicant: {
          name: "李想",
          userId: null
        },
        project: {
          name: "某兰公园一区改造工程",
          description: "对某兰公园一区进行整体改造升级"
        },
        contract: {
          name: "某兰公园一区改造工程合同",
          type: "工程合同",
          partyA: {
            name: "大大建设",
            contact: "13800138001"
          },
          partyB: {
            name: "某兰建设有限公司",
            contact: "13800138002"
          },
          startDate: "2021-07-26",
          endDate: "2021-08-23",
          paymentTerms: "按月付款"
        },
        financial: {
          amountIncludingTax: 100000,
          taxRate: 1,
          taxAmount: 990,
          amountExcludingTax: 99001,
          invoiceType: "增值税普通发票(蓝)"
        },
        paymentPlan: [
          {
            date: "2021-08-12",
            amount: 990,
            description: "第一期付款",
            status: "已收款"
          },
          {
            date: "2021-08-20",
            amount: 990,
            description: "第二期付款",
            status: "待收款"
          }
        ],
        materials: [
          {
            name: "钢筋",
            quantity: 1,
            unit: "吨",
            unitPrice: 1000,
            totalPrice: 1000,
            supplier: "某钢铁公司"
          },
          {
            name: "水泥",
            quantity: 1,
            unit: "吨",
            unitPrice: 1000,
            totalPrice: 1000,
            supplier: "某建材公司"
          }
        ],
        remarks: "备注备注备注备注备注备注备注备注备注备注备注备注备注...",
        status: "待审批"
      },
      {
        applicant: {
          name: "张三",
          userId: null
        },
        project: {
          name: "办公楼装修项目",
          description: "对公司办公楼进行装修升级"
        },
        contract: {
          name: "办公楼装修合同",
          type: "工程合同",
          partyA: {
            name: "某装饰公司",
            contact: "13800138003"
          },
          partyB: {
            name: "某建筑公司",
            contact: "13800138004"
          },
          startDate: "2021-09-01",
          endDate: "2021-10-31",
          paymentTerms: "按进度付款"
        },
        financial: {
          amountIncludingTax: 500000,
          taxRate: 3,
          taxAmount: 14563,
          amountExcludingTax: 485437,
          invoiceType: "增值税专用发票"
        },
        paymentPlan: [
          {
            date: "2021-09-15",
            amount: 100000,
            description: "预付款",
            status: "已收款"
          },
          {
            date: "2021-10-15",
            amount: 200000,
            description: "进度款",
            status: "待收款"
          }
        ],
        materials: [
          {
            name: "地板",
            quantity: 100,
            unit: "平方米",
            unitPrice: 200,
            totalPrice: 20000,
            supplier: "某地板公司"
          }
        ],
        remarks: "装修材料需要环保认证",
        status: "草稿"
      }
    ];

    const createdContracts = [];

    for (const contractData of testContracts) {
      const contract = new contractApplicationModel({
        ...contractData,
        createdBy: null,
        createdAt: new Date(
          Date.now() - Math.random() * 60 * 60 * 1000
        ), // 随机创建时间
      });

      await contract.save();
      createdContracts.push(contract);
    }

    console.log("成功创建", createdContracts.length, "个测试合同申请");
    res.success(
      {
        message: `成功创建 ${createdContracts.length} 个测试合同申请`,
        contracts: createdContracts,
      },
      "测试合同申请数据创建成功",
      201
    );
  } catch (error) {
    console.error("创建测试合同申请数据错误:", error);
    res.error(error.message, "创建测试合同申请数据失败");
  }
});

// ==================== 图片上传和管理相关接口 ====================

// 上传项目图片
router.post("/api/projects/:id/images", uploadImage, async function (req, res, next) {
  try {
    const { id } = req.params;
    
    // 验证ObjectId格式
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.error("无效的项目ID格式", "上传图片失败", 400);
    }

    // 查找项目
    const project = await processModel.findOne({ _id: id, isDeleted: false });
    if (!project) {
      return res.error("项目不存在", "上传图片失败", 404);
    }

    if (!req.uploadedFiles || !req.uploadedFiles.image) {
      return res.error("没有上传图片文件", "上传图片失败", 400);
    }

    const uploadedImages = [];
    const imageFiles = Array.isArray(req.uploadedFiles.image) ? req.uploadedFiles.image : [req.uploadedFiles.image];

    for (const file of imageFiles) {
      if (file && file.path) {
        // 生成访问URL
        const fileName = path.basename(file.path);
        const imageUrl = `/uploads/${fileName}`;
        
        // 创建图片记录
        const imageData = {
          url: imageUrl,
          name: file.originalFilename || fileName,
          description: req.formFields.description ? req.formFields.description[0] : "",
          uploadedAt: new Date(),
          uploadedBy: req.user ? req.user._id : null
        };

        uploadedImages.push(imageData);
      }
    }

    if (uploadedImages.length === 0) {
      return res.error("没有有效的图片文件", "上传图片失败", 400);
    }

    // 更新项目的图片数组
    const updatedProject = await processModel
      .findByIdAndUpdate(
        id,
        { 
          $push: { images: { $each: uploadedImages } },
          updatedAt: new Date(),
          updatedBy: req.user ? req.user._id : null
        },
        { new: true }
      )
      .populate("createdBy", "username phone")
      .populate("assignedTo", "username phone")
      .populate("updatedBy", "username phone");

    console.log("项目图片上传成功，项目ID:", id, "上传图片数量:", uploadedImages.length);

    res.success({
      project: updatedProject,
      uploadedImages: uploadedImages
    }, "图片上传成功");

  } catch (error) {
    console.error("上传项目图片错误:", error);
    res.error(error.message, "上传图片失败");
  }
});

// 删除项目图片
router.delete("/api/projects/:id/images/:imageId", async function (req, res, next) {
  try {
    const { id, imageId } = req.params;
    
    // 验证ObjectId格式
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.error("无效的项目ID格式", "删除图片失败", 400);
    }

    // 查找项目
    const project = await processModel.findOne({ _id: id, isDeleted: false });
    if (!project) {
      return res.error("项目不存在", "删除图片失败", 404);
    }

    // 查找要删除的图片
    const imageIndex = project.images.findIndex(img => img._id.toString() === imageId);
    if (imageIndex === -1) {
      return res.error("图片不存在", "删除图片失败", 404);
    }

    const imageToDelete = project.images[imageIndex];
    
    // 删除物理文件
    if (imageToDelete.url && imageToDelete.url.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, "../../public", imageToDelete.url);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log("删除物理文件:", filePath);
      }
    }

    // 从数组中移除图片
    project.images.splice(imageIndex, 1);
    project.updatedAt = new Date();
    project.updatedBy = req.user ? req.user._id : null;
    
    await project.save();

    const updatedProject = await processModel
      .findById(id)
      .populate("createdBy", "username phone")
      .populate("assignedTo", "username phone")
      .populate("updatedBy", "username phone");

    console.log("项目图片删除成功，项目ID:", id, "图片ID:", imageId);

    res.success(updatedProject, "图片删除成功");

  } catch (error) {
    console.error("删除项目图片错误:", error);
    res.error(error.message, "删除图片失败");
  }
});

// 更新项目图片信息
router.put("/api/projects/:id/images/:imageId", async function (req, res, next) {
  try {
    const { id, imageId } = req.params;
    const { name, description } = req.body;
    
    // 验证ObjectId格式
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.error("无效的项目ID格式", "更新图片信息失败", 400);
    }

    // 查找项目
    const project = await processModel.findOne({ _id: id, isDeleted: false });
    if (!project) {
      return res.error("项目不存在", "更新图片信息失败", 404);
    }

    // 查找要更新的图片
    const image = project.images.id(imageId);
    if (!image) {
      return res.error("图片不存在", "更新图片信息失败", 404);
    }

    // 更新图片信息
    if (name !== undefined) image.name = name;
    if (description !== undefined) image.description = description;
    
    project.updatedAt = new Date();
    project.updatedBy = req.user ? req.user._id : null;
    
    await project.save();

    const updatedProject = await processModel
      .findById(id)
      .populate("createdBy", "username phone")
      .populate("assignedTo", "username phone")
      .populate("updatedBy", "username phone");

    console.log("项目图片信息更新成功，项目ID:", id, "图片ID:", imageId);

    res.success(updatedProject, "图片信息更新成功");

  } catch (error) {
    console.error("更新项目图片信息错误:", error);
    res.error(error.message, "更新图片信息失败");
  }
});

// 获取项目图片列表
router.get("/api/projects/:id/images", async function (req, res, next) {
  try {
    const { id } = req.params;
    
    // 验证ObjectId格式
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.error("无效的项目ID格式", "获取图片列表失败", 400);
    }

    // 查找项目
    const project = await processModel.findOne({ _id: id, isDeleted: false })
      .select("images")
      .populate("images.uploadedBy", "username");

    if (!project) {
      return res.error("项目不存在", "获取图片列表失败", 404);
    }

    console.log("获取项目图片列表成功，项目ID:", id, "图片数量:", project.images.length);

    res.success({
      projectId: id,
      images: project.images || []
    }, "获取图片列表成功");

  } catch (error) {
    console.error("获取项目图片列表错误:", error);
    res.error(error.message, "获取图片列表失败");
  }
});

// 批量更新项目图片顺序
router.put("/api/projects/:id/images/reorder", async function (req, res, next) {
  try {
    const { id } = req.params;
    const { imageIds } = req.body; // 新的图片ID顺序数组
    
    if (!Array.isArray(imageIds)) {
      return res.error("图片ID数组格式错误", "更新图片顺序失败", 400);
    }

    // 验证ObjectId格式
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.error("无效的项目ID格式", "更新图片顺序失败", 400);
    }

    // 查找项目
    const project = await processModel.findOne({ _id: id, isDeleted: false });
    if (!project) {
      return res.error("项目不存在", "更新图片顺序失败", 404);
    }

    // 重新排序图片数组
    const reorderedImages = [];
    for (const imageId of imageIds) {
      const image = project.images.find(img => img._id.toString() === imageId);
      if (image) {
        reorderedImages.push(image);
      }
    }

    // 更新项目
    project.images = reorderedImages;
    project.updatedAt = new Date();
    project.updatedBy = req.user ? req.user._id : null;
    
    await project.save();

    const updatedProject = await processModel
      .findById(id)
      .populate("createdBy", "username phone")
      .populate("assignedTo", "username phone")
      .populate("updatedBy", "username phone");

    console.log("项目图片顺序更新成功，项目ID:", id);

    res.success(updatedProject, "图片顺序更新成功");

  } catch (error) {
    console.error("更新项目图片顺序错误:", error);
    res.error(error.message, "更新图片顺序失败");
  }
});

module.exports = router;
