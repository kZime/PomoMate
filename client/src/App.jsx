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
  Spinner,
} from "react-bootstrap";

import {
  registerUser,
  loginUser,
  loginDemoUser,
  askForNextTask,
} from "./apiService";
import "./App.css";
import { jwtDecode } from "jwt-decode";
import PomodoroTimer from "./PomodoroTimer";
import TaskList from "./tasks/TaskList";
import { useMessage } from "./message/MessageContext";
import CurrentTaskView from "./tasks/CurrentTaskView";
import TaskStats from "./tasks/TaskStats";

const App = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [registerMessage, setRegisterMessage] = useState("");
  const [loginMessage, setLoginMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("login");
  const [loggedIn, setLoggedIn] = useState(false);
  const [refreshList, setRefreshList] = useState("");
  const [predictLoading, setPredictLoading] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");

  const [currentTask, setCurrentTask] = useState({
    category: "",
    detail: "",
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

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

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));
    if (token && user) {
      setLoggedIn(true);
    }
  }, [refreshList, autoLogout]);

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

  const finishLogin = (token) => {
    localStorage.setItem("token", token);
    const decodedToken = jwtDecode(token);
    const user = {
      userId: decodedToken.userId,
      username: decodedToken.username,
    };
    localStorage.setItem("user", JSON.stringify(user));
    setLoggedIn(true);
    closeModal();
    setRefreshList(`login-${Date.now()}`);
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    const result = await loginUser(username, password);
    if (result.error) {
      setLoginMessage(result.error);
      return;
    }
    if (result.token) {
      finishLogin(result.token);
    }
  };

  const handleDemoLogin = async () => {
    const result = await loginDemoUser();
    if (result.error) {
      setLoginMessage(result.error);
      return;
    }
    if (result.token) {
      finishLogin(result.token);
    }
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
    showMessage({ type: "success", message: "Registration successful! Please log in." });
  };

  const checkTokenExpiration = () => {
    const token = localStorage.getItem("token");
    if (!token) return false;
    const decodedToken = jwtDecode(token);
    return decodedToken.exp < Date.now() / 1000;
  };

  const accountModal = (
    <Modal show={showModal} onHide={closeModal} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          {modalType === "login" ? "Welcome Back" : "Create Account"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {modalType === "login" && loginMessage && (
          <div className="alert alert-danger">{loginMessage}</div>
        )}
        {modalType === "register" && registerMessage && (
          <div className="alert alert-danger">{registerMessage}</div>
        )}

        <Form onSubmit={modalType === "login" ? handleLogin : handleRegister}>
          <Form.Group className="mb-3" controlId="formUsername">
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

          <Form.Group className="mb-3" controlId="formPassword">
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
            <Form.Group className="mb-3" controlId="formConfirmPassword">
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

          <div className="d-grid gap-2">
            <Button variant="primary" type="submit" size="lg">
              {modalType === "login" ? "Log In" : "Register"}
            </Button>
            {modalType === "login" && (
              <Button variant="outline-secondary" onClick={handleDemoLogin}>
                Try Demo Account
              </Button>
            )}
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );

  const [predictReason, setPredictReason] = useState("");

  const callForNextTask = async () => {
    try {
      setPredictLoading(true);
      const result = await askForNextTask();
      const resultObj = JSON.parse(result);
      setPredictReason(resultObj.predictReason);
      setCurrentTask({
        category: resultObj.category,
        detail: resultObj.detail,
      });
      showMessage({ type: "success", message: "AI suggestion generated!" });
    } catch (error) {
      showMessage({ type: "error", message: `Request failed: ${error.message}` });
    } finally {
      setPredictLoading(false);
    }
  };

  const currentUser = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="App">
      <Navbar className="app-navbar" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand href="#home" style={{ fontWeight: 700 }}>
            PomoMate
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="navbar-nav" />
          <Navbar.Collapse id="navbar-nav">
            <Nav className="me-auto">
              {loggedIn && (
                <Nav.Link href="#tasks" style={{ opacity: 0.9 }}>
                  Tasks
                </Nav.Link>
              )}
            </Nav>
            <Nav className="align-items-center gap-2">
              <button
                className="theme-toggle"
                onClick={toggleTheme}
                title="Toggle theme"
              >
                {theme === "light" ? "\u{1F319}" : "\u{2600}\u{FE0F}"}
              </button>
              {loggedIn ? (
                <>
                  <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.9rem" }}>
                    {currentUser?.username}
                  </span>
                  <Button variant="outline-light" size="sm" onClick={handleLogout}>
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline-light"
                    size="sm"
                    onClick={openLoginModal}
                  >
                    Login
                  </Button>
                  <Button variant="light" size="sm" onClick={openRegisterModal}>
                    Register
                  </Button>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <div className="container-wrapper">
        {!loggedIn && (
          <div className="hero-section">
            <h1>
              Stay Focused with <span className="hero-highlight">PomoMate</span>
            </h1>
            <p>
              A smart Pomodoro timer that helps you stay focused, organize tasks,
              and boost productivity with AI-driven suggestions.
            </p>
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
              <Button variant="primary" size="lg" onClick={openLoginModal}>
                Get Started
              </Button>
              <Button variant="outline-secondary" size="lg" onClick={handleDemoLogin}>
                Try Demo
              </Button>
            </div>
            <div className="hero-features">
              <div className="hero-feature">
                <div className="hero-feature-icon">&#9201;</div>
                <span>Pomodoro Timer</span>
              </div>
              <div className="hero-feature">
                <div className="hero-feature-icon">&#9997;</div>
                <span>Task Tracking</span>
              </div>
              <div className="hero-feature">
                <div className="hero-feature-icon">&#129302;</div>
                <span>AI Suggestions</span>
              </div>
              <div className="hero-feature">
                <div className="hero-feature-icon">&#128202;</div>
                <span>Analytics</span>
              </div>
            </div>
          </div>
        )}

        <Row className="g-3 mb-4">
          <Col lg={loggedIn ? 6 : 12}>
            <div className="section-card">
              <div className="section-card-title">Pomodoro Timer</div>
              <PomodoroTimer
                loggedIn={loggedIn}
                detectNewTask={setRefreshList}
                currentTask={currentTask}
                setCurrentTask={setCurrentTask}
              />
            </div>
          </Col>
          {loggedIn && (
            <Col lg={6}>
              <div className="section-card">
                <div className="section-card-title">Current Task</div>
                <CurrentTaskView
                  currentTask={currentTask}
                  setCurrentTask={setCurrentTask}
                />
                <div className="mt-3">
                  <Button
                    variant="primary"
                    onClick={callForNextTask}
                    disabled={predictLoading}
                    className="w-100"
                  >
                    {predictLoading ? (
                      <>
                        <Spinner size="sm" animation="border" className="me-2" />
                        Generating...
                      </>
                    ) : (
                      "Generate Next Task with AI"
                    )}
                  </Button>
                </div>
                {predictReason && (
                  <div className="predict-reason">
                    <strong>AI Reasoning:</strong> {predictReason}
                  </div>
                )}
              </div>
            </Col>
          )}
        </Row>

        {loggedIn && (
          <>
            <Row className="g-3 mb-4">
              <Col>
                <div className="section-card">
                  <div className="section-card-title">Productivity Dashboard</div>
                  <TaskStats refreshList={refreshList} />
                </div>
              </Col>
            </Row>
            <Row className="g-3 mb-4">
              <Col>
                <div className="section-card">
                  <div className="section-card-title">Task History</div>
                  <TaskList refreshList={refreshList} />
                </div>
              </Col>
            </Row>
          </>
        )}
      </div>

      {accountModal}
    </div>
  );
};

export default App;
