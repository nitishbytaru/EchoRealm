export const handleKeyPress = (e, executableFunction) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    executableFunction();
  }
};

export const removeAttachment = (attachments) => {
  attachments.clear();
};

//these are used to scroll down automatically
export const scrollToBottom = (messagesEndRef) => {
  messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
};
