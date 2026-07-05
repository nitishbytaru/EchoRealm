import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface EchoLinkState {
  pagination: Record<string, { hasMoreMessages: boolean; currentPage: number }>;
  selectedChat: any;
  privateMessages: any[];
  newUnreadMessages: number;
  myPrivateChatRooms: any[];
  chatRoomsWithUnreadMessages: any[];
}

const initialState: EchoLinkState = {
  pagination: {},
  selectedChat: {},
  privateMessages: [],
  newUnreadMessages: 0,
  myPrivateChatRooms: [],
  chatRoomsWithUnreadMessages: [],
};

const echoLinkSlice = createSlice({
  name: "echoLink",
  initialState,
  reducers: {
    setSelectedChat(state, action: PayloadAction<any>) {
      state.selectedChat = action.payload;
    },
    addPrivateMessage(state, action: PayloadAction<any>) {
      if (!state.privateMessages) {
        state.privateMessages = [];
      }
      state.privateMessages.push(action.payload);
    },
    setPrivateMessages(state, action: PayloadAction<any[]>) {
      state.privateMessages = action.payload;
    },
    setMyPrivateChatRooms(state, action: PayloadAction<any[]>) {
      state.myPrivateChatRooms = action.payload;
    },
    addToMyPrivateChatRooms(state, action: PayloadAction<any>) {
      const existingChatRoom = state.myPrivateChatRooms.find((friend) => {
        return friend.uniqueChatId === action.payload.uniqueChatId;
      });
      if (existingChatRoom) {
        existingChatRoom.latestMessage = action.payload.latestMessage;
      } else {
        state.myPrivateChatRooms.push(action.payload);
      }

      state.myPrivateChatRooms = state.myPrivateChatRooms.sort((a, b) => {
        const dateA = new Date(
          a.latestMessage?.updatedAt || a.newGroupChatDetails?.updatedAt
        );
        const dateB = new Date(
          b.latestMessage?.updatedAt || b.newGroupChatDetails?.updatedAt
        );
        return dateB.getTime() - dateA.getTime(); // Sort in descending order
      });
    },
    removeFromMyPrivateChatRooms(state, action: PayloadAction<string>) {
      state.myPrivateChatRooms = state.myPrivateChatRooms.filter(
        (friend) => friend.uniqueChatId !== action.payload
      );
    },
    setLatestMessageAsRead(state, action: PayloadAction<any>) {
      const chatId = action.payload?._id;

      state.myPrivateChatRooms = state.myPrivateChatRooms.map((chatRoom) => {
        if (chatRoom._id === chatId) {
          const updatedChatRoom = { ...chatRoom };
          if (updatedChatRoom.latestMessage?.receiver) {
            updatedChatRoom.latestMessage.receiver.messageStatus = "read";
          }
          return updatedChatRoom;
        }
        return chatRoom;
      });
    },
    addToChatRoomsWithUnreadMessages(state, action: PayloadAction<any>) {
      const alreadyExists = state.chatRoomsWithUnreadMessages.find((field) => {
        return field === action.payload;
      });
      if (!alreadyExists) {
        state.chatRoomsWithUnreadMessages.push(action.payload);
        state.newUnreadMessages++;
      }
    },
    removeFromChatRoomsWithUnreadMessages(state, action: PayloadAction<any>) {
      const alreadyExists = state.chatRoomsWithUnreadMessages.find((field) => {
        return field === action.payload;
      });
      if (alreadyExists) {
        state.chatRoomsWithUnreadMessages =
          state.chatRoomsWithUnreadMessages.filter(
            (field) => field !== action.payload
          );
        if (state.newUnreadMessages >= 0) {
          state.newUnreadMessages--;
        }
      }
    },
    addOlderPrivateMessages(state, action: PayloadAction<any[]>) {
      state.privateMessages = [...action.payload, ...state.privateMessages];
    },
    setPaginationDetails(state, action: PayloadAction<{ roomId: string; hasMoreMessages: boolean; currentPage: number }>) {
      const { roomId, hasMoreMessages, currentPage } = action.payload;
      state.pagination[roomId] = { hasMoreMessages, currentPage };
    },
  },
});

export const {
  setSelectedChat,
  addPrivateMessage,
  setPrivateMessages,
  setMyPrivateChatRooms,
  addToMyPrivateChatRooms,
  setLatestMessageAsRead,
  addToChatRoomsWithUnreadMessages,
  removeFromChatRoomsWithUnreadMessages,
  removeFromMyPrivateChatRooms,
  addOlderPrivateMessages,
  setPaginationDetails,
} = echoLinkSlice.actions;

export default echoLinkSlice.reducer;
