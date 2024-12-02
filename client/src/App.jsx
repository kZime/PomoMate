import React, { useState, useEffect, useRef } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { registerUser, loginUser, fetchTestAPI, fetchMongoDB } from "./apiService";
import './App.css';
import { jwtDecode } from 'jwt-decode';
import PropTypes from 'prop-types';

// PomodoroTimer
const PomodoroTimer = ({ loggedIn }) => {

  // Default state values
  const [time, setTime] = useState(2); // TODO: Default to 2 for testing
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState("work");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [categories, setCategories] = useState([]);
  const [showLoginAlert, setShowLoginAlert] = useState(false);
  const timerRef = useRef(null); // Timer reference


  
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
      setTime(prevTime => {
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
    setIsRunning(prevIsRunning => {
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
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleCategoryModal = () => {
    setModalType("category");
    setShowModal(true);
  };

  const finishingModal = () => (
    <Modal show={showModal} onHide={closeModal}>
      <Modal.Header closeButton>
        <Modal.Title>{mode === "work" ? "Work Time is over" : "Break Time is over"}</Modal.Title>
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
          <>
            <Button variant="primary" onClick={() => startNewMode("break")}>
              Start break
            </Button>
            <Button variant="secondary" onClick={closeModal}>
              Close
            </Button>
          </>
        ) : (
          <>
            <Button variant="primary" onClick={() => startNewMode("work")}>
              Start new task
            </Button>
            <Button variant="primary"
              onClick={() => {
                if (!loggedIn) {
                  setShowLoginAlert(true);  // Show warning
                } else {
                  handleCategoryModal();  // Execute select category functionality
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

  const categoryModal = () => (
    <Modal show={showModal} onHide={closeModal}>
      <Modal.Header closeButton>
        <Modal.Title>Select a category</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h5>Please select a category for your task:</h5>
        <ul>
          {categories.map((category, index) => (
            <li key={index}>
              <Button
                variant="outline-primary"
                onClick={() => selectCategory(category)}
              >
                {category}
              </Button>
            </li>
          ))}
        </ul>
        <Button variant="primary" onClick={addCategory}>
          +
        </Button>
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={closeModal}
        >
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
      {modalType === "finish" && finishingModal()} {/* show finishing modal */}
      {modalType === "category" && categoryModal()}
    </div>
  );
};

PomodoroTimer.propTypes = {
  loggedIn: PropTypes.bool.isRequired,
};












// Main App
const App = () => {
  const [apiResponse, setApiResponse] = useState("");
  const [dbResponse, setDbResponse] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [registerMessage, setRegisterMessage] = useState("");
  const [loginMessage, setLoginMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("login");
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      const apiResp = await fetchTestAPI();
      const dbResp = await fetchMongoDB();
      setApiResponse(apiResp);
      setDbResponse(dbResp);
    };
    fetchData();

    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    if (token && user) {
      setLoggedIn(true);
      setUser(user);
    }

    autoLogout();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "username") setUsername(value);
    if (name === "password") setPassword(value);
    if (name === "confirmPassword") setConfirmPassword(value);
  };

  const openLoginModal = () => {
    setShowModal(true);
    setModalType("login");
  };

  const openRegisterModal = () => {
    setShowModal(true);
    setModalType("register");
  };

  const closeModal = () => {
    setShowModal(false);
    setLoginMessage("");
    setRegisterMessage("");
    setUsername("");
    setPassword("");
    setConfirmPassword("");
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    const result = await loginUser(username, password);
    if (result.error) {
      setLoginMessage(result.error);
      return;
    }
    const token = result.token;
    if (token) {
      localStorage.setItem('token', token);
      const decodedToken = jwtDecode(token);
      const user = {
        userId: decodedToken.userId,
        username: decodedToken.username
      };
      localStorage.setItem('user', JSON.stringify(user));
      setLoggedIn(true);
    }
    closeModal();
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setRegisterMessage("Passwords do not match");
      return;
    }
    const result = await registerUser(username, password);
    if (result.error) {
      setRegisterMessage(result.error);
      return;
    }
    closeModal();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setLoggedIn(false);
  };

  const checkTokenExpiration = () => {
    const token = localStorage.getItem('token');
    if (!token) return false;

    const decodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decodedToken.exp < currentTime;
  };

  const autoLogout = () => {
    if (checkTokenExpiration()) {
      handleLogout();
    }
  };

  const showAccountModal = () => (
    <Modal show={showModal} onHide={closeModal}>
      <Modal.Header closeButton>
        <Modal.Title>{modalType === "login" ? "Login" : "Register"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {modalType === "login" && loginMessage && (
          <div className="alert alert-info">{loginMessage}</div>
        )}
        {modalType === "register" && registerMessage && (
          <div className="alert alert-info">{registerMessage}</div>
        )}

        <Form onSubmit={modalType === "login" ? handleLogin : handleRegister}>
          <Form.Group controlId="formUsername">
            <Form.Label>Username</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter username"
              name="username"
              value={username}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group controlId="formPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter password"
              name="password"
              value={password}
              onChange={handleChange}
              required
            />
          </Form.Group>

          {modalType === "register" && (
            <Form.Group controlId="formConfirmPassword">
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Re-enter password"
                name="confirmPassword"
                value={confirmPassword}
                onChange={handleChange}
                required
              />
            </Form.Group>
          )}

          <Button variant="primary" type="submit">
            {modalType === "login" ? "Login" : "Register"}
          </Button>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={closeModal}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );

  return (
    <div className="App">
      <div className="App-intro">
        <p>{apiResponse}</p>
        <p>{dbResponse}</p>
      </div>

      <section>
        {loggedIn ? (
          <>
            <p>Welcome, {user.username}!</p>
            <Button variant="secondary" onClick={handleLogout}>Logout</Button>
          </>
        ) : (
          <>
            <Button variant="primary" onClick={openLoginModal}>
              Login
            </Button>
            <Button variant="secondary" onClick={openRegisterModal}>
              Register
            </Button>
          </>
        )}
      </section>

      {showAccountModal()}

      <PomodoroTimer
        loggedIn={loggedIn}
      />
    </div>
  );
};

export default App;
