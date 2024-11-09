// echoShout.controller.js
import { io } from "../index.js";
import { User } from "../models/user.model.js";
import { EchoLink } from "../models/echoLink.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";

export const getMyPrivateFriends = asyncHandler(async (req, res) => {
  let myPrivateFriendsIds = [];

  // Fetch chat rooms that contain the user's ID in uniqueChatId
  const myPrivateChatRooms = await EchoLink.find({
    uniqueChatId: { $regex: req.user },
  });

  // Extract friend IDs by removing the user's ID and hyphen from uniqueChatId
  myPrivateChatRooms.forEach((chatRoom) => {
    const friendId = chatRoom?.uniqueChatId
      .replace(req.user, "")
      .replace("-", "");
    myPrivateFriendsIds.push(friendId);
  });

  // Fetch friend documents using the extracted IDs
  const myPrivateFriends = await User.find({
    _id: { $in: myPrivateFriendsIds },
  })
    .select("-password")
    .lean();

  // For each friend, fetch the latest message asynchronously
  const myPrivateFriendsWithMessages = await Promise.all(
    myPrivateFriends.map(async (friend) => {
      const latestMessage = await EchoLink.findOne({
        uniqueChatId: [friend._id, req.user].sort().join("-"),
      });

      // Attach the latest message to the friend document, if found
      return {
        ...friend,
        latestMessage: latestMessage?.messages?.at(-1) || null,
      };
    })
  );

  return res
    .status(202)
    .json({ message: "Fetched your friends", myPrivateFriendsWithMessages });
});

export const sendEchoLinkMessage = asyncHandler(async (req, res) => {
  let attachments = null;
  const { receiver, message } = req.body;
  const sender = req.user;

  //take this unique chat id from the frontend later
  const uniqueChatId = [sender, receiver].sort().join("-");

  if (!message) return res.status(405).json({ message: "enter a message" });

  if (!receiver || !sender)
    return res.status(406).json({ message: "could not send the message" });

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

  const newMessage = {
    message,
    receiver,
    sender,
    attachments: {
      url: attachments?.url,
      publicId: attachments?.public_id,
    },
  };

  const updatedEchoLinkMessage = await EchoLink.findOneAndUpdate(
    { uniqueChatId },
    {
      $setOnInsert: { uniqueChatId },
      $push: { messages: newMessage },
    },
    { new: true, upsert: true }
  );

  const latestEchoLinkMessage = updatedEchoLinkMessage?.messages?.at(-1);

  io.emit("send_latest_echoLink_message", latestEchoLinkMessage);


  return res
    .status(202)
    .json({ message: "message sent succesfully", latestEchoLinkMessage });
});

export const getPrivateMessages = asyncHandler(async (req, res) => {
  const { uniqueChatId } = req.query;

  if (!uniqueChatId) {
    res
      .status(403)
      .json({ message: "uniqueChatId is required to retrieve your messages" });
  }

  const privateMessages = await EchoLink.findOne({ uniqueChatId });

  res.status(203).json({
    message: "Private messages retrieved successfully",
    privateMessages,
  });
});
