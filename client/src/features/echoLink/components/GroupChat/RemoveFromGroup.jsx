import toast from "react-hot-toast";
import { useState, useTransition } from "react";
import { useDispatch, useSelector } from "react-redux";

import { updateMembersInGroupApi } from "../../api/echo_link.api.js";
import LoadingSpinner from "../../../../components/LoadingSpinner.jsx";
import { addToMyPrivateChatRooms } from "../../slices/echo_link.slice.js";

function RemoveFromGroup() {
  const dispatch = useDispatch();

  const { isMobile } = useSelector((state) => state.auth);
  const { selectedChat } = useSelector((state) => state.echoLink);

  const [isPending, startTransition] = useTransition();
  const [groupMembers, setGroupMembers] = useState(
    selectedChat?.groupChatRoomMembers
  );

  function removeGroupMember(userToRemove) {
    setGroupMembers((prevMembers) =>
      prevMembers.filter((member) => member._id !== userToRemove._id)
    );
  }

  const removeMemberFromGroup = () => {
    const groupId = selectedChat?._id;

    startTransition(async () => {
      try {
        const response = await updateMembersInGroupApi({
          groupId,
          groupMembers,
        });
        dispatch(addToMyPrivateChatRooms(response?.data?.newGroupDetails));
        toast.success("removed from group");
      } catch (error) {
        console.error("Error removing from group:", error);
        toast.error("Failed to remove from group. Please try again.");
      } finally {
        setGroupMembers([]);
      }
    });
  };

  return (
    <dialog
      id="my_modal_removeFromGroup"
      className="modal modal-bottom sm:modal-middle"
    >
      {isPending ? (
        <LoadingSpinner />
      ) : (
        <div className="modal-box">
          <p className="py-4 text-xl font-semibold">Update Group Members</p>

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
                value={selectedChat?.groupName}
                disabled
              />
            </label>
          </div>

          {/* Display Selected Members */}
          <div className="my-4">
            <h3 className="text-lg font-semibold mb-2">Group Members</h3>
            <ul className="menu bg-base-100 rounded-box">
              {groupMembers.map((member, index) => (
                <li key={index} className="items-center gap-2 text-green-300">
                  <div>
                    <span>@{member.username}</span>
                    <p
                      className="btn btn-sm"
                      onClick={() => removeGroupMember(member)}
                    >
                      X
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <button
            className="btn rounded-lg w-full"
            onClick={() => {
              removeMemberFromGroup();
              if (!isPending) {
                document.getElementById("my_modal_removeFromGroup").close();
              }
            }}
          >
            Update Group Members
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

export default RemoveFromGroup;
