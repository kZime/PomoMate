import { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { registerUser, loginUser, fetchTestAPI, fetchMongoDB } from "./apiService";
import './App.css';
import { jwtDecode } from 'jwt-decode';
import PomodoroTimer from "./PomodoroTimer";


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
