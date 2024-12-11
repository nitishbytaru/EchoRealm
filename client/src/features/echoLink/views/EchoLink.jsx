import { useEffect, useRef, useState, useTransition } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import ChatBox from "../components/ChatBox";
import ChatRooms from "../components/ChatRooms";
import { getPrivateMessagesApi } from "../api/echo_link.api";
import { createUniquechatRoom } from "../../../utils/heplers/micro_funcs";
import {
  addOlderPrivateMessages,
  setPaginationDetails,
} from "../slices/echo_link.slice";

export default function EchoLink() {
  const dispatch = useDispatch();
  const { recieverId } = useParams();
  const { user, isMobile } = useSelector((state) => state.auth);
  const { pagination } = useSelector((state) => state.echoLink);

  const scrollRef = useRef(null);
  const loading = useRef(false);

  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);

  const [gettingOldMessages, startTransition] = useTransition();

  useEffect(() => {
    const loadOlderMessages = async () => {
      const uniqueRoomId = createUniquechatRoom(recieverId, user?._id);
      if (!pagination[uniqueRoomId]?.hasMoreMessages || loading.current) return;

      startTransition(async () => {
        loading.current = true;
        const nextPage = (pagination[uniqueRoomId]?.currentPage || 1) + 1;

        const response = await getPrivateMessagesApi(uniqueRoomId, nextPage);

        if (response?.data?.messages) {
          dispatch(addOlderPrivateMessages(response.data.messages));
          setShouldScrollToBottom(false); // Do not scroll for older messages

          dispatch(
            setPaginationDetails({
              roomId: uniqueRoomId,
              hasMoreMessages: response.data.hasMoreMessages,
              currentPage: nextPage,
            })
          );
        }
      });

      loading.current = false;
    };

    const scrollElement = scrollRef.current;

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
  }, [recieverId, pagination, dispatch, user]);

  return (
    <div className="h-full flex flex-col w-full">
      {/* Mobile View (WhatsApp-like layout) */}
      {isMobile ? (
        <div className="w-full h-full">
          {recieverId ? (
            // Show ChatBox in mobile view if a user is selected
            <div className="h-full bg-base-200 p-4 overflow-auto rounded-box">
              {console.log(recieverId)}
              <ChatBox
                scrollRef={scrollRef}
                shouldScrollToBottom={shouldScrollToBottom}
                setShouldScrollToBottom={setShouldScrollToBottom}
                gettingOldMessages={gettingOldMessages}
              />
            </div>
          ) : (
            // Show UserList in mobile view if no user is selected
            <div className="h-full">
              <ChatRooms />
            </div>
          )}
        </div>
      ) : (
        // Larger screens (side-by-side layout)
        <div className="grid grid-cols-12 w-full h-full">
          <div className="col-span-3 overflow-auto hide-scrollBar bg-base-200 rounded-box mr-2">
            <ChatRooms />
          </div>
          <div className="col-span-9 bg-base-200 rounded-box p-2 flex-grow overflow-auto">
            {recieverId ? (
              <ChatBox
                scrollRef={scrollRef}
                shouldScrollToBottom={shouldScrollToBottom}
                setShouldScrollToBottom={setShouldScrollToBottom}
                gettingOldMessages={gettingOldMessages}
              />
            ) : (
              <div className="h-full flex justify-center items-center text-center bg-base-100 rounded-xl">
                <p className="text-xl font-semibold text-gray-600">
                  Select a user to open chat
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
