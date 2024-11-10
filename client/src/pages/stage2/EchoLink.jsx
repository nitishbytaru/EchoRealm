import ChatRooms from "../../components/EchoLink/ChatRooms";
import ChatBox from "../../components/EchoLink/chat/ChatBox";
import { useSelector } from "react-redux";

// There is a lot of redundency in this components there are alot of unnecessary ccomponents
// need to refactor the entire code
//ALSO TAKE CARE OF THE REGISTER.jsx file

// ___________________________________________ //
// a lot of code is written multiple times for
// mobile view and laptop view take care of it

export default function EchoLink() {
  const { selectedUser } = useSelector((state) => state.echoLink);

  return (
    <div className="h-full flex flex-col w-full">
      {/* Mobile View (WhatsApp-like layout) */}
      <div className="sm:hidden w-full h-full">
        {/* Show UserList if no user is selected, otherwise show ChatBox */}
        {!selectedUser ? (
          <div className="w-full h-full">
            {/* UserList */}
            <ChatRooms />
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
          <ChatRooms />
        </div>
        <div className="col-span-9 bg-base-200 rounded-box p-2 flex-grow overflow-auto">
          <ChatBox />
        </div>
      </div>
    </div>
  );
}
