import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { deleteMyAccountApi } from "../../api/user.api.js";
import { handleDeleteAllEchoLinkApi } from "../../api/echoLink.api.js";
import { deleteAllMessagesInEchoShoutApi } from "../../api/echoShout.api.js";
import {
  deleteAllSentMumblesApi,
  deleteAllRecievedMumblesApi,
} from "../../api/echoMumble.api.js";
import {
  setIsLoggedIn,
  setIsLoading,
  setUser,
} from "../../app/slices/authSlice";

function MyAccount() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const constantCSS = "btn bg-primary p-2 m-2 rounded-xl sm:text-lg ";

  const handleWarningBeforeDelete = (message, func) => {
    toast((t) => (
      <div className="p-4 space-y-4">
        {/* Message content at the top */}
        <p className="">Are you sure to delete {message} !!</p>

        {/* Button container for Delete and Dismiss */}
        <div className="flex justify-between pt-4 border-t border-gray-200">
          <button
            onClick={() => {
              func();
              toast.dismiss(t.id);
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

  const deleteAllRecievedMumbles = async () => {
    dispatch(setIsLoading(true));
    const response = await deleteAllRecievedMumblesApi();
    dispatch(setIsLoading(false));
    if (response?.data) {
      toast.success(response.data?.message);
    }
  };

  const deleteAllEchoLink = async () => {
    dispatch(setIsLoading(true));
    const response = await handleDeleteAllEchoLinkApi();
    dispatch(setIsLoading(false));
    if (response?.data) {
      toast.success(response.data?.message);
    }
  };

  const deleteAllSentMumbles = async () => {
    dispatch(setIsLoading(true));
    const response = await deleteAllSentMumblesApi();
    dispatch(setIsLoading(false));
    if (response?.data) {
      toast.success(response.data?.message);
    }
  };

  const deleteAllMessagesInEchoShout = async () => {
    dispatch(setIsLoading(true));
    const response = await deleteAllMessagesInEchoShoutApi();
    dispatch(setIsLoading(false));
    if (response?.data) {
      toast.success(response.data?.message);
    }
  };

  const deleteMyAccount = async () => {
    dispatch(setIsLoading(true));
    const response = await deleteMyAccountApi();
    dispatch(setIsLoading(false));
    dispatch(setUser(null));
    dispatch(setIsLoggedIn(false));
    localStorage.setItem("allowFetch", false);
    if (response?.data) {
      toast.success(response.data?.message);
    }
    navigate("/");
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <div className="text-center mb-6">
        <h1 className="sm:text-2xl text-lg mb-4 text-center">My Account</h1>

        <h2 className="text-lg sm:text-2xl font-semibold text-red-600">
          Warning: Any deletion performed here cannot be undone!
        </h2>
      </div>
      <div className="flex flex-col ">
        <button
          className={constantCSS}
          onClick={() =>
            handleWarningBeforeDelete("all chats", deleteAllEchoLink)
          }
        >
          delete all chats
        </button>
        <button
          className={constantCSS}
          onClick={() =>
            handleWarningBeforeDelete(
              "all your recieved Mumbles",
              deleteAllRecievedMumbles
            )
          }
        >
          delete all recieved Mumbles
        </button>
        <button
          className={constantCSS}
          onClick={() =>
            handleWarningBeforeDelete("all sent wispers", deleteAllSentMumbles)
          }
        >
          delete all sent Mumbles
        </button>
        <button
          className={constantCSS}
          onClick={() =>
            handleWarningBeforeDelete(
              "all messages in EchoShout",
              deleteAllMessagesInEchoShout
            )
          }
        >
          delete all messages in echoshout
        </button>
        <button
          className={constantCSS}
          onClick={() =>
            handleWarningBeforeDelete("YOUR ACCOUNT", deleteMyAccount)
          }
        >
          delete my account
        </button>
      </div>
    </div>
  );
}

export default MyAccount;
