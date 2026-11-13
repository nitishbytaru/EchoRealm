import { compare, hash } from "bcrypt";
import { UserFriend } from "../../user/models/friends.model.js";
import { User } from "../../user/models/user.model.js";
import { asyncHandler } from "../../../utils/async_handler.js";
import { cookieOptions, sendToken } from "../../../utils/send_token.js";

const DEFAULT_AVATAR_URL =
  "https://res.cloudinary.com/dhysbx7mk/image/upload/v1734113464/echorealm/placeholder_xymc9y.jpg";

//To register a new user
export const registerUser = asyncHandler(async (req, res) => {
  const { email, username, password, avatarUrl } = req.body;

  if ([email, username, password].some((field) => field?.trim() === "")) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    return res
      .status(409)
      .json({ message: "User with email or username already exists" });
  }

  const user = await User.create({
    avatar: { url: avatarUrl || DEFAULT_AVATAR_URL, publicId: null },
    email,
    password: await hash(password, 10),
    username,
  });

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

  const updatedUsername = username?.replace(" ", "_");

  const user = await User.findOne({
    $or: [{ username: updatedUsername }, { email }],
  });

  if (!user) {
    return res.status(403).json({ message: "User does not exist" });
  }

  // Accounts created before hashing still hold plain text; upgrade them on login.
  const isHashed = /^\$2[aby]\$/.test(user.password);
  const isPasswordValid = isHashed
    ? await compare(password, user.password)
    : user.password === password;

  if (!isPasswordValid) {
    return res.status(401).json({ message: "Invalid user credentials" });
  }

  if (!isHashed) {
    user.password = await hash(password, 10);
    await user.save();
  }

  sendToken(res, user, 201, "Login Success");
});

//view profile
export const getProfile = asyncHandler(async (req, res) => {
  const userId = req.user;

  const user = await User.findById(req.user).select("-password");
  user["friends"] = await UserFriend.findOne({ userId }).populate(
    "friends",
    "username _id avatar"
  );

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
