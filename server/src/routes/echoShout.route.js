import { Router } from "express";
import {
  getMessages,
  sendMessage,
} from "../controllers/echoShout.controller.js";
import { isAuthenticated } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

const router = Router();

//unprotected routes
router.route("/get-messages").get(getMessages);

router.use(isAuthenticated);
//protected routes
router.route("/send-message").post(
  upload.fields([
    {
      name: "attachments",
      maxCount: 1,
    },
  ]),
  sendMessage
);

export default router;
