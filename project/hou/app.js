var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var config = require('./config/config');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// 设置环境变量
app.set('env', process.env.NODE_ENV || 'development');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// 根据环境配置日志
app.use(logger(config.logging.format));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

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

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
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
