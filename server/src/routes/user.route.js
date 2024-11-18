import { Router } from "express";
import {
  getProfile,
  loginUser,
  logoutUser,
  registerUser,
  blockUser,
  getBlockedUsers,
  unBlockUser,
  getSelectedUserProfileDetails,
  updateCurrUserData,
  deleteMyAccount,
  getSelectedUserProfile,
  sendFriendRequest,
  getMyFriendRequests,
  handleFriendRequest,
  removeOrBlockMyFriend,
} from "../controllers/user.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import { isAuthenticated } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/signin").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
  ]),
  registerUser
);

router.route("/login").post(loginUser);

//authentication middleware
router.use(isAuthenticated);

router.route("/get-profile").get(getProfile);
router.route("/get-selected-profile").get(getSelectedUserProfile);
router.route("/logout").get(logoutUser);
router.route("/block-user").get(blockUser);
router.route("/get-blockedUsers").get(getBlockedUsers);
router.route("/send-friend-request").get(sendFriendRequest);
router.route("/un-block").get(unBlockUser);
router.route("/update-userdata").post(updateCurrUserData);
router.route("/handle-friendRequest").post(handleFriendRequest);
router.route("/remove-block-MyFriend").post(removeOrBlockMyFriend);
router.route("/delete-my-account").get(deleteMyAccount);
router.route("/get-myFriendRequests").get(getMyFriendRequests);
router
  .route("/get-selected-profile-details")
  .get(getSelectedUserProfileDetails);

export default router;
