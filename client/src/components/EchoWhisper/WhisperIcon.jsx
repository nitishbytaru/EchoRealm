import React from "react";
import { Link } from "react-router-dom";
import SendIcon from "@mui/icons-material/Send";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import ForumOutlinedIcon from "@mui/icons-material/ForumOutlined";

function WhisperIcon({ position }) {
  return (
    <>
      {/* Open the modal using document.getElementById('ID').showModal() method */}
      <button
        className={position === "left" ? "flex" : ""}
        onClick={() => document.getElementById("my_modal_1").showModal()}
      >
        <ForumOutlinedIcon sx={position === "left" ? { fontSize: 35 } : null} />
        <div>EchoWhisper</div>
      </button>
      <dialog id="my_modal_1" className="modal">
        <div className="modal-box max-w-xs sm:max-w-md">
          <div className="flex flex-col sm:flex-row gap-2">
            {localStorage.getItem("userId") === "1" ? (
              <div className="w-full mt-2 sm:mt-4 flex">
                <Link
                  to="/listen-whisper"
                  className="btn btn-sm sm:btn-lg bg-base-300 rounded-lg w-full text-xs sm:text-sm"
                  onClick={() => document.getElementById("my_modal_1").close()}
                >
                  <MailOutlineIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
                  <span>Checkout Whispers</span>
                </Link>
              </div>
            ) : null}
            <div className="w-full mt-2 sm:mt-4 flex">
              <Link
                to="/create-whisper"
                className="btn btn-sm sm:btn-lg bg-base-300 rounded-lg w-full text-xs sm:text-sm"
                onClick={() => document.getElementById("my_modal_1").close()}
              >
                <SendIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
                <span>Whisper to someone</span>
              </Link>
            </div>
          </div>
          <div className="modal-action">
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button className="btn btn-sm sm:btn-md bg-base-300 w-full">
                Close
              </button>
            </form>
          </div>
        </div>
      </dialog>
    </>
  );
}

export default WhisperIcon;
