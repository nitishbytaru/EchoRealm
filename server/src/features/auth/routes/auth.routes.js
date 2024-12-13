import { Router } from "express";
import {
  getProfile,
  loginUser,
  logoutUser,
  registerUser,
} from "../controller/auth.controller.js";
import { upload } from "../../../middleware/multer.middleware.js";
import { isAuthenticated } from "../../../middleware/auth.middleware.js";

const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);

//authentication middleware
router.use(isAuthenticated);
router.route("/profile").get(getProfile);
router.route("/logout").post(logoutUser);

export default router;
