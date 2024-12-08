import { Router } from "express";
import {
  getMessages,
  sendMessage,
  deleteMyMessagesInEchoShout,
} from "../controller/echo_shout.controller.js";
import { isAuthenticated } from "../../../middleware/auth.middleware.js";
import { upload } from "../../../middleware/multer.middleware.js";

const router = Router();

//unprotected routes
router.route("/messages").get(getMessages);

router.use(isAuthenticated);
//protected routes
router.route("/message").post(
  upload.fields([
    {
      name: "attachments",
      maxCount: 1,
    },
  ]),
  sendMessage
);
router.route("/messages").delete(deleteMyMessagesInEchoShout);

export default router;
