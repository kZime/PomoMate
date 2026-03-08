import jwt from "jsonwebtoken";
import { JWT_SECRET_KEY } from "../config/env.js";

export const authenticateToken = async (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1]; // 获取 Bearer Token

  if (!token) {
    return res.status(401).json({ message: "Token is missing" });
  }

  try {
    const user = jwt.verify(token, JWT_SECRET_KEY); // replace to real password
    req.user = user; 
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

export default { authenticateToken };

