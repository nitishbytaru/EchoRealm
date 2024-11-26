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

router.use(isAuthenticated);
//protected routes
router
  .route("/message")
  .post(
    upload.fields([{ name: "attachments", maxCount: 1 }]),
    sendEchoLinkMessage
  );
router.route("/private-friends").get(getMyPrivateFriends);
router.route("/messages/:roomId").get(getPrivateMessages);
router.route("/messages/:roomId/read").get(markLatestMessageAsRead);
router.route("/friends/search/:roomId").get(searchEchoLinkFriends);
router.route("/chatRooms").delete(deleteAllMyChatRooms);
router.route("/chats/:roomId").delete(deleteChat);
router.route("/chatRoom/:roomId").delete(deleteChatRoom);

export default router;
