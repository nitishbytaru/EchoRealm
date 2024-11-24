import { User } from "../models/user.model.js";
import { EchoShout } from "../models/echoShout.model.js";
import { EchoLink } from "../models/echoLink.model.js ";
import { EchoMumble } from "../models/echoMumble.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { cookieOptions, sendToken } from "../utils/features.js";
import { UserFriend } from "../models/friends.model.js";

export const searchUsers = asyncHandler(async (req, res) => {
  const { query } = req.query;
  const userId = req.user;

  const currUserwithBlockedUsers = await UserFriend.findOne({ userId });

  const currUserwithBlockedUsersList =
    currUserwithBlockedUsers?.blockedUsers || [];

  if (!query) {
    return res.status(400).json({ message: "Search query is required" });
  }

  const searchedUsers = await User.find({
    username: { $regex: query, $options: "i" },
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

//______________________________________//
// what is the difference between them and give them unique names
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
//____________________________________//

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
