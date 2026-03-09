import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import "./Message.css";

const Message = ({ type = "info", message, duration = 3000, onClose = null }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setVisible(false);
        if (onClose) onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  if (!visible) return null;

  const icons = {
    info: "\u2139\uFE0F",
    success: "\u2705",
    warning: "\u26A0\uFE0F",
    error: "\u274C",
  };

  return (
    <div role="alert" className={`message message--${type}`}>
      <span className="message__icon">{icons[type]}</span>
      <p className="message__content">{message}</p>
      <button className="message__close" onClick={() => setVisible(false)}>
        &times;
      </button>
    </div>
  );
};

Message.propTypes = {
  type: PropTypes.oneOf(["info", "success", "warning", "error"]),
  message: PropTypes.string.isRequired,
  duration: PropTypes.number,
  onClose: PropTypes.func,
};

export default Message;
