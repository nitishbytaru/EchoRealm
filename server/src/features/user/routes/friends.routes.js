import { Router } from "express";
import {
  getBlockedUsers,
  unBlockUser,
  sendFriendRequest,
  getMyFriendRequests,
  handleFriendRequest,
  removeOrBlockMyFriend,
  getMyFriendList,
} from "../controller/friend_requests.controller.js";
import { isAuthenticated } from "../../../middleware/auth.middleware.js";

const router = Router();

//authentication middleware
router.use(isAuthenticated);
router.route("/requests/:senderId").patch(sendFriendRequest);
router.route("/requests").get(getMyFriendRequests);
router.route("/friends").get(getMyFriendList);

router.route("/blockedUsers").get(getBlockedUsers);
router.route("/blockedUsers/unblock/:userId").patch(unBlockUser);

router.route("/requests").put(handleFriendRequest);
router.route("/remove-or-block").put(removeOrBlockMyFriend);

export default router;
