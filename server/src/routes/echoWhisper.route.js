import { Router } from "express";
import {
  getWhispers,
  searchUsers,
  sendWhisper,
  deleteWhisper
} from "../controllers/echoWhisper.controller.js";
import { isAuthenticated } from "../middleware/auth.middleware.js";
const router = Router();

//unprotected routes
router.route("/send-whisper").post(sendWhisper);
router.route("/search").get(searchUsers);


router.use(isAuthenticated);
//protected routes
router.route("/get-whispers").get(getWhispers);
router.route("/delete-whisper").delete(deleteWhisper);

export default router;
