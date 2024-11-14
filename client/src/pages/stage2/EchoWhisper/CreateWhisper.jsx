import { useState } from "react";
import { useSelector } from "react-redux";
import { sendWhisper } from "../../../api/echoWhisperApi.js";
import toast from "react-hot-toast";
import { useInputValidation } from "6pp";
import { handleKeyPress } from "../../../heplerFunc/microFuncs.js";
import { SendSharpIcon } from "../../../heplerFunc/exportIcons.js";
import { useDebouncedSearchResults } from "../../../hooks/useDebouncedSearchResults.js";

function CreateWhisper() {
  const { user } = useSelector((state) => state.auth);

  const [selectedUser, setSelectedUser] = useState(null);
  const search = useInputValidation("");
  const message = useInputValidation("");
  const searchResults = useDebouncedSearchResults(search.value);

  //utility functions
  const handleUserSelect = (whisperTo) => {
    setSelectedUser(whisperTo);
    search.clear();
  };

  const sendCurrentWhisper = async () => {
    if (!selectedUser) {
      return toast.error("Please select a user to send a whisper", {
        autoClose: 5000,
        icon: "🚫",
      });
    }

    if (!message.value) {
      return toast.error("Enter a message to send a whisper", {
        autoClose: 5000,
        icon: "✉️",
      });
    }

    const data = {
      message: message.value,
      receiver: selectedUser._id,
      sender: user?.username || null,
    };

    try {
      const response = await sendWhisper(data);
      toast.success(response?.data?.message);
    } catch (error) {
      console.log(error);
    } finally {
      message.clear();
      setSelectedUser(null);
    }
  };

  return (
    <div className="bg-base-200 h-full rounded-xl pt-2">
      <div className="flex flex-col bg-base-300 h-full w-3/4 mx-auto rounded-xl">
        <div className="flex-none px-4 py-2">
          <label className="input input-bordered flex items-center gap-2">
            <input
              type="text"
              className="grow"
              placeholder="Search user to whisper"
              value={search.value}
              onChange={search.changeHandler}
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              className="h-4 w-4 opacity-70"
            >
              <path
                fillRule="evenodd"
                d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
                clipRule="evenodd"
              />
            </svg>
          </label>
          {searchResults?.length > 0 && (
            <ul className="menu bg-base-200 w-full rounded-box mt-2">
              {searchResults.map((searchResultUser) => (
                <li
                  key={searchResultUser?._id}
                  onClick={() => handleUserSelect(searchResultUser)}
                >
                  <div className="sm:text-2xl">
                    <img
                      src={searchResultUser?.avatar?.url}
                      alt=""
                      className="avatar rounded-full w-10 h-10 sm:w-14 sm:h-14"
                    />
                    <p>{searchResultUser?.username}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="flex-grow">
          {selectedUser ? (
            <>
              <div className="flex avatar justify-center">
                <div className="w-2/5 sm:w-1/4 rounded-full">
                  <img
                    src={selectedUser?.avatar?.url}
                    alt={selectedUser.username}
                  />
                </div>
              </div>
              <div className="flex justify-center items-center">
                <p className="text-3xl">@{selectedUser.username}</p>
              </div>
            </>
          ) : (
            <div className="flex justify-center items-center h-full">
              <p className="text-xl text-gray-500 text-center">
                Search for a User to send a whisper
              </p>
            </div>
          )}
        </div>

        {/* this is the message bar for creating a whisper */}
        <div className="flex-none px-2 mb-2">
          <div className={"bg-base-300 pt-2 sm:p-4 flex-none"}>
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="grow relative">
                <input
                  type="text"
                  className="w-full input input-sm sm:input-md input-bordered pr-10"
                  placeholder="Type a message..."
                  onChange={message.changeHandler}
                  value={message.value}
                  onKeyDown={(e) => handleKeyPress(e, sendCurrentWhisper)}
                />
              </div>

              <button
                className="btn btn-sm sm:btn-md flex-shrink-0"
                onClick={sendCurrentWhisper}
              >
                <SendSharpIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateWhisper;
