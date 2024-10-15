import React from "react";
import SendSharpIcon from "@mui/icons-material/SendSharp";
import AttachFileSharpIcon from "@mui/icons-material/AttachFileSharp";

export default function MessageBar({ position }) {
  return (
    <div
      className={`${
        position === "whisper" ? "bg-base-300" : ""
      } p-2 bg-base-100 flex-none `}
    >
      <div className="flex items-center gap-2">
        {position === "whisper" ? null : (
          <button className="btn flex-shrink-0">
            <AttachFileSharpIcon />
          </button>
        )}

        <input
          type="text"
          className="grow input input-bordered"
          placeholder="Type a message..."
        />
        {/* Send button taking only the required width */}
        <button className="btn flex-shrink-0">
          <SendSharpIcon />
        </button>
      </div>
    </div>
  );
}
