import { useState, useEffect, useRef } from "react";
import { Modal, Button, InputGroup, Form } from "react-bootstrap";
import PropTypes from "prop-types";
import { useMessage } from "./message/MessageContext";
import { addTask } from "./tasks/taskAPIService";

// PomodoroTimer
const PomodoroTimer = ({
  loggedIn,
  detectNewTask,

  // 从 App 中获取 当前的 Task 的两个信息
  currentTask,
  setCurrentTask,
}) => {
  // Default state values
  const [time, setTime] = useState(2); // TODO: Default to 2 for testing
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState("work");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(null);
  const timerRef = useRef(null); // Timer reference
  const { showMessage } = useMessage();
  const [getNewTask, setGetNewTask] = useState("newTask1");

  const refreshList = () => {
    setGetNewTask(getNewTask === "newTask1" ? "newTask2" : "newTask1");
  };
  // 只在 isRunning 变化时启动或清除计时器
  useEffect(() => {
    if (isRunning) {
      startTimer(); // 如果正在运行，则启动计时器
    } else {
      clearInterval(timerRef.current); // 如果不再运行，则停止计时器
    }
    // 在组件卸载时清除计时器
    return () => clearInterval(timerRef.current);
  }, [isRunning]); // 触发条件

  useEffect(() => {
    detectNewTask(getNewTask);
  }, [getNewTask, detectNewTask]);

  const startTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTime((prevTime) => {
        if (prevTime <= 1) {
          // 当时间结束时停止计时器
          clearInterval(timerRef.current);
          setIsRunning(false);

          // 显示选择对话框
          setShowModal(true);
          setModalType("finish");

          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType(null);
  };

  const startNewMode = (newMode) => {
    // 先关闭模态框
    closeModal();

    // 根据用户选择的模式切换状态
    setMode(newMode);
    setTime(formatTimerLengthToSecond()); // DEBUG: 使用测试时间

    // 触发计时器
    setIsRunning(true);
  };

  const toggleTimer = () => {
    setIsRunning((prevIsRunning) => {
      if (prevIsRunning) {
        clearInterval(timerRef.current);
      }
      return !prevIsRunning;
    });
  };

  const [timerLength, setTimerLength] = useState("25:00");

  const formatTimerLengthToSecond = () => {
    const [mins, secs] = timerLength.split(":");
    return parseInt(mins) * 60 + parseInt(secs);
  };

  const resetTimer = () => {
    clearInterval(timerRef.current);
    setTime(formatTimerLengthToSecond());
    setIsRunning(false);
    setMode("work");
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // mode == work or break
  const finishingModal = () => (
    <Modal show={showModal} onHide={closeModal}>
      <Modal.Header closeButton>
        <Modal.Title>
          {mode === "work" ? "Work Time is over" : "Break Time is over"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {mode === "work"
          ? "Work time is over, select your next action."
          : "Break time is over, select your next action."}
        {!loggedIn && (
          <div className="alert alert-warning mt-3">
            You need to login to use this feature.
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        {mode === "work" ? (
          // work time is over
          <>
            {/* 提交任务并跳过休息时间 */}
            <Button
              variant="success"
              onClick={async () => {
                const success = await handleSaveTask();
                if (success) {
                  startNewMode("work");
                  closeModal();
                  // console.log("handleSaveTask success");
                } else {
                  // console.log("handleSaveTask failed");
                }
              }}
            >
              Submit task and start new Task
            </Button>
            {/* 开始休息时间 */}
            <Button variant="primary" onClick={() => startNewMode("break")}>
              Start break
            </Button>
            <Button variant="secondary" onClick={closeModal}>
              Close
            </Button>
          </>
        ) : (
          // break time is over
          // mode == break
          <>
            <Button
              variant="success"
              onClick={async () => {
                const success = await handleSaveTask();
                if (success) {
                  startNewMode("work");
                  closeModal();
                  // console.log("handleSaveTask success");
                } else {
                  // console.log("handleSaveTask failed");
                }
              }}
            >
              Start new task and save task
            </Button>
            {/* Break again! */}
            <Button variant="primary" onClick={() => startNewMode("break")}>
              Break again!
            </Button>
            <Button variant="secondary" onClick={closeModal}>
              Close
            </Button>
          </>
        )}
      </Modal.Footer>
    </Modal>
  );

  // 存在前端的 新的 Task 的两个信息

  const handleSaveTask = async () => {
    // 如果当前任务为空，则不保存
    if (!currentTask.category || !currentTask.detail) {
      showMessage({
        type: "error",
        message:
          "Task was submitted or not edited. Please close this modal, edit Current Task and try again.",
      });
      return false;
    }

    // console.log("handleSaveTask keep going");

    const result = await addTask(currentTask.category, currentTask.detail);
    if (result.success) {
      // if success, show message
      showMessage({
        type: "success",
        message: "Task saved successfully!",
      });
    } else {
      // if failed, show message
      showMessage({
        type: "error",
        message: result.message,
      });
    }
    // 清除当前任务
    setCurrentTask({ category: "", detail: "" });

    refreshList();
    return result.success;
  };

  return (
    <div className="pomodoro-timer">
      <h2>{mode === "work" ? "Work Time" : "Break Time"}</h2>
      <h1>{formatTime(time)}</h1>
      <Button variant={isRunning ? "info" : "success"} onClick={toggleTimer}>
        {isRunning ? "Pause" : "Start"}
      </Button>
      <Button variant="danger" onClick={resetTimer}>
        Reset
      </Button>
      <InputGroup>
        <InputGroup.Text>new timer length:</InputGroup.Text>

        <Form.Control
          placeholder={timerLength}
          onChange={(e) => {
              setTimerLength(e.target.value);
              console.log("update timerLength to:", timerLength);
          }}
        />
      </InputGroup>
      {modalType === "finish" && finishingModal()} {/* show finishing modal */}
    </div>
  );
};

PomodoroTimer.propTypes = {
  loggedIn: PropTypes.bool.isRequired,
  detectNewTask: PropTypes.func.isRequired,

  // 从 App 中获取 当前的 Task 的两个信息
  currentTask: PropTypes.object,
  setCurrentTask: PropTypes.func,
};

export default PomodoroTimer;
