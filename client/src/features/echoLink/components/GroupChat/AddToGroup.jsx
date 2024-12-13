import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { useInputValidation } from "6pp";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import LoadingSpinner from "../../../../components/LoadingSpinner.jsx";
import { addToMyPrivateChatRooms } from "../../slices/echo_link.slice.js";
import {
  updateMembersInGroupApi,
  searchEchoLinkFriendsApi,
} from "../../api/echo_link.api.js";

function AddToGroup() {
  const dispatch = useDispatch();

  const { user, isMobile } = useSelector((state) => state.auth);
  const { selectedChat } = useSelector((state) => state.echoLink);

  const search = useInputValidation("");

  const [groupMembers, setGroupMembers] = useState(
    selectedChat?.groupChatRoomMembers
  );
  const [searchResults, setSearchResults] = useState(null);

  const [isPending, startTransition] = useState(false);

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

  const addMembersToGroup = async () => {
    const groupId = selectedChat?._id;
    try {
      startTransition(true);
      const response = await updateMembersInGroupApi({
        groupId,
        groupMembers,
      });
      dispatch(addToMyPrivateChatRooms(response?.data?.newGroupDetails));
      toast.success("Adding group members");
    } catch (error) {
      console.error("Error adding group members:", error);
      toast.error("Failed to adding group members. Please try again.");
    } finally {
      startTransition(false);

      setGroupMembers([]);
    }
  };

  return (
    <dialog
      id="my_modal_addToGroup"
      className="modal modal-bottom sm:modal-middle"
    >
      {isPending ? (
        <LoadingSpinner />
      ) : (
        <div className="modal-box">
          <p className="py-4 text-xl font-semibold">
            Add Members to this group
          </p>

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
                name="groupName"
                value={selectedChat?.groupName}
                disabled
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
              {groupMembers.map((member, index) => (
                <li
                  key={index}
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
              addMembersToGroup();
              if (!isPending) {
                document.getElementById("my_modal_addToGroup").close();
              }
            }}
          >
            Add Members
          </button>

          <form className="modal-action">
            <button className="btn" formMethod="dialog">
              Close
            </button>
          </form>
        </div>
      )}
    </dialog>
  );
}

export default AddToGroup;
