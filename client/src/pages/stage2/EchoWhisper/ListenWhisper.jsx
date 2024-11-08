import React, { memo, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { deleteWhisper, getWhispers } from "../../../api/echoWhisperApi";

const ListenWhisper = memo(() => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const func = async () => {
      const response = await getWhispers();
      setMessages(response?.data?.whispers || []);
    };
    func();
  }, []);

  const callDeleteWhisper = (e, message) => {
    e.preventDefault();

    toast((t) => (
      <div className="p-4 space-y-4">
        {/* Message content at the top */}
        <p className="text-sm text-gray-700">
          Delete whisper by <b>@{message?.sender || "anonymous"}</b>
        </p>

        {/* Button container for Delete and Dismiss */}
        <div className="flex justify-between pt-4 border-t border-gray-200">
          <button
            onClick={() => {
              confirmDelete(message._id); // Assuming this handles delete
              toast.dismiss(t.id); // Dismiss after confirmation
            }}
            className="btn btn-sm bg-red-500 hover:bg-red-600"
          >
            Delete
          </button>

          <button onClick={() => toast.dismiss(t.id)} className="btn btn-sm">
            Dismiss
          </button>
        </div>
      </div>
    ));
  };

  const confirmDelete = async (messageId) => {
    const response = await deleteWhisper(messageId);
    toast.success(response?.data?.message);
  };

  return (
    <div className="flex flex-col bg-base-200 h-full p-4 rounded-xl">
      <div className="overflow-y-auto">
        {/* Responsive grid layout */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className="card bg-base-100 w-full sm:w-92 shadow-xl"
            >
              <div className="card-body">
                <div className="card-actions justify-between">
                  <h2 className="card-title">
                    @{message?.sender ? message?.sender : "anonymous"}
                  </h2>
                  <button
                    className="btn btn-sm"
                    onClick={(e) => callDeleteWhisper(e, message)}
                  >
                    X
                  </button>
                </div>
                <p>{message?.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

export default ListenWhisper;
