import { Router } from "express";
import {
  getMumbles,
  sendMumble,
  deleteMumble,
  pinMumble,
  likeThisMumble,
  deleteRecievedMumbles,
  deletesentMumbles,
  setMumblesAsRead,
} from "../controllers/echoMumble.controller.js";
import { isAuthenticated } from "../middleware/auth.middleware.js";
const router = Router();

router.use(isAuthenticated);
//protected routes
router.route("/get-Mumbles").get(getMumbles);
router.route("/delete-Mumble").delete(deleteMumble);
router.route("/send-Mumble").post(sendMumble);
router.route("/pin-Mumble").get(pinMumble);
router.route("/like-Mumble").get(likeThisMumble);
router.route("/delete-recieved-Mumbles").get(deleteRecievedMumbles);
router.route("/delete-sent-Mumbles").get(deletesentMumbles);
router.route("/set-mumbles-read").get(setMumblesAsRead);

export default router;
