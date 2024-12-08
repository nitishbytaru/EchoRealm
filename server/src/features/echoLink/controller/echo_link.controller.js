// echoShout.controller.js
import mongoose from "mongoose";
import { io } from "../../../index.js";
import { User } from "../../user/models/user.model.js";
import { EchoLink } from "../models/echo_link.model.js";
import { UserFriend } from "../../user/models/friends.model.js";
import { asyncHandler } from "../../../utils/async_handler.js";
import { uploadToCloudinary } from "../../../config/cloudinary/cloudinary.js";
import { GroupChatRoom } from "../models/group_chat_room.model.js";

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
    receiver: { receiverId: receiver },
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

export const getMyPrivateFriends = asyncHandler(async (req, res) => {
  const userId = new mongoose.Types.ObjectId(req.user);

  const { blockedUsers } = await User.findById(userId);

  const blockedUsersForThisCurrentUser = blockedUsers || [];

  let myPrivateFriendsIds = [];

  const groupChats = await GroupChatRoom.find({
    groupChatRoomMembers: { $in: [userId] },
  })
    .populate({
      path: "groupChatRoomMembers",
      select: "username",
    })
    .populate({
      path: "admin",
      select: "username",
    });

  // Fetch chat rooms that contain the user's ID in uniqueChatId
  const myPrivateChatRooms = await EchoLink.find({
    uniqueChatId: { $regex: userId },
  });

  // Extract friend IDs by removing the user's ID and hyphen from uniqueChatId
  myPrivateChatRooms.forEach((chatRoom) => {
    const friendId = chatRoom?.uniqueChatId
      .replace(userId, "")
      .replace("-", "");
    myPrivateFriendsIds.push(friendId);
  });

  // Fetch friend documents using the extracted IDs
  const myPrivateFriends = await User.find({
    _id: { $in: myPrivateFriendsIds, $nin: blockedUsersForThisCurrentUser },
  })
    .select("_id username avatar updatedAt")
    .lean();

  // For each friend, fetch the latest message asynchronously
  let myPrivateFriendsWithMessages = await Promise.all(
    myPrivateFriends.map(async (friend) => {
      const latestMessage = await EchoLink.findOne({
        uniqueChatId: [friend._id, userId].sort().join("-"),
      });

      // Attach the latest message to the friend document, if found
      return {
        ...friend,
        uniqueChatId: [friend._id, userId].sort().join("-"),
        latestMessage: latestMessage?.messages?.at(-1) || null,
      };
    })
  );

  const roomswithPrivateChats = [
    ...myPrivateFriendsWithMessages,
    ...groupChats,
  ];

  return res.status(202).json({
    message: "Fetched your friends",
    myPrivateFriendsWithMessages: roomswithPrivateChats,
  });
});

export const markLatestMessageAsRead = asyncHandler(async (req, res) => {
  const { roomId } = req.params;

  if (!roomId) {
    return res
      .status(403)
      .json({ message: "roomId is required to retrieve your messages" });
  }

  const privateMessages = await EchoLink.findOneAndUpdate(
    { uniqueChatId: roomId },
    { $set: { "latestMessage.receiver.messageStatus": "read" } },
    { new: true }
  );

  const messagesArrayUpdate = await EchoLink.findOneAndUpdate(
    { uniqueChatId: roomId },
    { $set: { "messages.$[].receiver.messageStatus": "read" } },
    { new: true }
  );

  res.status(200).json({
    message: "Latest message status updated to 'read' successfully",
    privateMessages,
  });
});

export const searchEchoLinkFriends = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const userId = req.user;

  const { friends, blockedUsers } = await UserFriend.findOne({ userId });

  if (!roomId) {
    return res.status(400).json({ message: "Search query is required" });
  }

  let searchedUsers = await User.find({
    username: { $regex: roomId, $options: "i" },
    _id: {
      $in: friends,
      $nin: [...blockedUsers, req.user],
    },
  }).limit(5);

  res.status(203).json({ searchedUsers });
});

export const getPrivateMessages = asyncHandler(async (req, res) => {
  const { roomId } = req.params;

  if (!roomId) {
    res
      .status(403)
      .json({ message: "roomId is required to retrieve your messages" });
  }

  const privateMessages = await EchoLink.findOne({ uniqueChatId: roomId });

  res.status(203).json({
    message: "Private messages retrieved successfully",
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

export const deleteChat = asyncHandler(async (req, res) => {
  const { roomId } = req.params;

  if (!roomId) {
    return res.status(405).json({ message: "couldent clear messages" });
  }

  const response = await EchoLink.findOneAndUpdate(
    { uniqueChatId: roomId },
    {
      $set: { messages: [] },
    }
  );

  res.status(203).json({ message: "cleared the all messages" });
});

export const deleteChatRoom = asyncHandler(async (req, res) => {
  const { roomId } = req.params;

  if (!roomId) {
    return res.status(405).json({ message: "couldent clear messages" });
  }

  await EchoLink.findOneAndDelete({ uniqueChatId: roomId });

  res.status(203).json({ message: "Deleted the chat room" });
});

//groupchat controllers
export const createNewGroupChat = asyncHandler(async (req, res) => {
  const { groupName, groupMembers } = req.body;
  const userId = req.user;

  const avatarLocalPath = req.files?.groupProfilePicture[0]?.path;

  if (!avatarLocalPath) {
    return res.status(400).json({ message: "Avatar file is required" });
  }

  const avatar = await uploadToCloudinary(avatarLocalPath);

  if (!avatar) {
    return res.status(400).json({ message: "Avatar file is required" });
  }

  const members = JSON.parse(groupMembers).map((member) => member.id);
  members.push(req.user);

  const newGroup = await GroupChatRoom.create({
    groupProfile: { url: avatar.url, publicId: avatar.public_id },
    groupName,
    groupChatRoomMembers: members,
    admin: userId,
  });

  const newGroupDetails = await GroupChatRoom.findById(newGroup._id)
    .populate({
      path: "groupChatRoomMembers",
      select: "username",
    })
    .populate({
      path: "admin",
      select: "username",
    });

  res.status(203).json({
    message: "New group created successfully",
    newGroupDetails,
  });
});

export const getGroupChatDetails = asyncHandler(async (req, res) => {
  const { groupId } = req.params;

  const groupDetails = await GroupChatRoom.findById(groupId);

  res.status(209).json({ message: "group details sent", groupDetails });
});

export const sendGroupChatMessage = asyncHandler(async (req, res) => {
  let attachments = null;
  const { receiver, message } = req.body;
  const sender = req.user;

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
    receiver: { receiverId: receiver },
    sender,
    attachments: {
      url: attachments?.url,
      publicId: attachments?.public_id,
    },
    messageStatus: "sent",
  };

  const { messages } = await GroupChatRoom.findByIdAndUpdate(
    receiver,
    {
      $push: { messages: newMessage },
    },
    { new: true, upsert: true }
  );
  const latestMessage = messages.at(-1);

  io.to(receiver).emit("new_groupChat_Message", latestMessage);

  return res
    .status(202)
    .json({ message: "message sent succesfully", latestMessage });
});
