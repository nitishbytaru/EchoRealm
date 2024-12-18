import toast from "react-hot-toast";
import { useFileHandler, useInputValidation } from "6pp";

import { handleKeyPress } from "../utils/heplers/micro_funcs.js";
import {
  SendSharpIcon,
  AttachFileSharpIcon,
  CloseIcon,
} from "../utils/icons/export_icons.js";

// eslint-disable-next-line react/prop-types
export default function MessageBar({ setMessageData }) {
  const attachments = useFileHandler("single");
  const message = useInputValidation("");

  const sendCurrentMessage = async () => {
    if (!message.value && !attachments.file) {
      toast.error("Please enter a message or select a file");
      return;
    }

    const formData = new FormData();
    if (message.value) {
      formData.append("message", message.value);
    }
    if (attachments.file) {
      formData.append("attachments", attachments.file);
    }

    try {
      setMessageData(formData);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message. Please try again.");
      return error;
    } finally {
      message.clear();
      attachments.clear();
    }
  };

  const CHARACTER_LIMIT = 55;

  const isOverLimit = message.value.length > CHARACTER_LIMIT;

  return (
    <div className="bg-base-100 pt-2 sm:p-4 flex-none">
      <div className="flex items-center gap-1 sm:gap-2">
        <div className="relative">
          <button className="btn btn-sm sm:btn-md flex-shrink-0">
            <label
              htmlFor="attachments"
              className="cursor-pointer flex items-center"
            >
              <AttachFileSharpIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
            </label>
            <input
              id="attachments"
              name="attachments"
              type="file"
              accept="image/*"
              onChange={attachments.changeHandler}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </button>
          {attachments.file && (
            <span className="absolute -top-2 -right-2 bg-primary text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
              •
            </span>
          )}
        </div>

        <div className="grow relative">
          <input
            type="text"
            className={`w-full input input-sm sm:input-md input-bordered pr-10 ${
              isOverLimit ? "border-red-500" : ""
            }`}
            placeholder={
              attachments.file ? "File selected" : "Type a message..."
            }
            onChange={message.changeHandler}
            value={message.value}
            onKeyDown={(e) => handleKeyPress(e, sendCurrentMessage)}
          />
          {attachments.file && (
            <button
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
              onClick={() => attachments.clear()}
            >
              <CloseIcon sx={{ fontSize: 20 }} />
            </button>
          )}
        </div>

        {/* limit exceeded warning */}
        <div className="text-right text-xs mt-1">
          <span
            className={`${
              isOverLimit ? "text-red-500 font-bold" : "text-gray-500"
            }`}
          >
            {message.value.length}/{CHARACTER_LIMIT}
          </span>
        </div>

        <button
          className="btn btn-sm sm:btn-md flex-shrink-0"
          onClick={sendCurrentMessage}
          disabled={isOverLimit}
        >
          <SendSharpIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
        </button>
      </div>
    </div>
  );
}
