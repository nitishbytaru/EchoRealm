import { Router } from "express";
import {
  getUsersWithMumbles,
  updateCurrUserData,
  deleteMyAccount,
  searchUsers,
  searchUserById,
  getMostLikedMumbleWithLikesAndFriends,
} from "../controller/user.controller.js";
import { upload } from "../../../middleware/multer.middleware.js";
import { isAuthenticated } from "../../../middleware/auth.middleware.js";

const router = Router();

//authentication middleware
router.use(isAuthenticated);
router
  .route("/mumble/:userId/likes-friends")
  .get(getMostLikedMumbleWithLikesAndFriends);
router.route("/search/:userId").get(searchUserById);
router.route("/search/:username").get(searchUsers);
router.route("/user/:userId").get(getUsersWithMumbles);
router
  .route("/user")
  .patch(upload.fields([{ name: "avatar", maxCount: 1 }]), updateCurrUserData);
router.route("/account").delete(deleteMyAccount);

export default router;
