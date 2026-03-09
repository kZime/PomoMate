import { useState, useEffect, useRef, useCallback } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import PropTypes from "prop-types";
import { useMessage } from "./message/MessageContext";
import { addTask } from "./tasks/taskAPIService";
import "./PomodoroTimer.css";

const DEFAULT_WORK_MINUTES = 25;
const DEFAULT_BREAK_MINUTES = 5;

const PomodoroTimer = ({ loggedIn, detectNewTask, currentTask, setCurrentTask }) => {
  const [totalSeconds, setTotalSeconds] = useState(DEFAULT_WORK_MINUTES * 60);
  const [time, setTime] = useState(DEFAULT_WORK_MINUTES * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState("work");
  const [showModal, setShowModal] = useState(false);
  const [workMinutes, setWorkMinutes] = useState(DEFAULT_WORK_MINUTES);
  const [breakMinutes, setBreakMinutes] = useState(DEFAULT_BREAK_MINUTES);
  const timerRef = useRef(null);
  const { showMessage } = useMessage();
  const [getNewTask, setGetNewTask] = useState("newTask1");

  const refreshList = useCallback(() => {
    setGetNewTask((prev) => (prev === "newTask1" ? "newTask2" : "newTask1"));
  }, []);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTime((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timerRef.current);
            setIsRunning(false);
            setShowModal(true);
            playAlarmSound();
            sendNotification();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning]);

  useEffect(() => {
    detectNewTask(getNewTask);
  }, [getNewTask, detectNewTask]);

  const playAlarmSound = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const frequencies = [523, 659, 784]; // C5, E5, G5
      frequencies.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.3, ctx.currentTime + i * 0.2);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.2 + 0.4);
        osc.start(ctx.currentTime + i * 0.2);
        osc.stop(ctx.currentTime + i * 0.2 + 0.4);
      });
    } catch {
      // Audio not available
    }
  };

  const sendNotification = () => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("PomoMate", {
        body: mode === "work" ? "Work session complete! Time for a break." : "Break is over! Ready to focus?",
      });
    }
  };

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const closeModal = () => setShowModal(false);

  const startNewMode = (newMode) => {
    closeModal();
    setMode(newMode);
    const seconds = newMode === "work" ? workMinutes * 60 : breakMinutes * 60;
    setTotalSeconds(seconds);
    setTime(seconds);
    setIsRunning(true);
  };

  const toggleTimer = () => {
    setIsRunning((prev) => {
      if (prev) clearInterval(timerRef.current);
      return !prev;
    });
  };

  const resetTimer = () => {
    clearInterval(timerRef.current);
    const seconds = mode === "work" ? workMinutes * 60 : breakMinutes * 60;
    setTotalSeconds(seconds);
    setTime(seconds);
    setIsRunning(false);
  };

  const handleWorkMinutesChange = (value) => {
    const mins = Math.max(1, Math.min(120, parseInt(value) || 1));
    setWorkMinutes(mins);
    if (mode === "work" && !isRunning) {
      setTime(mins * 60);
      setTotalSeconds(mins * 60);
    }
  };

  const handleBreakMinutesChange = (value) => {
    const mins = Math.max(1, Math.min(30, parseInt(value) || 1));
    setBreakMinutes(mins);
    if (mode === "break" && !isRunning) {
      setTime(mins * 60);
      setTotalSeconds(mins * 60);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const progress = totalSeconds > 0 ? (totalSeconds - time) / totalSeconds : 0;
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);
  const progressColor = mode === "work" ? "var(--color-primary)" : "var(--color-break)";

  const handleSaveTask = async () => {
    if (!currentTask.category || !currentTask.detail) {
      showMessage({
        type: "error",
        message: "Please fill in both category and detail before saving.",
      });
      return false;
    }

    const result = await addTask(currentTask.category, currentTask.detail);
    if (result.success) {
      showMessage({ type: "success", message: "Task saved!" });
    } else {
      showMessage({ type: "error", message: result.message });
    }
    setCurrentTask({ category: "", detail: "" });
    refreshList();
    return result.success;
  };

  const finishingModal = (
    <Modal show={showModal} onHide={closeModal} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          {mode === "work" ? "Work Session Complete!" : "Break Time Over!"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          {mode === "work"
            ? "Great work! Choose what to do next."
            : "Break is over. Ready to get back to work?"}
        </p>
        {!loggedIn && (
          <div className="alert alert-warning">
            Log in to save your completed tasks.
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        {mode === "work" ? (
          <>
            {loggedIn && (
              <Button
                variant="success"
                onClick={async () => {
                  const success = await handleSaveTask();
                  if (success) startNewMode("work");
                }}
              >
                Save & Start New
              </Button>
            )}
            <Button variant="primary" onClick={() => startNewMode("break")}>
              Take a Break
            </Button>
          </>
        ) : (
          <>
            {loggedIn && (
              <Button
                variant="success"
                onClick={async () => {
                  const success = await handleSaveTask();
                  if (success) startNewMode("work");
                }}
              >
                Save & Start Work
              </Button>
            )}
            <Button variant="primary" onClick={() => startNewMode("work")}>
              Start Working
            </Button>
            <Button variant="outline-secondary" onClick={() => startNewMode("break")}>
              More Break
            </Button>
          </>
        )}
        <Button variant="outline-secondary" onClick={closeModal}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );

  return (
    <div className="timer-container">
      <div className={`timer-ring-wrapper ${isRunning ? "timer-running" : ""}`}>
        <svg className="timer-ring" viewBox="0 0 280 280">
          <circle
            className="timer-ring-bg"
            cx="140"
            cy="140"
            r={radius}
            fill="none"
            strokeWidth="8"
          />
          <circle
            className="timer-ring-progress"
            cx="140"
            cy="140"
            r={radius}
            fill="none"
            strokeWidth="8"
            strokeLinecap="round"
            style={{
              strokeDasharray: circumference,
              strokeDashoffset,
              stroke: progressColor,
            }}
          />
        </svg>
        <div className="timer-center">
          <div className="timer-mode">{mode === "work" ? "FOCUS" : "BREAK"}</div>
          <div className="timer-display">{formatTime(time)}</div>
        </div>
      </div>

      <div className="timer-controls">
        <Button
          variant={isRunning ? "outline-secondary" : "primary"}
          size="lg"
          onClick={toggleTimer}
          className="timer-btn"
        >
          {isRunning ? "Pause" : "Start"}
        </Button>
        <Button
          variant="outline-secondary"
          size="lg"
          onClick={resetTimer}
          className="timer-btn"
        >
          Reset
        </Button>
      </div>

      <div className="timer-settings">
        <div className="timer-setting">
          <label>Work</label>
          <div className="stepper">
            <button onClick={() => handleWorkMinutesChange(workMinutes - 1)}>-</button>
            <Form.Control
              type="number"
              value={workMinutes}
              onChange={(e) => handleWorkMinutesChange(e.target.value)}
              min="1"
              max="120"
              className="stepper-input"
            />
            <button onClick={() => handleWorkMinutesChange(workMinutes + 1)}>+</button>
          </div>
          <span className="timer-setting-unit">min</span>
        </div>
        <div className="timer-setting">
          <label>Break</label>
          <div className="stepper">
            <button onClick={() => handleBreakMinutesChange(breakMinutes - 1)}>-</button>
            <Form.Control
              type="number"
              value={breakMinutes}
              onChange={(e) => handleBreakMinutesChange(e.target.value)}
              min="1"
              max="30"
              className="stepper-input"
            />
            <button onClick={() => handleBreakMinutesChange(breakMinutes + 1)}>+</button>
          </div>
          <span className="timer-setting-unit">min</span>
        </div>
      </div>

      {finishingModal}
    </div>
  );
};

PomodoroTimer.propTypes = {
  loggedIn: PropTypes.bool.isRequired,
  detectNewTask: PropTypes.func.isRequired,
  currentTask: PropTypes.object,
  setCurrentTask: PropTypes.func,
};

export default PomodoroTimer;
