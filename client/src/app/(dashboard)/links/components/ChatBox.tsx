"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { useDispatch, useSelector } from "react-redux";
import { Loader2 } from "lucide-react";

import Loading from "@/components/Loading";
import socket from "@/sockets/socket";
import MessageBubble from "./ChatBox/MessageBubble";
import MessageBar from "@/components/MessageBar";
import GroupChatNav from "./ChatBox/NavBars/GroupChatNav";
import PrivateChatNav from "./ChatBox/NavBars/PrivateChatNav";
import { useAutoScroll } from "@/hooks/useAutoScroll";
import { searchUserByIdApi } from "@/api/user.api";
import {
  getGroupChatDetailsApi,
  getPrivateMessagesApi,
  sendEchoLinkMessageApi,
  sendGroupChatMessageApi,
} from "@/api/echo_link.api";
import {
  addPrivateMessage,
  addToMyPrivateChatRooms,
  setLatestMessageAsRead,
  setPrivateMessages,
  setSelectedChat,
} from "@/store/slices/echo_link.slice";
import { createUniquechatRoom, markAsRead } from "@/utils/helpers/micro_funcs";
import { RootState } from "@/store/store";

import AddToGroupDialog from "./GroupChat/AddToGroupDialog";
import RemoveFromGroupDialog from "./GroupChat/RemoveFromGroupDialog";

interface ChatBoxProps {
  scrollRef: React.RefObject<HTMLDivElement | null>;
  shouldScrollToBottom: boolean;
  setShouldScrollToBottom: (val: boolean) => void;
  gettingOldMessages: boolean;
}

export const ChatBox: React.FC<ChatBoxProps> = ({
  scrollRef,
  shouldScrollToBottom,
  setShouldScrollToBottom,
  gettingOldMessages,
}) => {
  const dispatch = useDispatch();
  const params = useParams();
  const recieverId = params?.recieverId as string | undefined;

  const { user } = useSelector((state: RootState) => state.auth);
  const { selectedChat, privateMessages } = useSelector(
    (state: RootState) => state.echoLink
  );

  const messagesEndRef = useAutoScroll(privateMessages, shouldScrollToBottom);

  const [echoLinkMessageData, setEchoLinkMessageData] = useState<FormData | null>(null);

  const [isPendingOperation, setIsPendingOperation] = useState(false);
  const [isPendingSendMessage, setIsPendingSendMessage] = useState(false);
  const [isPendingGetMessage, setIsPendingGetMessage] = useState(false);

  // Group action dialog states
  const [openAddToGroup, setOpenAddToGroup] = useState(false);
  const [openRemoveFromGroup, setOpenRemoveFromGroup] = useState(false);

  useEffect(() => {
    const getRecieverDataByIdFunc = async () => {
      if (!recieverId) return;
      try {
        setIsPendingGetMessage(true);
        let response = await searchUserByIdApi(recieverId);
        if (!response?.data?.searchedUser) {
          response = await getGroupChatDetailsApi(recieverId);
          dispatch(setSelectedChat(response?.data?.groupDetails || null));
        } else {
          dispatch(setSelectedChat(response?.data?.searchedUser || null));
        }
      } catch (error) {
        console.error("Error fetching receiver data:", error);
        toast.error("Failed to fetch receiver details.");
      } finally {
        setIsPendingGetMessage(false);
      }
    };

    getRecieverDataByIdFunc();
  }, [dispatch, recieverId]);

  useEffect(() => {
    if (!recieverId) return;

    const handleLatestEchoLinkMessage = (latestEchoLinkMessage: any) => {
      const { latestMessage } = latestEchoLinkMessage;

      if (recieverId === latestMessage?.sender) {
        markAsRead(dispatch, setLatestMessageAsRead, latestEchoLinkMessage);
      }

      dispatch(addToMyPrivateChatRooms(latestEchoLinkMessage));
      dispatch(addPrivateMessage(latestMessage));
      setShouldScrollToBottom(true);
    };

    const handleNewGroupChatMessage = (groupChatMessage: any) => {
      dispatch(addPrivateMessage(groupChatMessage));
    };

    socket.on("send_latest_echoLink_message", handleLatestEchoLinkMessage);
    socket.on("new_groupChat_Message", handleNewGroupChatMessage);

    return () => {
      socket.off("send_latest_echoLink_message", handleLatestEchoLinkMessage);
      socket.off("new_groupChat_Message", handleNewGroupChatMessage);
    };
  }, [dispatch, recieverId, setShouldScrollToBottom]);

  useEffect(() => {
    if (!recieverId) return;

    if (echoLinkMessageData && !echoLinkMessageData.has("receiver")) {
      echoLinkMessageData.append("receiver", recieverId);
    }

    const sendMessage = async () => {
      try {
        setIsPendingSendMessage(true);
        if (!echoLinkMessageData) return;

        const response = selectedChat?.groupName
          ? await sendGroupChatMessageApi(echoLinkMessageData)
          : await sendEchoLinkMessageApi(echoLinkMessageData);

        if (!selectedChat?.groupName) {
          dispatch(addToMyPrivateChatRooms(response?.data?.receiverData));
        }
      } catch (error: any) {
        console.error("Error sending message:", error);
        toast.error(error?.response?.data?.message || "Failed to send message.");
      } finally {
        setIsPendingSendMessage(false);
        setEchoLinkMessageData(null);
      }
    };

    if (echoLinkMessageData) sendMessage();
  }, [dispatch, echoLinkMessageData, recieverId, selectedChat?.groupName]);

  useEffect(() => {
    const getMessages = async () => {
      if (!recieverId || !user) return;
      const uniqueRoomId = createUniquechatRoom(recieverId, user._id);
      try {
        setIsPendingGetMessage(true);
        const response = await getPrivateMessagesApi(uniqueRoomId);
        if (response?.data?.messages) {
          dispatch(setPrivateMessages(response.data.messages));
        } else {
          const groupResponse = await getGroupChatDetailsApi(recieverId);
          const groupDetails = groupResponse?.data?.groupDetails;

          if (groupDetails?._id) {
            const { _id, messages } = groupDetails;
            socket.emit("joinGroupChat", _id);
            dispatch(setPrivateMessages(messages));
          }
        }
      } catch (err) {
        console.error("Error loading chat messages:", err);
      } finally {
        setIsPendingGetMessage(false);
      }
    };

    getMessages();
  }, [dispatch, recieverId, user]);

  if (isPendingGetMessage) return <Loading />;
  if (isPendingOperation) {
    return (
      <div className="h-full flex flex-col justify-center items-center gap-2 p-8">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        <p className="text-xs text-slate-400">Performing operation...</p>
      </div>
    );
  }

  return (
    <>
      {!recieverId ? (
        <div
          className="h-full flex justify-center items-center text-center rounded-2xl min-h-[400px] border-0"
          style={{
            background: "var(--background)",
            boxShadow: "var(--nm-inset, inset 0 4px 12px rgba(0,0,0,0.1))",
          }}
        >
          <p className="text-xs font-medium text-muted-foreground">
            Select a user or group to open chat
          </p>
        </div>
      ) : (
        <div className="h-full flex flex-col relative">
          {/* Navbar */}
          {selectedChat?.groupName ? (
            <GroupChatNav
              setIsPendingOperation={setIsPendingOperation}
              setOpenAddToGroup={setOpenAddToGroup}
              setOpenRemoveFromGroup={setOpenRemoveFromGroup}
            />
          ) : (
            <PrivateChatNav setIsPendingOperation={setIsPendingOperation} />
          )}

          {/* Group Dialogs */}
          {selectedChat?.groupName && (
            <>
              <AddToGroupDialog open={openAddToGroup} onOpenChange={setOpenAddToGroup} />
              <RemoveFromGroupDialog open={openRemoveFromGroup} onOpenChange={setOpenRemoveFromGroup} />
            </>
          )}

          {/* Chat area */}
          <div
            className="flex-1 overflow-y-auto mt-4 p-4 rounded-2xl relative min-h-[300px] border-0"
            style={{
              background: "var(--background)",
              boxShadow: "var(--nm-inset, inset 0 4px 12px rgba(0,0,0,0.12))",
            }}
          >
            <div className="h-full overflow-y-auto hide-scrollBar" ref={scrollRef}>
              {gettingOldMessages && (
                <div className="flex justify-center p-2">
                  <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
                </div>
              )}
              {privateMessages?.map((message, index) => (
                <MessageBubble key={index} messages={message} user={user} />
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Message input bar */}
          <div className="mt-4">
            {isPendingSendMessage ? (
              <div className="w-full flex justify-center items-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
              </div>
            ) : (
              <MessageBar setMessageData={setEchoLinkMessageData} />
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBox;
