import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import {
  deleteFromCloudinary,
  uploadToCloudinary,
} from "../../../config/cloudinary/cloudinary.js";
import { EchoShout } from "../../echoShout/models/echo_shout.model.js";
import { EchoLink } from "../../echoLink/models/echo_link.model.js";
import { EchoMumble } from "../../echoMumble/models/echo_mumble.model.js";
import { asyncHandler } from "../../../utils/async_handler.js";
import { cookieOptions, sendToken } from "../../../utils/send_token.js";
import { UserFriend } from "../../user/models/friends.model.js";

export const getMostLikedMumbleWithLikesAndFriends = asyncHandler(
  async (req, res) => {
    const { userId } = req.params;
    const receiverId = new mongoose.Types.ObjectId(userId);

    //TOTAL FRIENDS
    const friendsOfUser = await UserFriend.find({ userId });

    //TOTAL FRIENDS
    const calculateLikes = await EchoMumble.aggregate([
      { $match: { receiver: receiverId } },
      { $project: { likeCount: { $size: "$likes" } } },
      { $group: { _id: null, totalLikes: { $sum: "$likeCount" } } },
    ]);

    //HIGHEST LIKED MUMBLE
    const mostLikedMumble = await EchoMumble.aggregate([
      { $match: { receiver: receiverId } }, // Match the receiver
      { $addFields: { likeCount: { $size: "$likes" } } }, // Add a field for likes count
      { $sort: { likeCount: -1 } }, // Sort by likes count descending
      { $limit: 1 }, // Get the top document
      {
        $project: {
          message: 1,
          "sender.username": 1,
          likeCount: 1, // Include likeCount for reference if needed
        },
      }, // Include only specific fields
    ]);

    const userRequestedProfileData = {
      mumbleWithHighestLikes: mostLikedMumble[0] || null,
      profileLikes: calculateLikes[0]?.totalLikes || 0,
      friends: friendsOfUser.length || 0,
    };

    res
      .status(202)
      .json({ message: "searched user details", userRequestedProfileData });
  }
);

export const searchUserById = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const searchedUser = await User.findById(userId).select(
    "_id username avatar"
  );

  res.status(202).json({ message: "searched user details", searchedUser });
});

export const searchUsers = asyncHandler(async (req, res) => {
  const { username } = req.params;
  const userId = req.user;

  const currUserwithBlockedUsers = await UserFriend.findOne({ userId });

  const currUserwithBlockedUsersList =
    currUserwithBlockedUsers?.blockedUsers || [];

  if (!username) {
    return res.status(400).json({ message: "Search username is required" });
  }

  const searchedUsers = await User.find({
    username: { $regex: username, $options: "i" },
    _id: { $nin: [...currUserwithBlockedUsersList, userId] },
  })
    .select("-password")
    .limit(5);

  const searchedUsersWithFriends = await Promise.all(
    searchedUsers.map(async (user) => {
      const userFriendDoc = await UserFriend.findOne({ userId: user?._id });
      return {
        user,
        userFriendData: userFriendDoc || null,
      };
    })
  );

  res.status(203).json({
    message: "results of the searched users",
    searchedUsersWithFriends,
  });
});

export const getUsersWithMumbles = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const selectedUserProfileDetails = await User.findById(userId).select(
    "_id username avatar"
  );

  const selectedUserProfileMumbles = await EchoMumble.find({
    receiver: userId,
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

export const updateCurrUserData = asyncHandler(async (req, res) => {
  const userId = req.user;
  const {
    updatedEmail,
    updatedUsername,
    updatedPassword,
    updatedIsAcceptingMumbles,
    updatedIsAnonymous,
  } = req.body;

  let updateFields = {};

  if (req.files?.avatar) {
    const avatarLocalPath = req.files?.avatar[0]?.path;

    const currUser = await User.findById(userId);

    const response = await deleteFromCloudinary(currUser?.avatar?.publicId);

    const updatedAvatar = await uploadToCloudinary(avatarLocalPath);

    if (!updatedAvatar) {
      return res.status(400).json({ message: "Avatar file is required" });
    }

    if (!updatedUsername && !updatedEmail) {
      return res.status(400).json({ message: "username or email is required" });
    }

    updateFields.avatar = {
      url: updatedAvatar.url,
      publicId: updatedAvatar.public_id,
    };
  }

  if (updatedEmail) {
    updateFields.email = updatedEmail;
  }

  if (updatedUsername) {
    updateFields.username = updatedUsername;
  }

  updateFields.isAcceptingMumbles = updatedIsAcceptingMumbles;
  updateFields.isAnonymous = updatedIsAnonymous;

  if (updatedPassword === "") {
    const { password } = await User.findById(userId).select("password");
    updateFields.password = password;
  } else {
    updateFields.password = updatedPassword;
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: updateFields },
    { new: true }
  );

  sendToken(res, user, 201, "account updated successfully");
});

export const deleteMyAccount = asyncHandler(async (req, res) => {
  const userId = req.user;

  const response = await User.findById(userId);
  await deleteFromCloudinary(response?.avatar?.publicId);

  await EchoMumble.deleteMany({
    $or: [{ receiver: userId }, { sender: userId }],
  });
  await EchoShout.deleteMany({ sender: userId });
  await EchoLink.deleteMany({ uniqueChatId: { $regex: userId } });
  await UserFriend.deleteMany({ userId: userId });
  await User.updateMany(
    {
      $or: [
        { friends: userId },
        { friendRequests: userId },
        { blockedUsers: userId },
      ],
    },
    {
      $pull: {
        friends: userId,
        friendRequests: userId,
        blockedUsers: userId,
      },
    }
  );

  await User.findByIdAndDelete(userId);

  res
    .status(204)
    .cookie("echo-token", "", { ...cookieOptions, maxAge: 0 })
    .json({ message: "account deleetd" });
});
