import { EchoShout } from "../models/echoShout.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";

export const sendMessage = asyncHandler(async (req, res) => {
  let attachments = null;
  const { message, mentions } = req.body;
  const sender = req.user;

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
  });

  return res
    .status(202)
    .json({ message: "message sent succesfully", createdMessage });
});

export const getMessages = asyncHandler(async (req, res) => {
  const messages = await EchoShout.find().populate("sender", "username");
  res.json({ messages });
});
