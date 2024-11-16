// echoShout.controller.js
import { io } from "../index.js";
import { User } from "../models/user.model.js";
import { EchoLink } from "../models/echoLink.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";

export const getMyPrivateFriends = asyncHandler(async (req, res) => {
  const response = await User.findById(req.user);

  const blockedUsersForThisCurrentUser = response?.blockedUsers;

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
    _id: { $in: myPrivateFriendsIds, $nin: blockedUsersForThisCurrentUser },
  })
    .select("_id username avatar")
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
        uniqueChatId: [friend._id, req.user].sort().join("-"),
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
    messageStatus: "sent",
  };

  const latestEchoLinkMessage = await EchoLink.findOneAndUpdate(
    { uniqueChatId },
    {
      $setOnInsert: { uniqueChatId },
      $push: { messages: newMessage },
      $set: { latestMessage: newMessage },
    },
    { new: true, upsert: true }
  ).select("latestMessage uniqueChatId");

  const receiverData = await User.findById(receiver)
    .select("_id username avatar")
    .lean();

  const senderData = await User.findById(sender)
    .select("_id username avatar")
    .lean();

  receiverData["latestMessage"] = latestEchoLinkMessage.latestMessage;
  receiverData["uniqueChatId"] = latestEchoLinkMessage.uniqueChatId;
  senderData["latestMessage"] = latestEchoLinkMessage.latestMessage;
  senderData["uniqueChatId"] = latestEchoLinkMessage.uniqueChatId;

  io.to(uniqueChatId).emit("send_latest_echoLink_message", receiverData);
  io.emit("new_privte_message_received", senderData);

  return res
    .status(202)
    .json({ message: "message sent succesfully", receiverData });
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

export const markLatestMessageAsRead = asyncHandler(async (req, res) => {
  const { uniqueChatId } = req.query;

  if (!uniqueChatId) {
    return res
      .status(403)
      .json({ message: "uniqueChatId is required to retrieve your messages" });
  }

  const privateMessages = await EchoLink.findOneAndUpdate(
    { uniqueChatId },
    { $set: { "latestMessage.messageStatus": "read" } },
    { new: true }
  );

  const messagesArrayUpdate = await EchoLink.findOneAndUpdate(
    { uniqueChatId },
    { $set: { "messages.$[].messageStatus": "read" } },
    { new: true }
  );

  res.status(200).json({
    message: "Latest message status updated to 'read' successfully",
    privateMessages,
  });
});

export const deleteAllMyChatRooms = asyncHandler(async (req, res) => {
  // Fetch chat rooms that contain the user's ID in uniqueChatId
  await EchoLink.deleteMany({
    uniqueChatId: { $regex: req.user },
  });

  return res.status(202).json({ message: "Deleted all your chats" });
});
