import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { useEffect, useState, useTransition } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useFileHandler, useInputValidation } from "6pp";

import Loading from "../../../utils/ui/Loading.jsx";
import { addToMyPrivateChatRooms } from "../slices/echo_link.slice.js";
import {
  createGroupChatApi,
  searchEchoLinkFriendsApi,
} from "../api/echo_link.api.js";

function GroupChat() {
  const dispatch = useDispatch();

  const { user, isMobile } = useSelector((state) => state.auth);

  const groupName = useInputValidation("");
  const groupProfile = useFileHandler("single");
  const search = useInputValidation("");

  const [groupMembers, setGroupMembers] = useState([]);
  const [searchResults, setSearchResults] = useState(null);

  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (search.value) {
        searchEchoLinkFriendsApi(search.value)
          .then((users) => {
            const filteredUsers = users.filter(
              (field) => field._id !== user._id
            );
            setSearchResults(filteredUsers);
          })
          .catch((err) => console.error(err));
      } else {
        setSearchResults([]);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [search.value, user._id]);

  function addGroupMember(searchResultUser) {
    setGroupMembers((prev) => {
      if (!prev.some((member) => member.id === searchResultUser.id)) {
        return [...prev, searchResultUser];
      }
      return prev;
    });
    search.clear();
  }

  const createNewGroup = () => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("groupName", groupName.value);
      formData.append("groupProfilePicture", groupProfile.file);
      formData.append("groupMembers", JSON.stringify(groupMembers));

      try {
        const response = await createGroupChatApi(formData);
        dispatch(addToMyPrivateChatRooms(response?.data?.newGroupDetails));
        toast.success("GroupCreated Refresh To access");
      } catch (error) {
        console.error("Error creating group:", error);
        toast.error("Failed to create group. Please try again.");
      } finally {
        setGroupMembers([]);
        groupName.clear();
        groupProfile.clear();
      }
    });
  };

  if (isPending) return <Loading />;
  return (
    <dialog id="my_modal_9" className="modal modal-bottom sm:modal-middle">
      <div className="modal-box">
        <p className="py-4 text-xl font-semibold">Create a New Group</p>

        {/* Group Name Input */}
        <div className="mb-4">
          <label
            className={`input input-bordered flex items-center gap-2 w-full ${
              isMobile ? "input-sm" : ""
            }`}
          >
            GroupName:
            <input
              type="text"
              className="grow"
              placeholder="Enter group name"
              name="groupName"
              value={groupName.value}
              onChange={groupName.changeHandler}
            />
          </label>
        </div>

        {/* Group Profile Picture Input */}
        <div className="mb-4">
          <div className="text-left py-2">Group Profile Picture:</div>
          <label
            className={`input input-bordered flex items-center p-0 gap-2 w-full ${
              isMobile ? "input-sm" : ""
            }`}
          >
            <input
              type="file"
              name="avatar"
              onChange={groupProfile.changeHandler}
              className={`file-input ${
                isMobile ? "file-input-sm" : "file-input-md"
              } w-full max-w-xs`}
            />
          </label>
        </div>

        {/* Search Users */}
        <div className="sticky top-0 p-2 z-10">
          <label className="input input-bordered flex items-center gap-2">
            <input
              type="text"
              className="grow"
              placeholder="Search Users"
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

          {search.value &&
            (searchResults?.length > 0 ? (
              <ul className="menu bg-base-300 w-full rounded-box mt-2">
                {searchResults.map((searchResultUser) => (
                  <li
                    key={searchResultUser._id}
                    onClick={() =>
                      addGroupMember({
                        id: searchResultUser._id,
                        username: searchResultUser.username,
                      })
                    }
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={searchResultUser?.avatar?.url}
                        alt={`${searchResultUser.username}'s avatar`}
                        className="w-10 h-10 object-cover rounded-full"
                        crossOrigin="anonymous"
                      />
                      <p>@{searchResultUser.username}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="menu bg-base-300 w-full rounded-box mt-2">
                <div className="flex justify-between items-center">
                  <p>No User Found</p>
                  <Link to="/about/find-users">
                    <button className="btn btn-primary btn-sm">
                      Find Friends
                    </button>
                  </Link>
                </div>
              </div>
            ))}
        </div>

        {/* Display Selected Members */}
        <div className="my-4">
          <h3 className="text-lg font-semibold mb-2">Group Members</h3>
          <ul className="menu bg-base-100 rounded-box">
            {groupMembers.map((member) => (
              <li
                key={member.id}
                className="flex items-center gap-2 text-green-300"
              >
                <span>@{member.username}</span>
              </li>
            ))}
          </ul>
        </div>

        <button
          className="btn rounded-lg w-full"
          onClick={() => {
            createNewGroup();
            document.getElementById("my_modal_9").close();
          }}
        >
          Create New Group
        </button>

        <form className="modal-action">
          <button className="btn" formMethod="dialog">
            Close
          </button>
        </form>
      </div>
    </dialog>
  );
}

export default GroupChat;
