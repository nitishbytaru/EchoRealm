import toast from "react-hot-toast";
import { deleteMyAccountApi } from "../../api/userApi";
import { deleteAllMessagesInEchoShoutApi } from "../../api/echoShoutApi";
import { handleDeleteAllEchoLinkApi } from "../../api/echoLinkApi";
import {
  deleteAllSentMumblesApi,
  deleteAllRecievedMumblesApi,
} from "../../api/echoMumbleApi";
import { setIsLoggedIn, setLoading, setUser } from "../../app/slices/authSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

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
    dispatch(setLoading(true));
    const response = await deleteAllRecievedMumblesApi();
    dispatch(setLoading(false));
    if (response?.data) {
      toast.success(response.data?.message);
    }
  };

  const deleteAllEchoLink = async () => {
    dispatch(setLoading(true));
    const response = await handleDeleteAllEchoLinkApi();
    dispatch(setLoading(false));
    if (response?.data) {
      toast.success(response.data?.message);
    }
  };

  const deleteAllSentMumbles = async () => {
    dispatch(setLoading(true));
    const response = await deleteAllSentMumblesApi();
    dispatch(setLoading(false));
    if (response?.data) {
      toast.success(response.data?.message);
    }
  };

  const deleteAllMessagesInEchoShout = async () => {
    dispatch(setLoading(true));
    const response = await deleteAllMessagesInEchoShoutApi();
    dispatch(setLoading(false));
    if (response?.data) {
      toast.success(response.data?.message);
    }
  };

  const deleteMyAccount = async () => {
    dispatch(setLoading(true));
    const response = await deleteMyAccountApi();
    dispatch(setLoading(false));
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
