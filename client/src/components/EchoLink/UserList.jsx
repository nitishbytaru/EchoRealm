import React from "react";
import users from "../../temp/data/sampleUsers";

function UserList({ onUserSelect }) {
  return (
    <div className="h-full flex flex-col">
      {/* Search bar fixed at the top */}
      <div className="sticky top-0 z-10  p-2">
        <label className="input input-bordered flex items-center gap-2">
          <input type="text" className="grow" placeholder="Search" />
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
      </div>

      {/* Scrollable user list */}
      <ul className="menu  flex-1 p-2">
        {users.map((user) => (
          <li
            className="py-2 cursor-pointer"
            key={user.id}
            onClick={() => {
              onUserSelect(user);
            }}
          >
            <div className="avatar flex items-stretch">
              <div className="w-12 rounded-full">
                <img src={user.image} alt="user avatar" />
              </div>
              <p className="">{user.name}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default UserList;
