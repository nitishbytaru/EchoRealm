import { useEffect } from "react";
import {
  getMyPrivateFriends,
  markLatestMessageAsRead,
} from "../../api/echoLinkApi.js";
import { useInputValidation } from "6pp";
import { useDispatch, useSelector } from "react-redux";
import {
  setMyPrivateChatRooms,
  setLatestMessageAsRead,
  addToChatRoomsWithUnreadMessages,
  addToMyPrivateChatRooms,
} from "../../app/slices/echoLinkSlice.js";
import socket from "../../sockets/socket.js";
import {
  handleRoomSelect,
  truncateMessage,
} from "../../heplerFunc/microFuncs.js";
import { useDebouncedSearchResults } from "../../hooks/useDebouncedSearchResults";

function ChatRooms() {
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const { myPrivateChatRooms } = useSelector((state) => state.echoLink);

  const search = useInputValidation("");
  let searchResults = useDebouncedSearchResults(search.value);

  searchResults = searchResults.filter((field) => field._id != user._id);

  useEffect(() => {
    const fetchMyPrivateFriends = async () => {
      const response = await getMyPrivateFriends();

      response?.data?.myPrivateFriendsWithMessages.map((chatRoom) => {
        if (
          chatRoom?.latestMessage?.messageStatus == "sent" &&
          chatRoom?.latestMessage?.sender != user?._id
        ) {
          dispatch(addToChatRoomsWithUnreadMessages(chatRoom?.uniqueChatId));
        }
      });

      dispatch(
        setMyPrivateChatRooms(response?.data?.myPrivateFriendsWithMessages)
      );
    };

    fetchMyPrivateFriends();
  }, [dispatch, user?._id]);

  useEffect(() => {
    socket.on("new_privte_message_received", (message) => {
      if (
        message?.uniqueChatId.includes(user?._id) &&
        message?._id != user._id
      ) {
        dispatch(addToChatRoomsWithUnreadMessages(message?.uniqueChatId));
        dispatch(addToMyPrivateChatRooms(message));
      }
    });

    return () => {
      socket.off("new_privte_message_received");
    };
  }, [dispatch, user._id]);

  const markAsRead = async (currUser) => {
    dispatch(setLatestMessageAsRead(currUser));

    try {
      await markLatestMessageAsRead(currUser?.uniqueChatId);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Search bar fixed at the top */}
      <div className="sticky top-0 p-2">
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
        {searchResults?.length > 0 && (
          <ul className="menu bg-base-300 w-full rounded-box mt-2">
            {searchResults.map((searchResultUser) => (
              <li
                key={searchResultUser._id}
                onClick={() => {
                  handleRoomSelect(dispatch, searchResultUser, user);
                  search.clear();
                }}
              >
                <div>
                  <div>
                    <img
                      src={searchResultUser?.avatar?.url}
                      alt=""
                      className="w-10 h-10 object-cover rounded-full"
                    />
                  </div>
                  <div>
                    <p>@{searchResultUser.username}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Scrollable user list */}
      <ul className="menu flex-row p-2 overflow-y-auto">
        {myPrivateChatRooms?.map((currUser, index) => (
          <li
            className="w-full py-2 cursor-pointer"
            key={index}
            onClick={() => {
              handleRoomSelect(dispatch, currUser, user);

              markAsRead(currUser);
            }}
          >
            <div className="flex items-center gap-3">
              {/* User Avatar */}
              <div className="avatar">
                <div className="w-12 rounded-full">
                  <img src={currUser?.avatar?.url} alt="user avatar" />
                </div>
              </div>

              {/* Username and Latest Message */}
              <div className="flex-1">
                <p className="font-semibold">{currUser?.username}</p>
                <p
                  className={`text-sm ${
                    currUser?.latestMessage?.messageStatus === "sent" &&
                    currUser?.latestMessage?.sender != user._id
                      ? "text-white"
                      : "text-gray-500"
                  }`}
                  style={{ maxWidth: "15rem" }}
                >
                  {truncateMessage(currUser?.latestMessage?.message)}
                </p>
              </div>

              {/* Notification Dot */}
              {currUser?.latestMessage?.messageStatus === "sent" &&
                currUser?.latestMessage?.sender != user._id && (
                  <div className="text-white text-4xl">
                    <p>•</p>
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
