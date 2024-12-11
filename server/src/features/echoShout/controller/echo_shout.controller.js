import { io } from "../../../index.js";
import { EchoShout } from "../models/echo_shout.model.js";
import { User } from "../../user/models/user.model.js";
import { asyncHandler } from "../../../utils/async_handler.js";
import { uploadToCloudinary } from "../../../config/cloudinary/cloudinary.js";

export const getMessages = asyncHandler(async (req, res) => {
  const { page = 1, limit = 7 } = req.query;
  const messages = await EchoShout.find();

  const totalMessages = messages.length;
  const startIndex = Math.max(totalMessages - page * limit, 0);
  const endIndex = Math.max(totalMessages - (page - 1) * limit, 0);

  const paginatedMessages = messages.slice(startIndex, endIndex);

  res.status(200).json({
    message: "Messages retrieved successfully",
    messages: paginatedMessages,
    totalMessages,
    currentPage: parseInt(page, 10),
    hasMoreMessages: startIndex > 0,
  });
});

export const sendMessage = asyncHandler(async (req, res) => {
  let attachments = null;
  let { message, mentions } = req.body;
  if (mentions) {
    mentions = JSON.parse(mentions);
  }
  let sender = await User.findById(req.user).select("-password");

  if (!sender?.isAnonymous) {
    sender = sender.username;
  } else {
    sender = "anonymous";
  }

  if (!message || !sender)
    return res.status(405).json({ message: "enter a message" });

  if (req.files.attachments) {
    const attachmentsLocalPath = req.files?.attachments[0]?.path;

    if (!attachmentsLocalPath) {
      return res.status(400).json({ message: "Avatar file is required" });
    }

    attachments = await uploadToCloudinary(attachmentsLocalPath);

    if (!attachments) {
      return res.status(400).json({ message: "Avatar file is required" });
    }
  }

  const createdMessage = await EchoShout.create({
    message,
    mentions,
    attachments: { url: attachments?.url, publicId: attachments?.public_id },
    sender,
    mentions,
  });

  const latestEchoShoutMessage = await EchoShout.findById(createdMessage._id)
    .populate("sender", "username")
    .populate("mentions", "username");

  io.emit("send_latest_echoShout_message", latestEchoShoutMessage);

  return res
    .status(202)
    .json({ message: "message sent succesfully", latestEchoShoutMessage });
});

export const deleteMyMessagesInEchoShout = asyncHandler(async (req, res) => {
  await EchoShout.deleteMany({ sender: req.user });
  res.status(204).json({ message: "all messages form you are deleted" });
});
