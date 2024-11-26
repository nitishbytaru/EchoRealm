import { Router } from "express";
import {
  getBlockedUsers,
  unBlockUser,
  sendFriendRequest,
  getMyFriendRequests,
  handleFriendRequest,
  removeOrBlockMyFriend,
  getMyFriendList,
} from "../controllers/friendRequests.controller.js";
import { isAuthenticated } from "../middleware/auth.middleware.js";

const router = Router();

//authentication middleware
router.use(isAuthenticated);
router.route("/send-request/:senderId").get(sendFriendRequest);
router.route("/friend-requests").get(getMyFriendRequests);
router.route("/friends-list").get(getMyFriendList);

router.route("/blocked-users").get(getBlockedUsers);
router.route("/blocked-users/unblock/:userId").get(unBlockUser);

router.route("/friend-request").put(handleFriendRequest);
router.route("/friends/remove-or-block").put(removeOrBlockMyFriend);

export default router;
