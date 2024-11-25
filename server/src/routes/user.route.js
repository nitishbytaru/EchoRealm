import { Router } from "express";
import {
  getSelectedUserProfileDetails,
  updateCurrUserData,
  deleteMyAccount,
  getSelectedUserProfile,
  searchUsers,
  searchUserById,
  getMostLikedMumbleWithLikesAndFriends,
} from "../controllers/user.controller.js";
import { isAuthenticated } from "../middleware/auth.middleware.js";

const router = Router();

//authentication middleware
router.use(isAuthenticated);
router
  .route("/get-mumble-likes-friends")
  .get(getMostLikedMumbleWithLikesAndFriends);
router.route("/search-user-by-id").get(searchUserById);
router.route("/search").get(searchUsers);
router.route("/get-selected-profile").get(getSelectedUserProfile);
router.route("/update-userdata").post(updateCurrUserData);
router.route("/delete-my-account").get(deleteMyAccount);
router
  .route("/get-selected-profile-details")
  .get(getSelectedUserProfileDetails);

export default router;
