import { useState, useEffect, useRef } from "react";
import { Modal, Button, InputGroup, Form } from "react-bootstrap";
import PropTypes from "prop-types";
import { useMessage } from "./message/MessageContext";
import { addTask } from "./tasks/taskAPIService";

// PomodoroTimer
const PomodoroTimer = ({ loggedIn }) => {
  // Default state values
  const [time, setTime] = useState(2); // TODO: Default to 2 for testing
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState("work");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [showLoginAlert, setShowLoginAlert] = useState(false);
  const timerRef = useRef(null); // Timer reference
  const { showMessage } = useMessage();
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
    setTime(newMode === "work" ? 2 : 1); // DEBUG: 使用测试时间

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

  const resetTimer = () => {
    clearInterval(timerRef.current);
    setTime(25 * 60);
    setIsRunning(false);
    setMode("work");
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const handleCategoryModal = () => {
    setModalType("category");
    setShowModal(true);
  };

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
        {showLoginAlert && !loggedIn && (
          <div className="alert alert-warning mt-3">
            You need to login to use this feature.
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        {mode === "work" ? (
          // work time is over
          <>
            <Button variant="primary" onClick={() => startNewMode("break")}>
              Start break
            </Button>
            <Button variant="secondary" onClick={closeModal}>
              Close
            </Button>
          </>
        ) : (
          // break time is over
          <>
            <Button variant="primary" onClick={() => startNewMode("work")}>
              Start new task
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                if (!loggedIn) {
                  setShowLoginAlert(true); // Show warning
                } else {
                  handleCategoryModal(); // Execute select category functionality
                }
              }}
            >
              Select a category
            </Button>
            <Button variant="secondary" onClick={closeModal}>
              Close
            </Button>
          </>
        )}
      </Modal.Footer>
    </Modal>
  );

  const showTaskModal = () => {
    setModalType("task");
    setShowModal(true);
  };

  const [showNewCategory, setShowNewCategory] = useState(false);
  const [categories, setCategories] = useState(["Work", "Study", "Exercise"]); // DEBUG: 默认分类
  const [selectedCategory, setSelectedCategory] = useState(categories[0]); // 默认选中第一个分类
  const [newCategoryContent, setNewCategoryContent] = useState("");
  const [taskDetail, setTaskDetail] = useState("");

  const handleSaveTask = async () => {
    const result = await addTask(selectedCategory, taskDetail);
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
  };

  const taskModal = () => (
    <Modal show={showModal} onHide={closeModal}>
      <Modal.Header closeButton>
        <Modal.Title>Edit Task</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h5>Please edit your task:</h5>
        {/* 显示所有现有类别的单选按钮 */}
        <Form.Select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">Select a category</option>
          {categories.map((category, index) => (
            <option key={index} value={category}>
              {category}
            </option>
          ))}
        </Form.Select>

        <Button
          variant="primary"
          onClick={() => setShowNewCategory(!showNewCategory)}
        >
          Add New Category
        </Button>

        {/* DEBUG: 测试消息 */}
        <Button
          variant="info"
          onClick={() =>
            showMessage({
              type: "success",
              message: "This is a success message!",
            })
          }
        >
          Show Message
        </Button>

        {/* 按加号时，增加一个输入框添加新类别 */}
        {showNewCategory && (
          <InputGroup>
            <Form.Control
              placeholder="New Category"
              onChange={(e) => setNewCategoryContent(e.target.value)}
            />
            <Button
              variant="outline-secondary"
              onClick={() => {
                setShowNewCategory(false);
                setCategories([...categories, newCategoryContent]);
              }}
            >
              Add
            </Button>
          </InputGroup>
        )}

        {/* 分割线 */}
        <hr />

        {/* 添加Task 信息 */}

        <InputGroup onChange={(e) => setTaskDetail(e.target.value)}>
          <Form.Control placeholder="Task Detail" />
        </InputGroup>
      </Modal.Body>
      <Modal.Footer>
        {/* Save Button */}
        <Button variant="success" onClick={handleSaveTask}>
          Save
        </Button>

        <Button variant="secondary" onClick={closeModal}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );

  return (
    <div className="pomodoro-timer">
      <h2>{mode === "work" ? "Work Time" : "Break Time"}</h2>
      <h1>{formatTime(time)}</h1>
      <Button variant="success" onClick={toggleTimer}>
        {isRunning ? "Pause" : "Start"}
      </Button>
      <Button variant="danger" onClick={resetTimer}>
        Reset
      </Button>
      <Button variant="info" onClick={() => showTaskModal()}>
        Edit Task
      </Button>
      {modalType === "finish" && finishingModal()} {/* show finishing modal */}
      {modalType === "task" && taskModal()}
    </div>
  );
};

PomodoroTimer.propTypes = {
  loggedIn: PropTypes.bool.isRequired,
};

export default PomodoroTimer;
