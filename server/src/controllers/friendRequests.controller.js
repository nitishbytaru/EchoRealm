import { io } from "../index.js";
import { UserFriend } from "../models/friends.model.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const sendFriendRequest = asyncHandler(async (req, res) => {
  const { requestSenderId } = req.params.senderId;
  const userId = req.user;

  // Find the target user's friend requests
  const userFriendData = await UserFriend.findOne({ userId: requestSenderId });

  // Check if the requestSender already exists
  const isAlreadyRequested = userFriendData?.pendingFriendRequests.some(
    (friendRequest) => friendRequest.toString() === userId.toString()
  );

  if (isAlreadyRequested) {
    return res.status(208).json({ message: "Friend request already sent." });
  }

  // Add to the pendingFriendRequests array if not already present
  const friendRequestSentToUser = await UserFriend.findOneAndUpdate(
    { userId: requestSenderId },
    {
      $addToSet: {
        pendingFriendRequests: userId,
      },
    },
    { new: true, upsert: true }
  ).populate({
    path: "pendingFriendRequests",
    select: "username _id avatar",
  });

  // Fetch current user's data for emitting

  const currUserId = await UserFriend.findOne({
    userId: requestSenderId,
  });

  io.to(requestSenderId).emit(
    "friendRequestReceived",
    friendRequestSentToUser.pendingFriendRequests
  );

  res.status(200).json({
    message: "Friend request sent successfully",
    myFriendRequests: currUserId,
  });
});

export const getMyFriendRequests = asyncHandler(async (req, res) => {
  const userId = req.user;

  const currUser = await UserFriend.findOne({ userId }).populate({
    path: "pendingFriendRequests",
    select: "username _id avatar",
  });

  res.status(209).json({
    message: "fetched your friend requests",
    myFriendRequests: currUser?.pendingFriendRequests,
  });
});

export const getMyFriendList = asyncHandler(async (req, res) => {
  const userId = req.user;
  const currUserFriendList = await UserFriend.findOne({ userId }).populate({
    path: "friends",
    select: "username _id avatar",
  });

  res.status(209).json({
    message: "fetched your friends",
    myFriendList: currUserFriendList,
  });
});

export const getBlockedUsers = asyncHandler(async (req, res) => {
  // Retrieve blocked user IDs for the logged-in user
  const userId = req.user;

  const CurrUserthBlockedUsers = await UserFriend.findOne({ userId }).select(
    "blockedUsers"
  );

  if (
    !CurrUserthBlockedUsers?.blockedUsers ||
    CurrUserthBlockedUsers?.blockedUsers.length === 0
  ) {
    return res
      .status(200)
      .json({ message: "No blocked users found", blockedUsers: [] });
  }

  // Find all users whose _id is in the blockedUsers array
  const blockedUsersDetails = await User.find({
    _id: { $in: CurrUserthBlockedUsers?.blockedUsers },
  }).select("_id username avatar");

  res.status(200).json({
    message: "Blocked users retrieved successfully",
    blockedUsers: blockedUsersDetails,
  });
});

export const unBlockUser = asyncHandler(async (req, res) => {
  const userIdToBeUnblocked = req.params.userId;
  const userId = req.user;

  const currUser = await UserFriend.findOne({ userId });

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

export const handleFriendRequest = asyncHandler(async (req, res) => {
  const { requestedUserId, willAccepct } = req.body;
  const userId = req.user;

  if (!requestedUserId) {
    return res.status(400).json({ message: "Requested user ID is required." });
  }

  let updatedMyFriendRequests;

  if (willAccepct) {
    // Add both users to each other's friends list
    await UserFriend.findOneAndUpdate(
      { userId },
      { $addToSet: { friends: requestedUserId } },
      { new: true, upsert: true }
    );

    await UserFriend.findOneAndUpdate(
      { userId: requestedUserId },
      { $addToSet: { friends: userId } },
      { new: true, upsert: true }
    );
  }

  // Remove the friend request from the current user's pendingFriendRequests
  await UserFriend.findOneAndUpdate(
    { userId },
    {
      $pull: {
        pendingFriendRequests: requestedUserId,
      },
    },
    { new: true, upsert: true }
  );

  // Remove the friend request from the requested user's pendingFriendRequests
  const requestingUser = await UserFriend.findOneAndUpdate(
    { userId },
    {
      $pull: {
        pendingFriendRequests: userId,
      },
    },
    { new: true, upsert: true }
  ).populate("pendingFriendRequests", "username _id avatar");

  updatedMyFriendRequests = requestingUser.pendingFriendRequests;

  res.status(200).json({
    message: `Friend request ${willAccepct ? "accepted" : "rejected"}.`,
    updatedMyFriendRequests,
  });
});

export const removeOrBlockMyFriend = asyncHandler(async (req, res) => {
  const { friendId, block = false } = req.body;
  const userId = req.user;

  if (block) {
    const response1 = await UserFriend.findOneAndUpdate(
      { userId },
      {
        $addToSet: { blockedUsers: friendId },
      },
      { new: true }
    );
  }

  const response3 = await UserFriend.findOneAndUpdate(
    { userId },
    {
      $pull: { friends: friendId },
    },
    { new: true }
  );
  const response4 = await UserFriend.findOneAndUpdate(
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
