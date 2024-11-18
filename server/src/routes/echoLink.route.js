import { Router } from "express";
import {
  getMyPrivateFriends,
  getPrivateMessages,
  sendEchoLinkMessage,
  markLatestMessageAsRead,
  deleteAllMyChatRooms,
  deleteChat,
  deleteChatRoom,
  searchEchoLinkFriends,
} from "../controllers/echoLink.controller.js";
import { isAuthenticated } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

const router = Router();

//unprotected routes

router.use(isAuthenticated);
//protected routes
router.route("/send-echoLinkMessage").post(
  upload.fields([
    {
      name: "attachments",
      maxCount: 1,
    },
  ]),
  sendEchoLinkMessage
);
router.route("/get-myPrivateFriends").get(getMyPrivateFriends);
router.route("/get-privateMessages").get(getPrivateMessages);
router.route("/set-latestMessageAsRead").get(markLatestMessageAsRead);
router.route("/delete-all-chat-rooms").get(deleteAllMyChatRooms);
router.route("/delete-chat/:uniqueChatId").delete(deleteChat);
router.route("/delete-chat-room/:uniqueChatId").delete(deleteChatRoom);
router.route("/searchEchoLinkFriends").get(searchEchoLinkFriends);

export default router;
