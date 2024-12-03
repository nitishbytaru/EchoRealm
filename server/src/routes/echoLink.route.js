import { Router } from "express";
import { upload } from "../middleware/multer.middleware.js";
import { isAuthenticated } from "../middleware/auth.middleware.js";
import {
  getMyPrivateFriends,
  getPrivateMessages,
  sendEchoLinkMessage,
  markLatestMessageAsRead,
  deleteAllMyChatRooms,
  deleteChat,
  deleteChatRoom,
  searchEchoLinkFriends,
  createNewGroupChat,
  getGroupChatDetails,
  sendGroupChatMessage,
} from "../controllers/echoLink.controller.js";

const router = Router();

router.use(isAuthenticated);
//protected routes
router
  .route("/message")
  .post(
    upload.fields([{ name: "attachments", maxCount: 1 }]),
    sendEchoLinkMessage
  );
router.route("/friends/private").get(getMyPrivateFriends);
router.route("/messages/:roomId").get(getPrivateMessages);
router.route("/messages/:roomId/read").get(markLatestMessageAsRead);
router.route("/friends/search/:roomId").get(searchEchoLinkFriends);
router.route("/chatRooms").delete(deleteAllMyChatRooms);
router.route("/chats/:roomId").delete(deleteChat);
router.route("/chatRoom/:roomId").delete(deleteChatRoom);

//groupchats
router
  .route("/groupChat/create")
  .post(
    upload.fields([{ name: "groupProfilePicture", maxCount: 1 }]),
    createNewGroupChat
  );
router.route("/groupChat/:groupId").get(getGroupChatDetails);
router
  .route("/groupChat/messages/send")
  .post(
    upload.fields([{ name: "attachments", maxCount: 1 }]),
    sendGroupChatMessage
  );

export default router;
