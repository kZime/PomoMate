import { createContext, useContext, useState } from "react";
import PropTypes from "prop-types"; // 引入 prop-types 库
import Message from "./Message"; // 引入 Message 组件

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

// 添加 propTypes 以验证 props 的类型
MessageProvider.propTypes = {
  children: PropTypes.node.isRequired, // 验证 children 必须是可以渲染的 React 节点
};

export default MessageContext;
