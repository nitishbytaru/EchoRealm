import { User } from "../models/user.model.js";
import { EchoShout } from "../models/echoShout.model.js";
import { EchoLink } from "../models/echoLink.model.js ";
import { EchoMumble } from "../models/echoMumble.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { cookieOptions, sendToken } from "../utils/features.js";

export const updateCurrUserData = asyncHandler(async (req, res) => {
  const {
    updatedEmail,
    updatedUsername,
    updatedPassword,
    udatedIsAcceptingMumbles,
    updatedIsAnonymous,
  } = req.body;

  if (!updatedUsername && !updatedEmail) {
    return res.status(400).json({ message: "username or email is required" });
  }

  const updateFields = {
    email: updatedEmail,
    username: updatedUsername,
    isAcceptingMumbles: udatedIsAcceptingMumbles,
    isAnonymous: updatedIsAnonymous,
  };

  if (updatedPassword === "") {
    const { password } = await User.findById(req.user).select("password");
    updateFields.password = password;
  } else {
    updateFields.password = updatedPassword;
  }

  const user = await User.findByIdAndUpdate(
    req.user,
    { $set: updateFields },
    { new: true }
  );

  sendToken(res, user, 201, "account updated successfully");
});

//This is to block a particular user
export const blockUser = asyncHandler(async (req, res) => {
  const { senderId } = req.query;

  if (!senderId) {
    return res
      .status(400)
      .json({ success: false, message: "Sender ID is required" });
  }

  // Find user and check if senderId is already in the blockedUsers array
  const user = await User.findById(req.user).select("blockedUsers");

  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  // Check if senderId is already in the blockedUsers array
  const isAlreadyBlocked = user.blockedUsers?.includes(senderId);

  if (isAlreadyBlocked) {
    return res.status(204).json({ message: "User is already blocked" });
  }

  // Add senderId to the blockedUsers array
  const updatedUser = await User.findByIdAndUpdate(
    req.user,
    { $addToSet: { blockedUsers: senderId } },
    { new: true }
  );

  return res
    .status(200)
    .json({ success: true, message: "User blocked successfully" });
});

export const getBlockedUsers = asyncHandler(async (req, res) => {
  // Retrieve blocked user IDs for the logged-in user
  const { blockedUsers } = await User.findById(req.user).select("blockedUsers");

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
  const { userId } = req.query;

  const currUser = await User.findById(req.user);

  if (!currUser) {
    return res.status(204).json({ message: "User not found" });
  }

  if (!currUser.blockedUsers.includes(userId)) {
    return res.status(400).json({ message: "User not in blocked list" });
  }

  currUser.blockedUsers = currUser.blockedUsers.filter(
    (id) => id.toString() !== userId
  );

  await currUser.save();

  return res.status(200).json({ message: "User unblocked successfully" });
});

export const getSelectedUserProfileDetails = asyncHandler(async (req, res) => {
  const { selectedViewProfileId } = req.query;

  const selectedUserProfileDetails = await User.findById(
    selectedViewProfileId
  ).select("_id username avatar");

  const selectedUserProfileMumbles = await EchoMumble.find({
    receiver: selectedViewProfileId,
    pinned: true,
  });

  const { avatar, _id, username } = selectedUserProfileDetails;

  const selectedUserProfileDetailsResponse = {
    avatar,
    _id,
    username,
    selectedUserProfileMumbles,
  };

  return res.status(200).json({
    message: "Selected User Data Featched Successfully",
    selectedUserProfileDetailsResponse,
  });
});

export const getSelectedUserProfile = asyncHandler(async (req, res) => {
  const { selectedUserId } = req.query;

  const selectedUserDetails = await User.findById(selectedUserId).select(
    "-password"
  );

  return res.status(200).json({
    message: "Selected User Data Featched Successfully",
    selectedUserDetails,
  });
});

export const deleteMyAccount = asyncHandler(async (req, res) => {
  await EchoMumble.deleteMany({ receiver: req.user });
  await EchoMumble.deleteMany({ sender: req.user });
  await EchoShout.deleteMany({ sender: req.user });
  await EchoLink.deleteMany({ uniqueChatId: { $regex: req.user } });
  await User.updateMany(
    { blockedUsers: { $in: [req.user] } },
    { $pull: { blockedUsers: req.user } }
  );

  await User.findByIdAndDelete(req.user);

  res
    .status(204)
    .cookie("echo-token", "", { ...cookieOptions, maxAge: 0 })
    .json({ message: "account deleetd" });
});

export const sendFriendRequest = asyncHandler(async (req, res) => {
  const { selectedUserId } = req.query;

  const friendRequestSentToUser = await User.findByIdAndUpdate(
    selectedUserId,
    {
      $addToSet: { pendingFriendRequests: req.user },
    },
    { new: true }
  );

  res
    .status(209)
    .json({
      message: "Friend request sent successfully",
      friendRequestSentToUser,
    });
});

export const handleFriendRequest = asyncHandler(async (req, res) => {
  const { requestedUserId, willAccepct } = req.body;

  if (willAccepct) {
    const response1 = await User.findByIdAndUpdate(
      req.user,
      {
        $addToSet: { friends: requestedUserId },
      },
      { new: true }
    );
    const updatedOtherUserFriendRequests = await User.findByIdAndUpdate(
      requestedUserId,
      {
        $addToSet: { friends: req.user },
      },
      { new: true }
    );
  }

  const response3 = await User.findByIdAndUpdate(
    req.user,
    {
      $pull: { pendingFriendRequests: requestedUserId },
    },
    { new: true }
  );
  const response4 = await User.findByIdAndUpdate(
    requestedUserId,
    {
      $pull: { pendingFriendRequests: req.user },
    },
    { new: true }
  );

  res.status(209).json({
    message: `Friend Request ${willAccepct ? "Accepted" : "Rejected"}`,
    updatedOtherUserFriendRequests,
  });
});

export const removeOrBlockMyFriend = asyncHandler(async (req, res) => {
  const { friendId, block } = req.body;

  if (block) {
    const response1 = await User.findByIdAndUpdate(
      req.user,
      {
        $addToSet: { blockedUsers: friendId },
      },
      { new: true }
    );
    const response2 = await User.findByIdAndUpdate(
      friendId,
      {
        $addToSet: { blockedUsers: req.user },
      },
      { new: true }
    );
  }

  const response3 = await User.findByIdAndUpdate(
    req.user,
    {
      $pull: { friends: friendId },
    },
    { new: true }
  );
  const response4 = await User.findByIdAndUpdate(
    friendId,
    {
      $pull: { friends: req.user },
    },
    { new: true }
  );

  res.status(209).json({
    message: `Friend ${block ? "removed" : "blocked"}`,
  });
});

export const getMyFriendRequests = asyncHandler(async (req, res) => {
  const currUser = await User.findById(req.user).populate(
    "pendingFriendRequests",
    "username _id avatar"
  );

  res.status(209).json({
    message: "fetched your friend requests",
    myFriendRequests: currUser?.pendingFriendRequests,
  });
});
