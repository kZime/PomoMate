const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require("cors");

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const testAPIRouter = require("./routes/testAPI");
const mongoDBRouter = require("./routes/mongoDB");
const registerRouter = require("./routes/register");
const loginRouter = require("./routes/login");
const getTasksRouter = require("./routes/getTasks");
const addTaskRouter = require("./routes/addTask");
const deleteTaskRouter = require("./routes/deleteTask");
const editTaskRouter = require("./routes/editTask");

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use("/testAPI", testAPIRouter);
app.use("/mongoDB", mongoDBRouter);
app.use("/register", registerRouter);
app.use("/login", loginRouter);
app.use("/getTasks", getTasksRouter);
app.use("/addTask", addTaskRouter);
app.use("/deleteTask", deleteTaskRouter);
app.use("/editTask", editTaskRouter);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
