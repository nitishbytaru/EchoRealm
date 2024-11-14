export const handleKeyPress = (e, executableFunction) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    executableFunction();
  }
};

//these are used to scroll down automatically
export const scrollToBottom = (messagesEndRef) => {
  messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
};

// Helper function to truncate message with ellipsis if it exceeds max length
export const truncateMessage = (message, maxLength = 30) => {
  return message?.length > maxLength
    ? message.slice(0, maxLength) + "..."
    : message;
};

export const handleToggle = (e, dispatch, setTheme,setIsChecked) => {
  if (e.target.checked) {
    dispatch(setTheme("business"));
    localStorage.setItem("theme", "business");
    dispatch(setIsChecked(true));
  } else {
    dispatch(setTheme("wireframe"));
    localStorage.setItem("theme", "wireframe");
    dispatch(setIsChecked(false));
  }
};
