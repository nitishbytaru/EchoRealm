import { useInputValidation } from "6pp";
import { LoaderIcon } from "react-hot-toast";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import socket from "../../../sockets/socket.js";
import Loading from "../../../components/Loading.jsx";
import { getEchoShoutsApi } from "../api/echo_shout.api.js";
import MessageBar from "../../../components/MessageBar.jsx";
import ChatHistoryBox from "../components/ChatHistoryBox.jsx";
import { sendEchoShoutMessage } from "../../../utils/heplers/micro_funcs.js";
import { useDebouncedSearchResults } from "../../../hooks/useDebouncedSearchResults.js";
import {
  addEchoShoutMessage,
  addOlderShouts,
  setEchoShoutMessages,
  setPaginationDetails,
} from "../slices/echo_shout.slice.js";

function EchoShout() {
  const dispatch = useDispatch();

  const { isLoggedIn } = useSelector((state) => state.auth);
  const { messages, pagination } = useSelector((state) => state.echoShout);

  const [mentions, setMentions] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectSearchBar, setSelectSearchBar] = useState(false);
  const [echoShoutMessageData, setEchoShoutMessageData] = useState("");
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);

  const loading = useRef(false);
  const shoutScrollRef = useRef(null);

  const [isFetcthing, startTransitionToFetch] = useState(false);
  const [gettingOldMessages, startTransitionToGetOldMessages] = useState(false);

  const search = useInputValidation("");
  let searchResults = useDebouncedSearchResults(search.value);

  // Listen for new messages
  useEffect(() => {
    const handleNewMessage = (latestMessage) => {
      dispatch(addEchoShoutMessage(latestMessage));
      setShouldScrollToBottom(true);
    };

    socket.on("send_latest_echoShout_message", handleNewMessage);

    return () => {
      socket.off("send_latest_echoShout_message", handleNewMessage);
    };
  }, [dispatch]);

  // Fetch messages on mount
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        startTransitionToFetch(true);
        const response = await getEchoShoutsApi();
        dispatch(setEchoShoutMessages(response?.data?.messages || []));
        dispatch(
          setPaginationDetails({
            hasMoreMessages: response.data.hasMoreMessages,
            currentPage: response.data.page,
          })
        );
        setShouldScrollToBottom(true);
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        startTransitionToFetch(false);
      }
    };

    fetchMessages();
  }, [dispatch]);

  // Handle sending new messages
  useEffect(() => {
    if (echoShoutMessageData) {
      setIsUploading(true);
      sendEchoShoutMessage(
        setSelectSearchBar,
        mentions,
        echoShoutMessageData,
        setMentions,
        setEchoShoutMessageData,
        setIsUploading
      );
    }
  }, [dispatch, echoShoutMessageData, mentions]);

  function addMentionFunc(mentionedUser) {
    setMentions((prev) => [...prev, mentionedUser]);
    setSelectSearchBar(false);
  }

  // Load older messages
  useEffect(() => {
    const loadOlderMessages = async () => {
      if (!pagination?.hasMoreMessages || loading.current) return;

      loading.current = true;
      const nextPage = (pagination?.currentPage || 1) + 1;
      try {
        startTransitionToGetOldMessages(true);
        const response = await getEchoShoutsApi(nextPage);
        if (response?.data?.messages) {
          dispatch(addOlderShouts(response.data.messages));
          setShouldScrollToBottom(false);

          dispatch(
            setPaginationDetails({
              hasMoreMessages: response.data.hasMoreMessages,
              currentPage: nextPage,
            })
          );
        }
      } catch (error) {
        console.error("Error loading older messages:", error);
      } finally {
        startTransitionToGetOldMessages(false);
        loading.current = false;
      }
    };

    const scrollElement = shoutScrollRef.current;

    const handleScroll = () => {
      if (scrollElement.scrollTop === 0) {
        loadOlderMessages();
      }
    };

    if (scrollElement) {
      scrollElement.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (scrollElement) {
        scrollElement.removeEventListener("scroll", handleScroll);
      }
    };
  }, [pagination, dispatch, messages]);

  if (isFetcthing) return <Loading />;

  return (
    <div className="h-full flex flex-col bg-base-100">
      {/* Scrollable Messages Section */}
      {messages.length > 0 && (
        <ChatHistoryBox
          shoutScrollRef={shoutScrollRef}
          shouldScrollToBottom={shouldScrollToBottom}
          messages={messages}
          gettingOldMessages={gettingOldMessages}
        />
      )}

      {/* MessageBar for Sending Messages */}
      {isLoggedIn && (
        <>
          {selectSearchBar && (
            <div className="absolute sm:bottom-24 bottom-14">
              <div className="sticky top-0 p-2 sm:w-80 ">
                {searchResults?.length > 0 && (
                  <ul className="dropdown-content menu bg-base-300 w-full rounded-box mt-2">
                    {searchResults.map(({ user }) => (
                      <li
                        key={user._id}
                        onClick={() => {
                          addMentionFunc(user);
                          search.clear();
                        }}
                      >
                        <div className="p-1 sm:p-2">
                          <img
                            src={user?.avatar?.url}
                            alt=""
                            className="w-10 h-10 object-cover rounded-full"
                          />
                          <p>@{user.username}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                <label className="input input-bordered input-sm sm:input-md flex items-center gap-2">
                  <input
                    type="text"
                    className="grow"
                    placeholder="Search Users"
                    value={search.value}
                    onChange={search.changeHandler}
                  />
                </label>
              </div>
            </div>
          )}
          <div className="flex sm:flex-row items-center justify-center bg-base-100 sm:p-2 mb-4 sm:mb-0">
            {mentions.length > 0 && (
              <div className="absolute z-10 sm:left-7 left-3 sm:bottom-24 bottom-14 text-sm sm:text-lg">
                <div className="flex">
                  {mentions.map((mention, index) => (
                    <span key={index} className="bg-primary px-2 py-1 rounded">
                      @{mention?.username}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div className="flex-shrink-0 sm:pt-0 sm:mx-0 pt-2 mx-1">
              <button
                className="btn btn-sm sm:btn-md sm:text-lg"
                onClick={() => setSelectSearchBar((prev) => !prev)}
              >
                @
              </button>
            </div>
            <div className="w-full">
              {isUploading ? (
                <div className="flex items-center justify-center">
                  <LoaderIcon style={{ width: "25px", height: "25px" }} />
                </div>
              ) : (
                <MessageBar setMessageData={setEchoShoutMessageData} />
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default EchoShout;
