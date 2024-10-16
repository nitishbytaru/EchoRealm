import React, { useState, useCallback } from "react";
import UserList from "../../components/EchoLink/UserList";
import ChatBox from "../../components/EchoLink/chat/ChatBox";

export default function EchoLink() {
  const [selectedUser, setSelectedUser] = useState(null);

  const handleUserSelect = useCallback((user) => {
    setSelectedUser(user);
  }, []);

  const handleBackClick = () => {
    setSelectedUser(null);
  };

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
              <ChatBox
                selectedUser={selectedUser}
                handleBackClick={handleBackClick}
              />
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
          <ChatBox selectedUser={selectedUser} />
        </div>
      </div>
    </div>
  );
}
