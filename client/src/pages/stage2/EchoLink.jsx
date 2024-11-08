import { useCallback } from "react";
import UserList from "../../components/EchoLink/UserList";
import ChatBox from "../../components/EchoLink/chat/ChatBox";
import { useDispatch, useSelector } from "react-redux";
import socket from "../../sockets/socket";
import {
  setEchoLinkMessages,
  setSelectedUser,
} from "../../app/slices/echoLinkSlice";
import { getPrivateMessages } from "../../api/echoLinkApi";

// There is a lot of redundency in this components there are alot of unnecessary ccomponents
// need to refactor the entire code
//ALSO TAKE CARE OF THE REGISTER.jsx file

export default function EchoLink() {
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const { selectedUser } = useSelector((state) => state.echoLink);

  const handleUserSelect = useCallback(
    async (currentSelecteduser) => {
      dispatch(setSelectedUser(currentSelecteduser));

      //this functions is also in the backend if possible remove from one place
      const uniqueRoomId = [currentSelecteduser?._id, user?._id]
        .sort()
        .join("-");

      socket.emit("joinEchoLink", uniqueRoomId);

      const response = await getPrivateMessages(uniqueRoomId);
      dispatch(setEchoLinkMessages(response?.data?.privateMessages?.messages));
    },
    [dispatch, user?._id]
  );

  return (
    <div className="h-full flex flex-col w-full">
      {/* Mobile View (WhatsApp-like layout) */}
      <div className="sm:hidden w-full h-full">
        {/* Show UserList if no user is selected, otherwise show ChatBox */}
        {!selectedUser ? (
          <div className="w-full h-full">
            {/* UserList */}
            <UserList onUserSelect={handleUserSelect} />
          </div>
        ) : (
          <div className="w-full h-full relative">
            {/* ChatBox */}
            <div className="h-full bg-base-200 p-4 overflow-auto rounded-box">
              <ChatBox />
            </div>
          </div>
        )}
      </div>

      {/* Larger screens (unchanged) */}
      <div className="hidden sm:grid sm:grid-cols-12 w-full h-full">
        <div className="col-span-3 overflow-auto hide-scrollBar bg-base-200 rounded-box mr-2">
          <UserList onUserSelect={handleUserSelect} />
        </div>
        <div className="col-span-9 bg-base-200 rounded-box p-2 flex-grow overflow-auto">
          <ChatBox />
        </div>
      </div>
    </div>
  );
}
