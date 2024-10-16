import React from "react";
import SendSharpIcon from "@mui/icons-material/SendSharp";
import AttachFileSharpIcon from "@mui/icons-material/AttachFileSharp";

export default function MessageBar({ position }) {
  return (
    <div
      className={`${
        position === "whisper" ? "bg-base-300" : "bg-base-100"
      } pt-2 sm:p-4 flex-none`}
    >
      <div className="flex items-center gap-1 sm:gap-2">
        {position === "whisper" ? null : (
          <button className="btn btn-sm sm:btn-md flex-shrink-0">
            <AttachFileSharpIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
          </button>
        )}

        <input
          type="text"
          className="grow input input-sm sm:input-md input-bordered"
          placeholder="Type a message..."
        />
        {/* Send button taking only the required width */}
        <button className="btn btn-sm sm:btn-md flex-shrink-0">
          <SendSharpIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
        </button>
      </div>
    </div>
  );
}
