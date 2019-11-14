var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var FilewStore = require('session-file-store')(session);
var flash = require('connect-flash');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
//app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static('views'));
app.use(flash());
app.use(session({
  secret: '@#@$MYSIGN#@$#$',
  resave: false,
  saveUninitialized: true,
//  store: new FilewStore()
}));

var passport = require('./public/passport')(app);
var authRouter = require('./routes/auth')(passport);
var userMainRouter = require('./routes/userMain');
var adminMainRouter = require('./routes/adminMain');
app.use('/', userMainRouter);
app.use('/admin', adminMainRouter);
app.use('/auth', authRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  res.render('subPage/404.ejs')
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  console.log("Server Error!! =====\n"+ err);
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
