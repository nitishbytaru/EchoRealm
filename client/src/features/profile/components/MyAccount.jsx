import toast from "react-hot-toast";
import { useTransition } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import Loading from "../../../components/Loading.jsx";
import { deleteMyAccountApi } from "../api/user.api.js";
import { setIsLoggedIn, setUser } from "../../../app/slices/auth.slice.js";
import { handleDeleteAllEchoLinkApi } from "../../echoLink/api/echo_link.api.js";
import { deleteAllMessagesInEchoShoutApi } from "../../echoShout/api/echo_shout.api.js";
import {
  deleteAllSentMumblesApi,
  deleteAllRecievedMumblesApi,
} from "../../echoMumble/api/echo_mumble.api.js";

function MyAccount() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const constantCSS = "btn bg-primary p-2 m-2 rounded-xl sm:text-lg";

  const [isPending, startTransition] = useTransition();

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

  const deleteAllRecievedMumbles = () => {
    try {
      startTransition(async () => {
        const response = await deleteAllRecievedMumblesApi();
        if (response?.data?.message) {
          toast.success(response.data.message);
        }
      });
    } catch (error) {
      console.error("Error deleting received mumbles:", error);
      toast.error("Failed to delete all received mumbles.");
    }
  };

  const deleteAllEchoLink = () => {
    try {
      startTransition(async () => {
        const response = await handleDeleteAllEchoLinkApi();
        if (response?.data?.message) {
          toast.success(response.data.message);
        }
      });
    } catch (error) {
      console.error("Error deleting all echo links:", error);
      toast.error("Failed to delete all echo links.");
    }
  };

  const deleteAllSentMumbles = () => {
    try {
      startTransition(async () => {
        const response = await deleteAllSentMumblesApi();
        if (response?.data?.message) {
          toast.success(response.data.message);
        }
      });
    } catch (error) {
      console.error("Error deleting all sent mumbles:", error);
      toast.error("Failed to delete all sent mumbles.");
    }
  };

  const deleteAllMessagesInEchoShout = () => {
    try {
      startTransition(async () => {
        const response = await deleteAllMessagesInEchoShoutApi();
        if (response?.data?.message) {
          toast.success(response.data.message);
        }
      });
    } catch (error) {
      console.error("Error deleting all messages in EchoShout:", error);
      toast.error("Failed to delete all messages in EchoShout.");
    }
  };

  const deleteMyAccount = () => {
    try {
      startTransition(async () => {
        const response = await deleteMyAccountApi();
        dispatch(setUser(null));
        dispatch(setIsLoggedIn(false));
        localStorage.setItem("allowFetch", false);

        if (response?.data?.message) {
          toast.success(response.data.message);
        }

        navigate("/");
      });
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("Failed to delete the account.");
    }
  };

  if (isPending) return <Loading />;

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
