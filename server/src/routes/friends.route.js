import { Router } from "express";
import {
  blockUser,
  getBlockedUsers,
  unBlockUser,
  sendFriendRequest,
  getMyFriendRequests,
  handleFriendRequest,
  removeOrBlockMyFriend,
} from "../controllers/friendRequests.controller.js";
import { isAuthenticated } from "../middleware/auth.middleware.js";

const router = Router();

//authentication middleware
router.use(isAuthenticated);
router.route("/block-user").get(blockUser);
router.route("/get-blockedUsers").get(getBlockedUsers);
router.route("/send-friend-request").get(sendFriendRequest);
router.route("/un-block").get(unBlockUser);
router.route("/handle-friendRequest").post(handleFriendRequest);
router.route("/remove-block-MyFriend").post(removeOrBlockMyFriend);
router.route("/get-myFriendRequests").get(getMyFriendRequests);

export default router;
