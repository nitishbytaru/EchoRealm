import { User } from "../models/user.model.js";
import { EchoShout } from "../models/echoShout.model.js";
import { EchoLink } from "../models/echoLink.model.js ";
import { EchoWhisper } from "../models/echoWhisper.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import { cookieOptions, sendToken } from "../utils/features.js";

//To register a new user
export const registerUser = asyncHandler(async (req, res) => {
  const { email, username, password, avatarUrl } = req.body;

  if ([email, username, password].some((field) => field?.trim() === "")) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const updatedUsername = username.replace(" ", "_").toLowerCase();

  const existedUser = await User.findOne({
    $or: [{ username: updatedUsername }, { email }],
  });

  if (existedUser) {
    return res
      .status(409)
      .json({ message: "User with email or username already exists" });
  }

  let user = null;

  if (avatarUrl) {
    user = await User.create({
      avatar: { url: avatarUrl, publicId: null },
      email,
      password,
      username: updatedUsername,
    });
  } else {
    const avatarLocalPath = req.files?.avatar[0]?.path;

    if (!avatarLocalPath) {
      return res.status(400).json({ message: "Avatar file is required" });
    }

    const avatar = await uploadToCloudinary(avatarLocalPath);

    if (!avatar) {
      return res.status(400).json({ message: "Avatar file is required" });
    }

    user = await User.create({
      avatar: { url: avatar.url, publicId: avatar.public_id },
      email,
      password,
      username: updatedUsername,
    });
  }

  const createdUser = await User.findById(user._id).select("-password");

  if (!createdUser) {
    return res
      .status(500)
      .json({ message: "Something went wrong while registering the user" });
  }

  sendToken(res, user, 201, "User registered Successfully");
});

//To login
export const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  if (!username && !email) {
    return res.status(400).json({ message: "username or email is required" });
  }

  const updatedUsername = username.replace(" ", "_");

  const user = await User.findOne({
    $or: [{ username: updatedUsername }, { email }],
  });

  if (!user) {
    return res.status(403).json({ message: "User does not exist" });
  }

  const isPasswordValid = user?.password === password;

  if (!isPasswordValid) {
    return res.status(401).json({ message: "Invalid user credentials" });
  }

  sendToken(res, user, 201, "Login Success");
});

//view profile
export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user)
    .select("-password")
    .populate("friends", "username _id avatar");

  if (!user) return res.status(402).json({ message: "User not found" });

  res.status(200).json({
    success: true,
    user,
  });
});

//To logout
export const logoutUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .cookie("echo-token", "", { ...cookieOptions, maxAge: 0 })
    .json({ success: true, message: "Logged out successfully" });
});

export const updateCurrUserData = asyncHandler(async (req, res) => {
  const {
    updatedEmail,
    updatedUsername,
    updatedPassword,
    udatedIsAcceptingWhispers,
    updatedIsAnonymous,
  } = req.body;

  if (!updatedUsername && !updatedEmail) {
    return res.status(400).json({ message: "username or email is required" });
  }

  const updateFields = {
    email: updatedEmail,
    username: updatedUsername,
    isAcceptingWhispers: udatedIsAcceptingWhispers,
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

  const selectedUserProfileWhispers = await EchoWhisper.find({
    receiver: selectedViewProfileId,
    showOthers: true,
  });

  const { avatar, _id, username } = selectedUserProfileDetails;

  const selectedUserProfileDetailsResponse = {
    avatar,
    _id,
    username,
    selectedUserProfileWhispers,
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
  await EchoWhisper.deleteMany({ receiver: req.user });
  await EchoWhisper.deleteMany({ sender: req.user });
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

  const response = await User.findByIdAndUpdate(
    selectedUserId,
    {
      $addToSet: { pendingFriendRequests: req.user },
    },
    { new: true }
  );

  res.status(209).json({ message: "Friend request sent successfully" });
});

export const handleFriendRequest = asyncHandler(async (req, res) => {
  const { requestedUserId, willAccepct } = req.body;

  if (willAccepct) {
    const response = await User.findByIdAndUpdate(
      req.user,
      {
        $addToSet: { friends: requestedUserId },
      },
      { new: true }
    );
  }

  const response = await User.findByIdAndUpdate(
    req.user,
    {
      $pull: { pendingFriendRequests: requestedUserId },
    },
    { new: true }
  );

  res.status(209).json({
    message: `Friend Request ${willAccepct ? "Accepted" : "Rejected"}`,
  });
});

export const removeOrBlockMyFriend = asyncHandler(async (req, res) => {
  const { friendId, block } = req.body;

  if (block) {
    const response = await User.findByIdAndUpdate(
      req.user,
      {
        $addToSet: { blockedUsers: friendId },
      },
      { new: true }
    );
  }

  const response = await User.findByIdAndUpdate(
    req.user,
    {
      $pull: { friends: friendId },
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
