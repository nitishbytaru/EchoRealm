import ChatRooms from "../../components/EchoLink/ChatRooms";
import ChatBox from "../../components/EchoLink/chat/ChatBox";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";

export default function EchoLink() {

  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  const { selectedUser } = useSelector((state) => state.echoLink);

  // Update the isMobile state based on window size
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="h-full flex flex-col w-full">
      {/* Mobile View (WhatsApp-like layout) */}
      {isMobile ? (
        <div className="w-full h-full">
          {selectedUser ? (
            // Show ChatBox in mobile view if a user is selected
            <div className="h-full bg-base-200 p-4 overflow-auto rounded-box">
              <ChatBox />
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
            {selectedUser ? (
              <ChatBox />
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
