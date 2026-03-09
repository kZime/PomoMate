import { createContext, useContext, useState } from "react";
import PropTypes from "prop-types";
import Message from "./Message";

const MessageContext = createContext();

export const useMessage = () => {
  return useContext(MessageContext);
};

export const MessageProvider = ({ children }) => {
  const [messageInfo, setMessageInfo] = useState({
    visible: false,
    type: "info",
    message: "",
    duration: 3000,
  });

  const showMessage = ({ type = "info", message, duration = 3000 }) => {
    setMessageInfo({ visible: true, type, message, duration });
    setTimeout(() => {
      setMessageInfo((prev) => ({ ...prev, visible: false }));
    }, duration);
  };

  return (
    <MessageContext.Provider value={{ showMessage }}>
      {children}
      {messageInfo.visible && (
        <Message
          type={messageInfo.type}
          message={messageInfo.message}
          duration={messageInfo.duration}
        />
      )}
    </MessageContext.Provider>
  );
};

MessageProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default MessageContext;
