import mongoose, { Schema, model } from "mongoose";

const userFriendSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    blockedUsers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    friends: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    pendingFriendRequests: [
      {
        requestSender: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
        requestSeen: {
          type: Boolean,
          default: false,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const UserFriend =
  mongoose.models.UserFriend || model("UserFriend", userFriendSchema);
