import { useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

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

  const [gettingOldMessages, startTransition] = useState(false);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);

  useEffect(() => {
    const loadOlderMessages = async () => {
      console.log("lodaing");
      const uniqueRoomId = createUniquechatRoom(recieverId, user?._id);
      if (!pagination[uniqueRoomId]?.hasMoreMessages || loading.current) return;
      loading.current = true;
      const nextPage = (pagination[uniqueRoomId]?.currentPage || 1) + 1;

      try {
        startTransition(true);
        const response = await getPrivateMessagesApi(uniqueRoomId, nextPage);

        if (response?.data?.messages) {
          dispatch(addOlderPrivateMessages(response.data.messages));
          setShouldScrollToBottom(false);

          dispatch(
            setPaginationDetails({
              roomId: uniqueRoomId,
              hasMoreMessages: response.data.hasMoreMessages,
              currentPage: nextPage,
            })
          );
        }
      } catch (error) {
        console.error(error);
      } finally {
        startTransition(false);
        loading.current = false;
      }
    };

    const scrollElement = scrollRef.current;

    const handleScroll = () => {
      console.log("scrolling");
      if (scrollElement.scrollTop === 0) {
        console.log("reached top");
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
  }, [recieverId, dispatch, user, pagination]);

  return (
    <div className="h-full flex flex-col w-full">
      {/* Mobile View (WhatsApp-like layout) */}
      {isMobile ? (
        <div className="w-full h-full">
          {recieverId ? (
            // Show ChatBox in mobile view if a user is selected
            <div className="h-full bg-base-200 p-4 overflow-auto rounded-box">
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
