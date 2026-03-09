import createError from "http-errors";
import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import cors from "cors";

import indexRouter from "./routes/index.js";
import testAPIRouter from "./routes/testAPI.js";
import mongoDBRouter from "./routes/mongoDB.js";
import routes from "./routes/index.js";

const app = express();

app.set("views", path.resolve("views"));
app.set("view engine", "jade");

app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.resolve("public")));

app.use("/api", routes);
app.use("/test", testAPIRouter);
app.use("/mongodb", mongoDBRouter);
app.use("/", indexRouter);

app.use((req, res, next) => {
  next(createError(404));
});

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  if (req.headers["content-type"]?.includes("application/json")) {
    return res.status(err.status || 500).json({
      message: res.locals.message,
      error: res.locals.error,
    });
  }

  res.status(err.status || 500);
  res.render("error");
});

export default app;
