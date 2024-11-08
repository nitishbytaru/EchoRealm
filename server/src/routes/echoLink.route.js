import { Router } from "express";
import {
  getMyFriends,
  getPrivateMessages,
  sendEchoLinkMessage,
} from "../controllers/echoLink.controller.js";
import { isAuthenticated } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

const router = Router();

//unprotected routes

router.use(isAuthenticated);
//protected routes
router.route("/get-myFriends").get(getMyFriends);
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

export default router;
