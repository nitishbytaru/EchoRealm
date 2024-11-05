import { useFileHandler, useInputValidation } from "6pp";
import SendSharpIcon from "@mui/icons-material/SendSharp";
import AttachFileSharpIcon from "@mui/icons-material/AttachFileSharp";
import toast from "react-hot-toast";
import { sendMessage } from "../../api/echoShoutApi";

export default function MessageBar({ position }) {
  // Using 6pp package for input data handling
  const attachments = useFileHandler("single");
  const message = useInputValidation("");

  const sendCurrentMessage = async () => {
    if (!message.value) {
      return toast.error("enter a message");
    }

    const formData = new FormData();
    formData.append("message", message.value);
    if (attachments.file) {
      formData.append("attachments", attachments.file);
    }

    const response = await sendMessage(formData);
    console.log(response);

    message.clear();
    attachments.clear();
  };

  return (
    <div
      className={`${
        position === "whisper" ? "bg-base-300" : "bg-base-100"
      } pt-2 sm:p-4 flex-none`}
    >
      <div className="flex items-center gap-1 sm:gap-2">
        {position === "whisper" ? null : (
          <button className="btn btn-sm sm:btn-md flex-shrink-0 relative">
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
        )}

        <input
          type="text"
          className="grow input input-sm sm:input-md input-bordered"
          placeholder="Type a message..."
          onChange={message.changeHandler}
          value={message.value}
        />
        {/* Send button taking only the required width */}
        <button
          className="btn btn-sm sm:btn-md flex-shrink-0"
          onClick={sendCurrentMessage}
        >
          <SendSharpIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
        </button>
      </div>
    </div>
  );
}
