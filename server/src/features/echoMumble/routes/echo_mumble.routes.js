import { Router } from "express";
import {
  getMumbles,
  sendMumble,
  deleteMumble,
  pinMumble,
  likeThisMumble,
  deleteRecievedMumbles,
  deleteSentMumbles,
  setMumblesAsRead,
} from "../controller/echo_mumble.controller.js";
import { isAuthenticated } from "../../../middleware/auth.middleware.js";
const router = Router();

router.use(isAuthenticated);
//protected routes

router.route("/mumbles").get(getMumbles);
router.route("/pin/:mumbleId").patch(pinMumble);
router.route("/like/:mumbleId").patch(likeThisMumble);
router.route("/mumbles").post(sendMumble);
router.route("/mumbles").patch(setMumblesAsRead);
router.route("/:mumbleId").delete(deleteMumble);
router.route("/recieved").delete(deleteRecievedMumbles);
router.route("/sent").delete(deleteSentMumbles);

export default router;
