// {{ AURA-X: Add - 加载环境变量支持GitHub OAuth配置. }}
require("dotenv").config();

var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");
var config = require("./config/config");
var database = require("./db/database");

// 先连接数据库，再注册模型
database.connect().then(() => {
  console.log('🔗 尝试加载数据库模型...');
  try {
    require("./db/model");
    console.log('✅ 数据库模型加载成功');
  } catch (error) {
    console.log('⚠️  数据库模型加载失败，某些功能可能不可用:', error.message);
  }
}).catch((error) => {
  console.log('⚠️  数据库连接失败，应用将在受限模式下运行');
  console.log('❌ 详细错误:', error.message);
});

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var jbhRouter = require("./routes/jbh/index");
var lzRouter = require("./routes/lz/index");
var wxyRouter = require("./routes/wxy/index");
var zjfRouter = require("./routes/zjf/index");

var app = express();

// 设置环境变量
app.set("env", process.env.NODE_ENV || "development");

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

// 根据环境配置日志
app.use(logger(config.logging.format));

// 核心：使用官方 cors 中间件（硬编码配置确保工作）
app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"], // 直接硬编码前端地址
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "X-Timestamp",
    ],
    optionsSuccessStatus: 200, // 兼容旧浏览器
  })
);

// 调试中间件：打印CORS头信息
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} - Origin: ${req.headers.origin}`);
  console.log("Response headers:", res.getHeaders());
  next();
});

// 解析请求体
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: false, limit: "10mb" }));
app.use(cookieParser());

// 统一API响应格式中间件
app.use((req, res, next) => {
  res.success = (data = null, message = "操作成功", code = 200) => {
    res.status(200).json({
      success: true,
      code,
      message,
      data,
      timestamp: new Date().toISOString(),
    });
  };

  res.error = (message = "操作失败", code = 500, data = null) => {
    res.status(code >= 100 && code < 600 ? code : 500).json({
      success: false,
      code,
      message,
      data,
      timestamp: new Date().toISOString(),
    });
  };

  next();
});

// 静态文件服务
app.use(express.static(path.join(__dirname, "public")));

// 开发环境调试信息
if (app.get("env") === "development") {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
  });
}

// 生产环境安全头
if (app.get("env") === "production") {
  app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    next();
  });
}

// 路由挂载
app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/jbh", jbhRouter);
app.use("/lz", lzRouter);
app.use("/wxy", wxyRouter);
app.use("/zjf", zjfRouter); // 确保 /zjf 路由正确挂载

app.use(function (req, res, next) {
  next(createError(404));
});

// 错误处理
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  if (req.app.get("env") === "development") {
    console.error("Error:", err);
  } else {
    console.error("Error:", err.message);
  }

  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
