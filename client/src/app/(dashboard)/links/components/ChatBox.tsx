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

  const [isPendingOperation, setIsPendingOperation] = useState(false);
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

  const sendMessage = async (data: FormData) => {
    if (!recieverId) return;
    data.append("receiver", recieverId);
    const response = selectedChat?.groupName
      ? await sendGroupChatMessageApi(data)
      : await sendEchoLinkMessageApi(data);
    if (!selectedChat?.groupName) {
      dispatch(addToMyPrivateChatRooms(response?.data?.receiverData));
    }
  };

  const groupMemberNames: Record<string, string> = Object.fromEntries(
    (selectedChat?.groupChatRoomMembers || []).map((member: any) => [member._id, member.username])
  );

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
      <div className="h-full flex flex-col justify-center items-center gap-3 p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground font-bold">Performing operation...</p>
      </div>
    );
  }

  return (
    <>
      {!recieverId ? (
        <div className="h-full flex justify-center items-center text-center rounded-2xl min-h-[400px] bg-muted/30 border-[3px] border-[var(--nb-border-color)]">
          <p className="text-sm font-bold text-muted-foreground">
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
          <div className="relative -mx-4 min-h-0 flex-1 px-4 py-4">
            <div aria-hidden="true" className="nb-dotgrid pointer-events-none absolute inset-0 opacity-50" />
            <div role="log" aria-label="Messages" aria-live="polite" className="relative h-full overflow-y-auto pr-2 hide-scrollBar" ref={scrollRef}>
              {gettingOldMessages && (
                <div className="flex justify-center p-2">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              )}
              {privateMessages?.map((message, index) => (
                <MessageBubble
                  key={index}
                  messages={message}
                  user={user}
                  senderName={selectedChat?.groupName ? groupMemberNames[message?.sender] ?? "Former member" : undefined}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Message input bar */}
          <div className="border-t-[3px] border-[var(--nb-border-color)] pt-3">
            <MessageBar onSend={sendMessage} />
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBox;
