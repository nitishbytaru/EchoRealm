import { useInputValidation } from "6pp";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";

import socket from "../../../sockets/socket.js";
import AddToGroup from "./GroupChat/AddToGroup.jsx";
import CreateGroup from "./GroupChat/CreateGroup.jsx";
import RemoveFromGroup from "./GroupChat/RemoveFromGroup.jsx";
import LoadingSpinner from "../../../components/LoadingSpinner.jsx";
import { MoreVertSharpIcon } from "../../../utils/icons/export_icons.js";
import {
  getGroupChatDetailsApi,
  getMyPrivateFriendsApi,
  getPrivateMessagesApi,
  searchEchoLinkFriendsApi,
} from "../api/echo_link.api.js";
import {
  setMyPrivateChatRooms,
  setLatestMessageAsRead,
  addToChatRoomsWithUnreadMessages,
  addToMyPrivateChatRooms,
  setPrivateMessages,
  setPaginationDetails,
  removeFromChatRoomsWithUnreadMessages,
} from "../slices/echo_link.slice.js";
import {
  createUniquechatRoom,
  markAsRead,
  truncateMessage,
} from "../../../utils/heplers/micro_funcs.js";

function ChatRooms() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { recieverId } = useParams();

  const { user } = useSelector((state) => state.auth);
  const { myPrivateChatRooms, selectedChat } = useSelector(
    (state) => state.echoLink
  );

  const search = useInputValidation("");
  const [searchResults, setSearchResults] = useState(null);

  const [isPending, startTransition] = useState(false);
  const [isGroupPending, startTransitionGroup] = useState(false);

  useEffect(() => {
    const fetchMyPrivateFriends = async () => {
      try {
        startTransition(true);
        const response = await getMyPrivateFriendsApi();

        response?.data?.myPrivateFriendsWithMessages.map((chatRoom) => {
          if (
            chatRoom?.latestMessage?.receiver?.messageStatus == "sent" &&
            chatRoom?.latestMessage?.sender != user?._id
          ) {
            dispatch(addToChatRoomsWithUnreadMessages(chatRoom?.uniqueChatId));
          }
        });

        const sortedMyPrivateFriendsWithMessages =
          response?.data?.myPrivateFriendsWithMessages.sort((a, b) => {
            const dateA = new Date(a.latestMessage?.updatedAt);
            const dateB = new Date(b.latestMessage?.updatedAt);
            return dateB - dateA;
          });

        dispatch(setMyPrivateChatRooms(sortedMyPrivateFriendsWithMessages));
      } catch (error) {
        console.log(error);
      } finally {
        startTransition(false);
      }
    };

    fetchMyPrivateFriends();
  }, [dispatch, user?._id]);

  useEffect(() => {
    const handleNewPrivateMessage = (senderData) => {
      if (
        !senderData?.uniqueChatId.includes(user?._id) ||
        senderData?._id === user._id
      )
        return;

      if (senderData?._id !== recieverId) {
        dispatch(addToChatRoomsWithUnreadMessages(senderData?.uniqueChatId));
        dispatch(addToMyPrivateChatRooms(senderData));
      } else {
        markAsRead(dispatch, setLatestMessageAsRead, senderData);
      }
    };

    socket.on("new_privte_message_received", handleNewPrivateMessage);

    return () => {
      socket.off("new_privte_message_received");
    };
  }, [dispatch, recieverId, user._id]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (search.value) {
        searchEchoLinkFriendsApi(search.value)
          .then((users) => {
            const filteredUsers = users.filter(
              (field) => field._id != user._id
            );
            setSearchResults(filteredUsers);
          })
          .catch((err) => console.error(err));
      } else {
        setSearchResults([]);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [search.value, user._id]);

  const joinPrivateChat = async (recieverId, page = 1) => {
    const uniqueRoomId = createUniquechatRoom(recieverId, user?._id);
    dispatch(setPrivateMessages([]));

    if (page === 1) {
      socket.emit("joinEchoLink", uniqueRoomId);
      dispatch(removeFromChatRoomsWithUnreadMessages(uniqueRoomId));
    }

    const response = await getPrivateMessagesApi(uniqueRoomId, page);
    if (response?.data?.messages) {
      console.log("joined");

      dispatch(setPrivateMessages(response.data.messages));

      dispatch(
        setPaginationDetails({
          roomId: uniqueRoomId,
          hasMoreMessages: response.data.hasMoreMessages,
          currentPage: page,
        })
      );
    }
  };

  const joinGroupChat = async (recieverId) => {
    dispatch(setPrivateMessages([]));
    const groupResponse = await getGroupChatDetailsApi(recieverId);
    const groupDetails = groupResponse?.data?.groupDetails;

    dispatch(setPrivateMessages([]));

    const { _id, messages } = groupDetails;
    socket.emit("joinGroupChat", _id);

    dispatch(setPrivateMessages(messages));
  };

  if (isPending || isGroupPending) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <LoadingSpinner />
        {isGroupPending && <p>Creating Group...</p>}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center">
        {/* Search bar fixed at the top */}
        <div className="sticky top-0 p-2 flex-grow">
          <label className="input input-bordered flex items-center gap-2">
            <input
              type="text"
              className="grow"
              placeholder="Search Users"
              value={search.value}
              onChange={search.changeHandler}
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              className="h-4 w-4 opacity-70"
            >
              <path
                fillRule="evenodd"
                d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
                clipRule="evenodd"
              />
            </svg>
          </label>

          {search.value &&
            (searchResults?.length > 0 ? (
              <ul className="menu bg-base-300 w-full rounded-box mt-2">
                {searchResults?.map((searchResultUser) => (
                  <li
                    key={searchResultUser._id}
                    onClick={() => {
                      navigate(`/links/${searchResultUser._id}`);
                      {
                        searchResultUser?.groupProfile
                          ? joinGroupChat(searchResultUser._id)
                          : joinPrivateChat(searchResultUser._id);
                      }
                      search.clear();
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={searchResultUser?.avatar?.url}
                        alt="searchResultUser.username"
                        className="w-10 h-10 object-cover rounded-full"
                        crossOrigin="anonymous"
                      />
                      <p>@{searchResultUser.username}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="menu bg-base-300 w-full rounded-box mt-2">
                <div className="flex justify-between items-center">
                  <p>No User Found</p>
                  <Link to={"/profile/find-users"}>
                    <button className="btn btn-primary btn-sm">
                      Find Friends
                    </button>
                  </Link>
                </div>
              </div>
            ))}
        </div>
        <div className="btn bg-base-300 px-2 mr-2 rounded-xl">
          {/* Open the modal using document.getElementById('ID').showModal() method */}
          <button
            onClick={() => document.getElementById("my_modal_9").showModal()}
          >
            <MoreVertSharpIcon />
          </button>
          <CreateGroup
            isGroupPending={isGroupPending}
            startTransitionGroup={startTransitionGroup}
          />
          {selectedChat?.groupName && (
            <>
              <AddToGroup />
              <RemoveFromGroup />
            </>
          )}
        </div>
      </div>

      {/* Scrollable user list */}
      <ul className="menu flex-row p-2 overflow-y-auto">
        {myPrivateChatRooms?.map((receiver, index) => (
          <li
            className="w-full py-2 cursor-pointer"
            key={index}
            onClick={() => {
              navigate(`/links/${receiver._id}`);
              {
                receiver?.groupProfile
                  ? joinGroupChat(receiver._id)
                  : joinPrivateChat(receiver._id);
              }
              if (receiver.latestMessage) {
                markAsRead(dispatch, setLatestMessageAsRead, receiver);
              }
            }}
          >
            <div className="flex items-center gap-3">
              {/* User Avatar */}
              <div className="avatar">
                <div className="w-12 rounded-full">
                  <img
                    src={receiver?.avatar?.url || receiver?.groupProfile?.url}
                    alt="user avatar"
                  />
                </div>
              </div>

              {/* Username and Latest Message */}
              <div className="flex-1">
                <p className="font-semibold">
                  {receiver?.username || receiver?.groupName}
                </p>
                {receiver.latestMessage ? (
                  <p
                    className={`text-sm ${
                      receiver?.latestMessage?.receiver?.messageStatus ===
                        "sent" && receiver?.latestMessage?.sender != user._id
                        ? "text-white"
                        : "text-gray-500"
                    }`}
                    style={{ maxWidth: "15rem" }}
                  >
                    {truncateMessage(receiver?.latestMessage?.message)}
                  </p>
                ) : (
                  <p className="text-gray-500">
                    {truncateMessage(
                      receiver?.groupChatRoomMembers
                        .map((member) => member.username)
                        .join(", ")
                    )}
                  </p>
                )}
              </div>

              {/* Notification Dot */}
              {receiver?.latestMessage?.receiver?.messageStatus === "sent" &&
                receiver?.latestMessage?.sender != user._id && (
                  <div className="text-white text-4xl">
                    <span>•</span>
                  </div>
                )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ChatRooms;
