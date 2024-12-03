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
    messages: [
      {
        message: {
          type: String,
          required: true,
        },
        attachments: [
          {
            publicId: {
              type: String,
              default: null,
            },
            url: {
              type: String,
              default: null,
            },
          },
        ],
        sender: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        receiver: {
          receiverId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
          },
          messageStatus: {
            type: String,
            enum: ["sent", "read"],
            default: "sent",
          },
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
        updatedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
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
