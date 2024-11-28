// echoMumble.controller.j
import { io } from "../index.js";
import { EchoMumble } from "../models/echoMumble.model.js";
import { UserFriend } from "../models/friends.model.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getMumbles = asyncHandler(async (req, res) => {
  const userId = req.user;

  const blockedUsersOfCurrUser = await UserFriend.findOne({ userId }).select(
    "blockedUsers"
  );

  const currentUserBlockedUsersList =
    blockedUsersOfCurrUser?.blockedUsers || [];

  const mumbles = await EchoMumble.find({
    receiver: userId,
    $or: [
      {
        "sender.senderId": {
          $nin: [...currentUserBlockedUsersList, userId],
        },
      },
      { "sender.senderId": null },
    ],
  }).sort({ createdAt: -1 });

  res.status(200).json({ mumbles });
});

export const pinMumble = asyncHandler(async (req, res) => {
  const { mumbleId } = req.params;

  if (!mumbleId) {
    res.status(404).json({ message: "Id is needed to delete the Mumble" });
  }

  // Fetch the current document
  const currentMumble = await EchoMumble.findById(mumbleId);

  const newPinnedStatus = !currentMumble.pinned;

  // Check the user's pinned Mumble limit only when pinning
  if (newPinnedStatus) {
    const user = await User.findById(req.user);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.numberOfPinnedMumbles >= 4) {
      return res
        .status(400)
        .json({ message: "Maximum number of pinned Mumbles reached." });
    }
  }

  // Update the Mumble's pinned status
  const updatedMumble = await EchoMumble.findByIdAndUpdate(
    mumbleId,
    { pinned: newPinnedStatus },
    { new: true }
  );

  if (!updatedMumble) {
    return res.status(500).json({ message: "Failed to update Mumble." });
  }

  // Update the user's pinned count
  const incrementValue = newPinnedStatus ? 1 : -1;
  const updatedUser = await User.findByIdAndUpdate(
    req.user,
    { $inc: { numberOfPinnedMumbles: incrementValue } },
    { new: true }
  );

  if (!updatedUser) {
    return res
      .status(400)
      .json({ message: "Failed to update user's pinned count." });
  }

  return res.status(200).json({
    message: `Mumble has been successfully ${
      newPinnedStatus ? "pinned" : "unpinned"
    }.`,
    updatedMumble,
  });
});

export const likeThisMumble = asyncHandler(async (req, res) => {
  const { mumbleId } = req.params;

  if (!mumbleId) {
    res.status(404).json({ message: "Id is needed to like the Mumble" });
  }

  // Fetch the current document
  const currentMumble = await EchoMumble.findById(mumbleId);

  const alreadyLiked = currentMumble?.likes.includes(req.user);

  let updatedMumble = [];

  if (alreadyLiked) {
    updatedMumble = await EchoMumble.findByIdAndUpdate(
      mumbleId,
      {
        $pull: { likes: req.user },
      },
      { new: true }
    );
  } else {
    updatedMumble = await EchoMumble.findByIdAndUpdate(
      mumbleId,
      {
        $push: { likes: req.user },
      },
      { new: true }
    );
  }

  res
    .status(207)
    .json({ message: "updated likes for this Mumble", updatedMumble });
});

export const sendMumble = asyncHandler(async (req, res) => {
  const { message, receiver } = req.body;
  let senderDoc = await User.findById(req.user).select("-password");

  const sender = senderDoc.isAnonymous
    ? { senderId: null, username: "anonymous" }
    : { senderId: req.user, username: senderDoc.username };

  if (!message || !receiver) {
    res.status(409).json({ message: "Mumble is required" });
  }

  const Mumble = await EchoMumble.create({
    sender,
    message,
    receiver,
  });

  io.to(receiver).emit("New_mumble_sent", Mumble);

  res.status(200).json({ message: "Mumble sent successfully", Mumble });
});

export const setMumblesAsRead = asyncHandler(async (req, res) => {
  const userId = req.user;

  await EchoMumble.updateMany(
    { receiver: userId },
    { $set: { mumbleStatus: "read" } }
  );

  res.status(200).json({ message: "all new mumbels read" });
});

export const deleteMumble = asyncHandler(async (req, res) => {
  const { mumbleId } = req.params;

  if (!mumbleId) {
    res.status(404).json({ message: "Id is needed to delete the Mumble" });
  }

  const response = await EchoMumble.findByIdAndDelete(mumbleId);

  res.status(207).json({ message: "Mumble is deleted successfully" });
});

export const deleteRecievedMumbles = asyncHandler(async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "You must login first" });
  }

  const response = await EchoMumble.deleteMany({
    receiver: req.user,
  });
  res.status(207).json({ message: "Deleted all recieved Mumbles" });
});

export const deleteSentMumbles = asyncHandler(async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "You must login first" });
  }

  const response = await EchoMumble.deleteMany({
    sender: req.user,
  });
  res.status(207).json({ message: "Deleted all sent Mumbles" });
});
