import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { EchoShout } from "../models/echoShout.model.js";
import { EchoLink } from "../models/echoLink.model.js ";
import { EchoMumble } from "../models/echoMumble.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { cookieOptions, sendToken } from "../utils/features.js";
import { UserFriend } from "../models/friends.model.js";

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
    console.log();

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
    _id: { $nin: [...currUserwithBlockedUsersList, req.user] },
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
