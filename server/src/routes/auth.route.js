import { Router } from "express";
import {
  getProfile,
  loginUser,
  logoutUser,
  registerUser,
} from "../controllers/auth.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import { isAuthenticated } from "../middleware/auth.middleware.js";

const router = Router();

router
  .route("/register")
  .post(upload.fields([{ name: "avatar", maxCount: 1 }]), registerUser);
router.route("/login").post(loginUser);

//authentication middleware
router.use(isAuthenticated);
router.route("/profile").get(getProfile);
router.route("/logout").get(logoutUser);

export default router;
