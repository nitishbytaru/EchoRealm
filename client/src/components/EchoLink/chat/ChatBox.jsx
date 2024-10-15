import React from "react";
import MoreVertSharpIcon from "@mui/icons-material/MoreVertSharp";
import ChatHistory from "./ChatHistory";
import MessageBar from "../../ui/MessageBar";

function ChatBox({ selectedUser }) {
  if (selectedUser !== null) {
    localStorage.setItem("sendId", selectedUser.id);
  }
  return (
    <>
      {!selectedUser ? (
        <div className="h-full flex justify-center items-center text-center bg-base-100 rounded-xl">
          <p className="text-xl font-semibold text-gray-600">
            Select a user to open chat
          </p>
        </div>
      ) : (
        <div className="h-full flex flex-col">
          {/* this is the navbar with the dropdown menu  */}
          <div className="navbar bg-base-100 rounded-xl flex-none">
            <div className="flex-1">
              <div className="avatar flex items-center">
                <div className="w-10 rounded-full">
                  <img src={selectedUser.image} alt="User avatar" />
                </div>
                <p className="ml-2 flex items-center">{selectedUser.name}</p>
              </div>
            </div>
            <div className="flex-none">
              <details className="dropdown dropdown-end">
                <summary className="btn btn-sm bg-base-100 rounded-full">
                  <MoreVertSharpIcon />
                </summary>
                <ul className="menu dropdown-content bg-base-200 rounded-box z-[1] p-2 w-56 shadow mt-2">
                  <li>
                    <a> clear chat </a>
                  </li>
                  <li>
                    <a>delete friend</a>
                  </li>
                </ul>
              </details>
            </div>
          </div>

          {/* Chat area (takes up the rest of the space) */}
          <div className="flex-1 overflow-y-auto bg-base-100 mt-2 p-2 rounded-xl">
            <div className="h-full">
              {/* here when i refresh the chat is closing so when ever the user opens the chat then store it in the loacl storage and when ever we refresh it should return to that user only */}
              <ChatHistory />
            </div>
          </div>

          {/* this component is for the message bar */}
          <MessageBar />
        </div>
      )}
    </>
  );
}

export default ChatBox;
