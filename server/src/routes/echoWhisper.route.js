import { Router } from "express";
import {
  searchUsers,
  sendWhisper,
} from "../controllers/echoWhisper.controller.js";
import { isAuthenticated } from "../middleware/auth.middleware.js";
const router = Router();

//unprotected routes
router.route("/send-whisper").post(sendWhisper);
router.route("/search").get(searchUsers);


router.use(isAuthenticated);
//protected routes

export default router;
