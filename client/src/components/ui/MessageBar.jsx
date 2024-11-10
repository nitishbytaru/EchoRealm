import { useState } from "react";
import { useFileHandler, useInputValidation } from "6pp";
import toast from "react-hot-toast";
import { handleKeyPress } from "../../heplerFunc/microFuncs.js";
import {
  SendSharpIcon,
  AttachFileSharpIcon,
  CloseIcon,
} from "../../heplerFunc/exportIcons.js";

// eslint-disable-next-line react/prop-types
export default function MessageBar({ setMessageData }) {
  const [isUploading, setIsUploading] = useState(false);
  const attachments = useFileHandler("single");
  const message = useInputValidation("");

  const sendCurrentMessage = async () => {
    if (!message.value && !attachments.file) {
      return toast.error("Please enter a message or select a file");
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("message", message.value);
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
      setIsUploading(false);
      message.clear();
      attachments.clear();
    }
  };

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
              1
            </span>
          )}
        </div>

        <div className="grow relative">
          <input
            type="text"
            className="w-full input input-sm sm:input-md input-bordered pr-10"
            placeholder={
              attachments.file ? "File selected" : "Type a message..."
            }
            onChange={message.changeHandler}
            value={message.value}
            onKeyDown={() => handleKeyPress(sendCurrentMessage)}
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

        <button
          className={`btn btn-sm sm:btn-md flex-shrink-0 ${
            isUploading ? "loading" : ""
          }`}
          onClick={sendCurrentMessage}
          disabled={isUploading}
        >
          {isUploading ? (
            <span className="loading loading-spinner loading-lg"></span>
          ) : (
            <SendSharpIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
          )}
        </button>
      </div>
    </div>
  );
}
