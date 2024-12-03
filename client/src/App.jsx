import { useState, useEffect, useCallback } from "react";
import {
  Container,
  Row,
  Col,
  Modal,
  Navbar,
  Nav,
  Button,
  Form,
  Alert,
  Card,
} from "react-bootstrap";

import {
  registerUser,
  loginUser,
  fetchTestAPI,
  fetchMongoDB,
} from "./apiService";
import "./App.css";
import { jwtDecode } from "jwt-decode";
import PomodoroTimer from "./PomodoroTimer";
import TaskList from "./tasks/TaskList";
import { useMessage } from "./message/MessageContext";

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
  const [refreshList, setRefreshList] = useState(""); // 存储任务列表

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setLoggedIn(false);
    setRefreshList("logout");
  }, []);

  const autoLogout = useCallback(() => {
    if (checkTokenExpiration()) {
      handleLogout();
    }
  }, [handleLogout]);

  const { showMessage } = useMessage();

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
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    if (token && user) {
      setLoggedIn(true);
      setUser(user);
    }

    console.log("Updated");
  }, [refreshList, autoLogout]);

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
      localStorage.setItem("token", token);
      const decodedToken = jwtDecode(token);
      const user = {
        userId: decodedToken.userId,
        username: decodedToken.username,
      };
      localStorage.setItem("user", JSON.stringify(user));
      setLoggedIn(true);
    }
    closeModal();
    setRefreshList("login");
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
    const token = localStorage.getItem("token");
    if (!token) return false;

    const decodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decodedToken.exp < currentTime;
  };

  const showAccountModal = () => (
    <Modal show={showModal} onHide={closeModal}>
      <Modal.Header closeButton>
        <Modal.Title>
          {modalType === "login" ? "Login" : "Register"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {modalType === "login" && loginMessage && (
          <div className="alert alert-info">{loginMessage}</div>
        )}
        {modalType === "register" && registerMessage && (
          <div className="alert alert-info">{registerMessage}</div>
        )}

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
      </Modal.Body>
      <Modal.Footer>
        {/* register */}
        {modalType === "login" ? (
          <Button variant="primary" onClick={handleLogin}>
            Login
          </Button>
        ) : (
          <Button variant="primary" onClick={handleRegister}>
            Register
          </Button>
        )}

        <Button variant="secondary" onClick={closeModal}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );

  return (
    <div className="App">
      {/* 导航栏，包含应用品牌和导航链接 */}
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container fluid>
          <Navbar.Brand href="#home">Pomodoro App</Navbar.Brand>
          <Navbar.Toggle aria-controls="navbar-nav" />
          <Navbar.Collapse id="navbar-nav">
            <Nav className="me-auto">
              <Nav.Link href="#home">Home</Nav.Link>
              {loggedIn && <Nav.Link href="#tasks">Tasks</Nav.Link>}
            </Nav>
            <Nav>
              {loggedIn ? (
                <Button variant="outline-light" onClick={handleLogout}>
                  Logout
                </Button>
              ) : (
                // 渲染登录和注册按钮
                <>
                  <Button
                    variant="outline-light"
                    onClick={openLoginModal}
                    className="me-2"
                  >
                    Login
                  </Button>
                  <Button variant="light" onClick={openRegisterModal}>
                    Register
                  </Button>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* 主内容区域 */}
      <Container fluid className="container-wrapper">
        {/* API 和数据库响应信息 */}
        <Row className="mb-4">
          <Col>
            <Alert variant="info">
              <p>{apiResponse}</p>
              <p>{dbResponse}</p>
            </Alert>
          </Col>
        </Row>

        {/* Pomodoro Timer */}
        <Col className="mb-4">
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Pomodoro Timer</Card.Title>
              <PomodoroTimer
                loggedIn={loggedIn}
                detectNewTask={setRefreshList}
              />
            </Card.Body>
          </Card>
        </Col>

        {/* Task List */}
        <Col className="mb-4">
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Task List</Card.Title>
              <TaskList refreshList={refreshList} />
            </Card.Body>
          </Card>
        </Col>
        {showAccountModal()}

        {/* 测试消息按钮 */}
        <Row>
          <Col className="text-center">
            <Button
              variant="primary"
              onClick={() =>
                showMessage({
                  type: "success",
                  message: "This is a success message!",
                })
              }
            >
              Show Message
            </Button>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default App;
