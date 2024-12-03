import { useEffect, useState } from "react";
import PropTypes from "prop-types"; // 引入 prop-types 库
import "./Message.css"; // 引入样式

const Message = ({
  type = "info",
  message,
  duration = 3000,
  onClose = null,
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setVisible(false);
        if (onClose) {
          onClose();
        }
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  if (!visible) return null;

  return (
    <div role="alert" className={`message message--${type}`}>
      <i className={`message__icon el-icon-${type}`}></i>
      <p className="message__content">{message}</p>
      <button className="message__close" onClick={() => setVisible(false)}>
        ×
      </button>
    </div>
  );
};

// 添加 propTypes 以验证 props 的类型
Message.propTypes = {
  type: PropTypes.oneOf(["info", "success", "warning", "error"]), // 只能是这四种类型之一
  message: PropTypes.string.isRequired, // 必须是字符串，且必填
  duration: PropTypes.number, // 必须是数字
  onClose: PropTypes.func, // 必须是函数（如果提供的话）
};

export default Message;
