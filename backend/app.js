import createError from "http-errors";
import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import cors from "cors";

import indexRouter from "./routes/index.js";
import testAPIRouter from "./routes/testAPI.js";
import mongoDBRouter from "./routes/mongoDB.js";
import routes from "./routes/index.js"; // 导入路由入口文件

const app = express();

// 设置视图引擎
app.set("views", path.resolve("views")); // 使用 path.resolve 替代 __dirname
app.set("view engine", "jade");

// 中间件配置
app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.resolve("public"))); // 使用 path.resolve 替代 __dirname

// 路由挂载
app.use("/api", routes); // API 路由
app.use("/test", testAPIRouter); // 测试 API
app.use("/mongodb", mongoDBRouter); // MongoDB 状态路由
app.use("/", indexRouter); // 根路径路由

// 捕获 404 并转发给错误处理器
app.use((req, res, next) => {
  next(createError(404));
});

// 错误处理器
app.use((err, req, res, next) => {
  // 提供开发环境的错误信息
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // 返回 JSON 错误响应
  if (req.headers["content-type"]?.includes("application/json")) {
    return res.status(err.status || 500).json({
      message: res.locals.message,
      error: res.locals.error,
    });
  }

  // 默认返回 HTML 错误页面
  res.status(err.status || 500);
  res.render("error");
});

export default app;
