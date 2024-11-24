import { io } from "../index.js";
import { UserFriend } from "../models/friends.model.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

//This is to block a particular user
export const blockUser = asyncHandler(async (req, res) => {
  const { senderId } = req.query;
  const userId = req.user;

  if (!senderId) {
    return res
      .status(400)
      .json({ success: false, message: "Sender ID is required" });
  }

  // Find user and check if senderId is already in the blockedUsers array
  const blockedUsersOfCurrentUser = await UserFriend.findOne({ userId }).select(
    "blockedUsers"
  );

  if (!blockedUsersOfCurrentUser) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  // Check if senderId is already in the blockedUsers array
  const isAlreadyBlocked = blockedUsersOfCurrentUser.includes(senderId);

  if (isAlreadyBlocked) {
    return res.status(204).json({ message: "User is already blocked" });
  }

  // Add senderId to the blockedUsers array
  const updatedUser = await UserFriend.findByIdAndUpdate(
    { userId },
    { $addToSet: { blockedUsers: senderId } },
    { new: true }
  );

  return res
    .status(200)
    .json({ success: true, message: "User blocked successfully" });
});

export const getBlockedUsers = asyncHandler(async (req, res) => {
  // Retrieve blocked user IDs for the logged-in user
  const userId = req.user;

  const blockedUsers = await UserFriend.findOne({ userId }).select(
    "blockedUsers"
  );

  if (!blockedUsers || blockedUsers.length === 0) {
    return res
      .status(200)
      .json({ message: "No blocked users found", blockedUsers: [] });
  }

  // Find all users whose _id is in the blockedUsers array
  const blockedUsersDetails = await User.find({
    _id: { $in: blockedUsers },
  }).select("_id username avatar");

  res.status(200).json({
    message: "Blocked users retrieved successfully",
    blockedUsers: blockedUsersDetails,
  });
});

export const unBlockUser = asyncHandler(async (req, res) => {
  const { userIdToBeUnblocked } = req.query;
  const userId = req.user;

  const currUser = await UserFriend.findById(userId);

  if (!currUser) {
    return res.status(204).json({ message: "User not found" });
  }

  if (!currUser.blockedUsers.includes(userIdToBeUnblocked)) {
    return res.status(400).json({ message: "User not in blocked list" });
  }

  currUser.blockedUsers = currUser.blockedUsers.filter(
    (id) => id.toString() !== userIdToBeUnblocked
  );

  await currUser.save();

  return res.status(200).json({ message: "User unblocked successfully" });
});

export const sendFriendRequest = asyncHandler(async (req, res) => {
  const { selectedUserId } = req.query;
  const userId = req.user;

  // Find the target user's friend requests
  const userFriendData = await UserFriend.findOne({ userId: selectedUserId });

  // Check if the requestSender already exists
  const isAlreadyRequested = userFriendData?.pendingFriendRequests.some(
    (friendRequest) =>
      friendRequest.requestSender.toString() === userId.toString()
  );

  if (isAlreadyRequested) {
    return res.status(208).json({ message: "Friend request already sent." });
  }

  // Add to the pendingFriendRequests array if not already present
  const friendRequestSentToUser = await UserFriend.findOneAndUpdate(
    { userId: selectedUserId },
    {
      $push: {
        pendingFriendRequests: { requestSender: userId, requestSeen: false },
      },
    },
    { new: true, upsert: true }
  ).populate({
    path: "pendingFriendRequests.requestSender",
    select: "username _id avatar",
  });

  // Fetch current user's data for emitting

  const currUserId = await UserFriend.findOne({
    userId: selectedUserId,
  });

  io.to(selectedUserId).emit(
    "friendRequestReceived",
    friendRequestSentToUser.pendingFriendRequests
  );

  res.status(200).json({
    message: "Friend request sent successfully",
    myFriendRequests: currUserId,
  });
});

export const handleFriendRequest = asyncHandler(async (req, res) => {
  const { requestedUserId, willAccepct } = req.body;
  const userId = req.user;

  if (!requestedUserId) {
    return res.status(400).json({ message: "Requested user ID is required." });
  }

  let updatedMyFriendRequests;

  if (willAccepct) {
    // Add both users to each other's friends list
    await UserFriend.findOneIdAndUpdate(
      { userId },
      { $addToSet: { friends: requestedUserId } },
      { new: true }
    );

    await UserFriend.findOneAndUpdate(
      { userId: requestedUserId },
      { $addToSet: { friends: userId } },
      { new: true }
    );
  }

  // Remove the friend request from the current user's pendingFriendRequests
  await UserFriend.findOneAndUpdate(
    { userId },
    {
      $pull: {
        pendingFriendRequests: { requestSender: requestedUserId },
      },
    },
    { new: true }
  );

  // Remove the friend request from the requested user's pendingFriendRequests
  const requestingUser = await UserFriend.findOneAndUpdate(
    { userId },
    {
      $pull: {
        pendingFriendRequests: { requestSender: userId },
      },
    },
    { new: true }
  ).populate("pendingFriendRequests.requestSender", "username _id avatar");

  updatedMyFriendRequests = requestingUser.pendingFriendRequests;

  res.status(200).json({
    message: `Friend request ${willAccepct ? "accepted" : "rejected"}.`,
    updatedMyFriendRequests,
  });
});

export const removeOrBlockMyFriend = asyncHandler(async (req, res) => {
  const { friendId, block } = req.body;
  const userId = req.user;

  if (block) {
    const response1 = await UserFriend.findOneAndUpdate(
      { userId },
      {
        $addToSet: { blockedUsers: friendId },
      },
      { new: true }
    );
    const response2 = await UserFriend.findOneAndUpdate(
      { userId: friendId },
      {
        $addToSet: { blockedUsers: userId },
      },
      { new: true }
    );
  }

  const response3 = await UserFriend.findByIdAndUpdate(
    { userId },
    {
      $pull: { friends: friendId },
    },
    { new: true }
  );
  const response4 = await UserFriend.findByIdAndUpdate(
    { userId: friendId },
    {
      $pull: { friends: userId },
    },
    { new: true }
  );

  res.status(209).json({
    message: `Friend ${block ? "removed" : "blocked"}`,
  });
});

export const getMyFriendRequests = asyncHandler(async (req, res) => {
  const userId = req.user;

  const currUser = await UserFriend.findOne({ userId }).populate({
    path: "pendingFriendRequests.requestSender",
    select: "username _id avatar",
  });

  res.status(209).json({
    message: "fetched your friend requests",
    myFriendRequests: currUser?.pendingFriendRequests,
  });
});
