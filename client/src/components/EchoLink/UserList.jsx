import { useEffect, useState } from "react";
import { getMyPrivateFriends } from "../../api/echoLinkApi";
import { useInputValidation } from "6pp";
import { useDispatch, useSelector } from "react-redux";
import { searchUsers } from "../../api/echoWhisperApi";
import { setMyPrivateFriends } from "../../app/slices/echoLinkSlice";

// eslint-disable-next-line react/prop-types
function UserList({ onUserSelect }) {
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const { myPrivateFriends } = useSelector((state) => state.echoLink);

  const search = useInputValidation("");
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (search.value) {
        searchUsers(search.value)
          .then((users) => {
            const filteredUsers = users.filter(
              (field) => field._id != user._id
            );
            setSearchResults(filteredUsers);
          })
          .catch((err) => console.error(err));
      } else {
        setSearchResults([]);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
    //This return function acts as a cleanup function for the useEffect.
    // It cancels the setTimeout if search.value changes before the 300 ms delay completes, avoiding unnecessary searchUsers calls.
    // This helps make sure only the latest input triggers the search, effectively debouncing it.
  }, [search.value, user._id]);

  useEffect(() => {
    const func = async () => {
      const response = await getMyPrivateFriends();

      dispatch(
        setMyPrivateFriends(response?.data?.myPrivateFriendsWithMessages)
      );
    };

    func();
  }, []);

  // Helper function to truncate message with ellipsis if it exceeds max length
  const truncateMessage = (message, maxLength = 40) => {
    return message?.length > maxLength
      ? message.slice(0, maxLength) + "..."
      : message;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Search bar fixed at the top */}
      <div className="sticky top-0 z-10 p-2">
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
                key={searchResultUser._id}
                onClick={() => {
                  setSearchResults(null);
                  onUserSelect(searchResultUser);
                  search.clear();
                }}
              >
                <p>{searchResultUser.username}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Scrollable user list */}
      <ul className="menu flex-1 p-2 overflow-y-auto">
        {myPrivateFriends.map((user, index) => (
          <li
            className="py-2 cursor-pointer"
            key={index}
            onClick={() => {
              onUserSelect(user);
            }}
          >
            <div className="flex items-center gap-3">
              <div className="avatar">
                <div className="w-12 rounded-full">
                  <img src={user?.avatar?.url} alt="user avatar" />
                </div>
              </div>
              <div className="flex-1">
                <p className="font-semibold">{user?.username}</p>
                <p
                  className="text-sm text-gray-500 truncate"
                  style={{ maxWidth: "15rem" }}
                >
                  {truncateMessage(user?.latestMessage?.message)}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default UserList;
