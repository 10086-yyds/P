var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
var config = require('./config/config');
var database = require('./db/database');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var wxyRouter = require('./routes/wxy');
var app = express();

// 设置环境变量
app.set('env', process.env.NODE_ENV || 'development');

// 连接数据库
database.connect().catch(err => {
  console.error('数据库连接失败:', err.message);
  // 在开发环境中可以选择退出进程，生产环境中可以继续运行
  if (process.env.NODE_ENV === 'production') {
    console.error('生产环境数据库连接失败，应用将退出');
    process.exit(1);
  }
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// 根据环境配置日志
app.use(logger(config.logging.format));

// 配置CORS - 允许前端跨域访问
app.use(cors({
  origin: config.security.cors.origin,
  credentials: config.security.cors.credentials,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));
app.use(cookieParser());

// 统一API响应格式中间件
app.use((req, res, next) => {
  // 成功响应方法
  res.success = (data = null, message = '操作成功', code = 200) => {
    res.status(200).json({
      success: true,
      code,
      message,
      data,
      timestamp: new Date().toISOString()
    });
  };

  // 错误响应方法
  res.error = (message = '操作失败', code = 500, data = null) => {
    res.status(code >= 100 && code < 600 ? code : 500).json({
      success: false,
      code,
      message,
      data,
      timestamp: new Date().toISOString()
    });
  };

  next();
});

// 静态文件服务
app.use(express.static(path.join(__dirname, 'public')));

// 开发环境添加额外的调试信息
if (app.get('env') === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
  });
}

// 生产环境添加安全头
if (app.get('env') === 'production') {
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });
}

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/wxy', wxyRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // 根据环境记录错误
  if (req.app.get('env') === 'development') {
    console.error('Error:', err);
  } else {
    // 生产环境只记录错误信息，不暴露堆栈
    console.error('Error:', err.message);
  }

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
