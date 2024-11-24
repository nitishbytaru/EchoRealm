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
router.route("/get-blockedUsers").get(getBlockedUsers);
router.route("/send-friend-request").get(sendFriendRequest);
router.route("/un-block").get(unBlockUser);
router.route("/handle-friendRequest").post(handleFriendRequest);
router.route("/remove-block-MyFriend").post(removeOrBlockMyFriend);
router.route("/get-myFriendRequests").get(getMyFriendRequests);
router.route("/get-myFriendList").get(getMyFriendList);

export default router;
