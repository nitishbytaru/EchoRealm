import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import socket from "../../sockets/socket.js";
import moment from "moment";
import MessageBar from "../../components/ui/MessageBar";
import { getEchoShouts, sendEchoShout } from "../../api/echoShoutApi";
import { setLoading } from "../../app/slices/authSlice.js";
import {
  addEchoShoutMessage,
  setEchoShoutMessages,
} from "../../app/slices/echoShoutSlice.js";
import { useAutoScroll } from "../../hooks/useAutoScroll.js";
import { useInputValidation } from "6pp";
import { useDebouncedSearchResults } from "../../hooks/useDebouncedSearchResults.js";

function EchoShout() {
  const dispatch = useDispatch();

  const { isLoggedIn, user } = useSelector((state) => state.auth);
  const { messages } = useSelector((state) => state.echoShout);
  const messagesEndRef = useAutoScroll(messages);

  const [echoShoutMessageData, setEchoShoutMessageData] = useState("");
  const [mentions, setMentions] = useState([]);
  const [selectSearchBar, setSelectSearchBar] = useState(false);

  const search = useInputValidation("");
  let searchResults = useDebouncedSearchResults(search.value);

  useEffect(() => {
    // Listen for new messages
    socket.on("send_latest_echoShout_message", (latestEchoShoutMessage) => {
      dispatch(addEchoShoutMessage(latestEchoShoutMessage));
    });

    // Cleanup on component unmount
    return () => {
      socket.off("send_latest_echoShout_message");
    };
  }, [dispatch]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await getEchoShouts();
        dispatch(setEchoShoutMessages(response?.data?.messages || []));
      } catch (error) {
        console.log(error);
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchMessages();
  }, [dispatch]);

  useEffect(() => {
    const sendEchoShoutMessage = async () => {
      setSelectSearchBar(false);
      setMentions([]);
      echoShoutMessageData.append("mentions", JSON.stringify(mentions));

      try {
        await sendEchoShout(echoShoutMessageData);
      } catch (error) {
        console.log(error);
      } finally {
        setEchoShoutMessageData("");
      }
    };
    if (echoShoutMessageData) {
      sendEchoShoutMessage();
    }
  }, [echoShoutMessageData]);

  function addMentionFunc(mentionedUser) {
    console.log(mentionedUser);
    setMentions((prev) => [...prev, mentionedUser]);
    setSelectSearchBar(false);
  }

  return (
    <div className="h-full flex flex-col bg-base-100">
      {/* Announcements section that grows and is scrollable if needed */}
      <div className="flex-grow overflow-y-auto bg-base-200 sm:p-4 mx-2 sm:mx-4 rounded-xl">
        {messages?.map(
          ({ message, sender, updatedAt, attachments, mentions }, index) => (
            <div
              className={`chat ${
                sender?._id === user?._id ? "chat-end" : "chat-start"
              }`}
              key={index}
            >
              <div className="chat-header text-sm sm:text-base mb-1">
                @{sender.username}
              </div>
              <div className="chat-bubble sm:text-sm p-2">
                {attachments[0]?.url && (
                  <img
                    src={attachments[0]?.url}
                    alt="attachment"
                    className="w-20 h-20 sm:w-24 sm:h-24 object-cover mb-2 rounded-lg"
                  />
                )}
                <div className="flex items-center justify-center">
                  {mentions.length > 0 ? (
                    <span className="text-lg font-semibold text-blue-800">{`@${mentions?.map(
                      (mention) => mention?.username
                    )} `}</span>
                  ) : null}
                  <p className="text-lg ml-2">{message}</p>
                </div>
              </div>
              <div className="chat-footer opacity-50 mt-1">
                <time className="text-xs opacity-50">
                  {moment(updatedAt).fromNow()}
                </time>
              </div>
            </div>
          )
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* MessageBar at the bottom */}
      {isLoggedIn && (
        <>
          {selectSearchBar ? (
            <div className="absolute sm:bottom-24 bottom-14">
              <div className="sticky top-0 p-2 sm:w-80 ">
                {searchResults?.length > 0 && (
                  <ul className="dropdown-content menu bg-base-300 w-full rounded-box mt-2">
                    {searchResults.map((searchResultUser) => (
                      <li
                        key={searchResultUser._id}
                        onClick={() => {
                          addMentionFunc(searchResultUser);
                          search.clear();
                        }}
                      >
                        <div className="p-1 sm:p-2">
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
                <label className="input input-bordered input-sm sm:input-md flex items-center gap-2">
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
              </div>
            </div>
          ) : (
            <></>
          )}
          <div className="flex sm:flex-row items-center justify-center bg-base-100 sm:p-2 mb-4 sm:mb-0">
            {/* mentions */}
            {mentions.length > 0 ? (
              <div className="absolute z-10 sm:left-7 left-3 sm:bottom-24 bottom-14 text-sm sm:text-lg">
                <div className="flex">
                  {mentions?.map((mention, index) => (
                    <span
                      key={index}
                      className="bg-primary"
                    >{`@${mention?.username}`}</span>
                  ))}
                </div>
              </div>
            ) : (
              <></>
            )}
            {/* Button Container search box */}
            <div className="flex-shrink-0 sm:pt-0 sm:mx-0 pt-2 mx-1">
              <button
                className="btn btn-sm sm:btn-md sm:text-lg"
                onClick={() => {
                  setSelectSearchBar((prev) => !prev);
                }}
              >
                @
              </button>
            </div>

            {/* MessageBar Container */}
            <div className="w-full">
              <MessageBar setMessageData={setEchoShoutMessageData} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default EchoShout;
