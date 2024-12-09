import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  SendIcon,
  MailOutlineIcon,
  ForumOutlinedIcon,
} from "../../../utils/icons/export_icons.js";

function MumbleIcon() {
  const { isLoggedIn, isMobile } = useSelector((state) => state.auth);
  return (
    <>
      {/* Open the modal using document.getElementById('ID').showModal() method */}
      <button
        className="flex"
        onClick={() => document.getElementById("my_modal_1").showModal()}
      >
        <div>
          <ForumOutlinedIcon />
        </div>
        {!isMobile ? <div className="ml-2">EchoMumble</div> : null}
      </button>

      <dialog id="my_modal_1" className="modal">
        <div className="modal-box max-w-xs sm:max-w-md">
          <div className="flex flex-col sm:flex-row gap-2">
            {isLoggedIn ? (
              <div className="w-full mt-2 sm:mt-4 flex">
                <Link
                  to="/mumbles/read"
                  className="btn btn-sm sm:btn-lg bg-base-300 rounded-lg w-full text-xs sm:text-sm"
                  onClick={() => document.getElementById("my_modal_1").close()}
                >
                  <MailOutlineIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
                  <span>Checkout Mumbles</span>
                </Link>
              </div>
            ) : null}
            <div className="w-full mt-2 sm:mt-4 flex">
              <Link
                to="/mumbles/send"
                className="btn btn-sm sm:btn-lg bg-base-300 rounded-lg w-full text-xs sm:text-sm"
                onClick={() => document.getElementById("my_modal_1").close()}
              >
                <SendIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
                <span>Mumble to someone</span>
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

export default MumbleIcon;
