import React, { Component } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import logo from "./logo.svg"; // 如果有 logo
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      apiResponse: "",
      dbResponse: "",
      username: "",
      password: "",
      registerMessage: "",
      loginMessage: "",
      showModal: false, // 控制 Modal 是否显示
      modalType: "login", // 控制 Modal 类型 ("login" 或 "register")
    };
  }

  handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  // 显示登录表单
  openLoginModal = () => {
    this.setState({ showModal: true, modalType: "login" });
  };

  // 显示注册表单
  openRegisterModal = () => {
    this.setState({ showModal: true, modalType: "register" });
  };

  // 关闭 Modal
  closeModal = () => {
    this.setState({ showModal: false });
  };

  handleLogin = (e) => {
    e.preventDefault();
    const { username, password } = this.state;
    // 登录逻辑
    // 假设你会发送 API 请求进行登录
    this.setState({ loginMessage: "Login Success!" });
    this.closeModal();
  };

  handleRegister = (e) => {
    e.preventDefault();
    const { username, password } = this.state;
    // 注册逻辑
    // 假设你会发送 API 请求进行注册
    this.setState({ registerMessage: "Registration Success!" });
    this.closeModal();
  };

  render() {
    const { apiResponse, dbResponse, username, password, registerMessage, loginMessage, showModal, modalType } = this.state;

    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>

        <div className="App-intro">
          <p>{apiResponse}</p>
          <p>{dbResponse}</p>
        </div>

        {/* 按钮，点击后弹出登录或注册表单 */}
        <section>
          <Button variant="primary" onClick={this.openLoginModal}>
            Login
          </Button>
          <Button variant="secondary" onClick={this.openRegisterModal}>
            Register
          </Button>
        </section>

        {/* 登录/注册的 Modal 弹窗 */}
        <Modal show={showModal} onHide={this.closeModal}>
          <Modal.Header closeButton>
            <Modal.Title>{modalType === "login" ? "Login" : "Register"}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={modalType === "login" ? this.handleLogin : this.handleRegister}>
              <Form.Group controlId="formUsername">
                <Form.Label>Username</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter username"
                  name="username"
                  value={username}
                  onChange={this.handleChange}
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
                  onChange={this.handleChange}
                  required
                />
              </Form.Group>

              <Button variant="primary" type="submit">
                {modalType === "login" ? "Login" : "Register"}
              </Button>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={this.closeModal}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>

        {/* 提示信息 */}
        <p>{loginMessage}</p>
        <p>{registerMessage}</p>
      </div>
    );
  }
}

export default App;
