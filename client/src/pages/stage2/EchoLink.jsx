import React, { useState, useCallback } from "react";
import UserList from "../../components/EchoLink/UserList";
import ChatBox from "../../components/EchoLink/chat/ChatBox";

export default function PrivateChat() {
  const [selectedUser, setSelectedUser] = useState(null);

  const handleUserSelect = useCallback((user) => {
    setSelectedUser(user);
  }, []);

  return (
    <div className="h-full flex">
      <div className="grid grid-cols-12 w-full h-full">
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
