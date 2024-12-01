import mongoose, { Schema, model } from "mongoose";

const groupChatRoomSchema = new Schema(
  {
    groupName: {
      type: String,
    },
    groupProfile: {
      url: {
        type: String,
      },
      publicId: {
        type: String,
      },
    },
    groupChatRoomMembers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    admin: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

export const GroupChatRoom =
  mongoose.models.GroupChatRoom || model("GroupChatRoom", groupChatRoomSchema);
