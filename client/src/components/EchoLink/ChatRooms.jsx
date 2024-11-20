import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getMyPrivateFriendsApi,
  searchEchoLinkFriendsApi,
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
  // handleRoomSelect,
  markAsRead,
  truncateMessage,
} from "../../heplerFunc/microFuncs.js";
import { setLoading } from "../../app/slices/authSlice.js";

function ChatRooms() {
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const { myPrivateChatRooms, selectedUser } = useSelector(
    (state) => state.echoLink
  );

  const search = useInputValidation("");
  const [searchResults, setSearchResults] = useState(null);

  useEffect(() => {
    const fetchMyPrivateFriends = async () => {
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
    };

    dispatch(setLoading(true));
    fetchMyPrivateFriends();
    dispatch(setLoading(false));
  }, [dispatch, user?._id]);

  useEffect(() => {
    socket.on("new_privte_message_received", (senderData) => {
      if (
        senderData?.uniqueChatId.includes(user?._id) &&
        senderData?._id != user._id
      ) {
        if (senderData?._id != selectedUser?._id) {
          dispatch(addToChatRoomsWithUnreadMessages(senderData?.uniqueChatId));
          dispatch(addToMyPrivateChatRooms(senderData));
        } else {
          markAsRead(dispatch, setLatestMessageAsRead, senderData);
        }
      }
    });

    return () => {
      socket.off("new_privte_message_received");
    };
  }, [dispatch, selectedUser, user._id]);

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
    //This return function acts as a cleanup function for the useEffect.
    // It cancels the setTimeout if search.value changes before the 300 ms delay completes, avoiding unnecessary searchUsers calls.
    // This helps make sure only the latest input triggers the search, effectively debouncing it.
  }, [search.value, user._id]);

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

        {search.value &&
          (searchResults?.length > 0 ? (
            <ul className="menu bg-base-300 w-full rounded-box mt-2">
              {searchResults?.map((searchResultUser) => (
                <li
                  key={searchResultUser._id}
                  onClick={() => {
                    handleRoomSelect(dispatch, searchResultUser, user);
                    search.clear();
                  }}
                >
                  <div className="flex items-center gap-2">
                    <img
                      src={searchResultUser?.avatar?.url}
                      alt=""
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
                <Link to={"/about/find-users"}>
                  <button className="btn btn-primary btn-sm">
                    Find Friends
                  </button>
                </Link>
              </div>
            </div>
          ))}
      </div>

      {/* Scrollable user list */}
      <ul className="menu flex-row p-2 overflow-y-auto">
        {myPrivateChatRooms?.map((chatRoom, index) => (
          <li
            className="w-full py-2 cursor-pointer"
            key={index}
            onClick={() => {
              handleRoomSelect(dispatch, chatRoom, user);
              markAsRead(dispatch, setLatestMessageAsRead, chatRoom);
            }}
          >
            <div className="flex items-center gap-3">
              {/* User Avatar */}
              <div className="avatar">
                <div className="w-12 rounded-full">
                  <img src={chatRoom?.avatar?.url} alt="user avatar" />
                </div>
              </div>

              {/* Username and Latest Message */}
              <div className="flex-1">
                <p className="font-semibold">{chatRoom?.username}</p>
                <p
                  className={`text-sm ${
                    chatRoom?.latestMessage?.receiver?.messageStatus ===
                      "sent" && chatRoom?.latestMessage?.sender != user._id
                      ? "text-white"
                      : "text-gray-500"
                  }`}
                  style={{ maxWidth: "15rem" }}
                >
                  {truncateMessage(chatRoom?.latestMessage?.message)}
                </p>
              </div>

              {/* Notification Dot */}
              {chatRoom?.latestMessage?.receiver?.messageStatus === "sent" &&
                chatRoom?.latestMessage?.sender != user._id && (
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
