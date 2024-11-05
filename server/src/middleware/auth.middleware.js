import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";

const isAuthenticated = asyncHandler(async (req, res, next) => {
  const token = req.cookies["echo-token"];

  if (!token) return res.status(408).json({ message: "User not authenticated" });

  const decodedData = jwt.verify(token, process.env.JWT_SECRET);

  req.user = decodedData._id;

  next();
});

export { isAuthenticated };
