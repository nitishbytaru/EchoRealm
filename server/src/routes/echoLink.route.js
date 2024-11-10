import { Router } from "express";
import {
  getMyPrivateFriends,
  getPrivateMessages,
  sendEchoLinkMessage,
  markLatestMessageAsRead,
} from "../controllers/echoLink.controller.js";
import { isAuthenticated } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

const router = Router();

//unprotected routes

router.use(isAuthenticated);
//protected routes
router.route("/get-myPrivateFriends").get(getMyPrivateFriends);
router.route("/send-echoLinkMessage").post(
  upload.fields([
    {
      name: "attachments",
      maxCount: 1,
    },
  ]),
  sendEchoLinkMessage
);
router.route("/get-privateMessages").get(getPrivateMessages);
router.route("/set-latestMessageAsRead").get(markLatestMessageAsRead);

export default router;
