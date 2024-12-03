import { useState, useEffect, useCallback } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { registerUser, loginUser, fetchUserTasks, fetchTestAPI, fetchMongoDB } from "./apiService";
import './App.css';
import { jwtDecode } from 'jwt-decode';
import PomodoroTimer from "./PomodoroTimer";
import TaskList from "./TaskList";


// Main App
const App = () => {
  const [apiResponse, setApiResponse] = useState("");
  const [dbResponse, setDbResponse] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [registerMessage, setRegisterMessage] = useState("");
  const [loginMessage, setLoginMessage] = useState("");
  const [showModal, setShowModal] = useState(false); // 控制 Modal 是否显示
  const [modalType, setModalType] = useState("login"); // 控制 Modal 类型 ("login" 或 "register")
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState({}); // 存储用户信息
  const [tasksResult, setTasksResult] = useState([]); // 存储任务列表

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setLoggedIn(false);
    fetchTasks();
  },[]);

  const autoLogout = useCallback(() => {
    if (checkTokenExpiration()) {
      handleLogout();
    }
  },[handleLogout]);

  // 每次页面加载时触发
  useEffect(() => {
    // 获取API和数据库连接状态
    const fetchData = async () => {
      const apiResp = await fetchTestAPI();
      const dbResp = await fetchMongoDB();
      setApiResponse(apiResp);
      setDbResponse(dbResp);
    };
    fetchData();

    // 获取用户信息
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    if (token && user) {
      setLoggedIn(true);
      setUser(user);
    }

    // 检测是否要自动登出
    autoLogout();

    console.log("Updated")
  }, [tasksResult, autoLogout]); 
  // 触发条件：页面加载

  const fetchTasks = async () => {
    const result = await fetchUserTasks();

        if (result.error) {
            // 如果出错，设置错误信息
            setTasksResult(result.message);
        } else {
            // 否则设置任务列表
            setTasksResult(result.tasks);
        }
        console.log("fetchTasks run:", result);
  };

  // 处理输入框变化
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

  // 处理登录
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
    fetchTasks();
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

  const checkTokenExpiration = () => {
    const token = localStorage.getItem('token');
    if (!token) return false;

    const decodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decodedToken.exp < currentTime;
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

      <TaskList
        tasksResult={tasksResult}
      />
    </div>
  );
};

export default App;
