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
        <div className="modal-box">
          <div className="flex">
            {localStorage.getItem("userId") === "1" ? (
              <div className="w-full mt-4 flex">
                <Link
                  to="/listen-whisper"
                  className="btn bg-base-300 rounded-lg text-sm"
                  onClick={() => document.getElementById("my_modal_1").close()}
                >
                  <MailOutlineIcon />
                  Checkout my Whispers
                </Link>
              </div>
            ) : null}
            <div className="w-full mt-4">
              <Link
                to="/create-whisper"
                className="btn bg-base-300 rounded-lg text-sm"
                onClick={() => document.getElementById("my_modal_1").close()}
              >
                <SendIcon />
                Whisper to someone
              </Link>
            </div>
          </div>
          <div className="modal-action">
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button className="btn bg-base-300">Close</button>
            </form>
          </div>
        </div>
      </dialog>
    </>
  );
}

export default WhisperIcon;
