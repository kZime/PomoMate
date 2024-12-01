import { Component } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { registerUser, loginUser, fetchTestAPI, fetchMongoDB } from "./apiService";
import './App.css';
import { jwtDecode } from 'jwt-decode';
import PropTypes from 'prop-types';
// import { Link } from "react-router-dom";


// PomodoroTimer
class PomodoroTimer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // time: 25 * 60, // 默认工作时间 25 分钟
      time: 2, // for testing
      isRunning: false, // 是否计时中
      mode: "work", // 模式：work（工作）或 break（休息）
      showModal: false,
      modalType: null,
      categories: [],
      showLoginAlert: false,
    };
  }

  componentDidUpdate(_, prevState) {
    if (this.state.isRunning && prevState.isRunning !== this.state.isRunning) {
      this.startTimer();
    }
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  startTimer = () => {
    this.timer = setInterval(() => {
      this.setState((prevState) => {
        if (prevState.time <= 1) {
          this.switchMode();
          return { time: prevState.time };
        }
        return { time: prevState.time - 1 };
      });
    }, 1000);
  };

  switchMode = () => {
    const { mode } = this.state;
    clearInterval(this.timer);
    this.setState({
      mode: mode === "work" ? "break" : "work",
      // time: mode === "work" ? 5 * 60 : 25 * 60, // 切换到休息时间 5 分钟
      time: mode === "work" ? 1 : 2, // for testing
      isRunning: false,
      showModal: true,
      modalType: "finish"
    });
  };

  closeModal = () => {
    this.setState({
      showModal: false,
      modalType: null
    });
  };

  startNewMode = () => {
    this.closeModal();
    this.startTimer();
  }


  toggleTimer = () => {
    this.setState((prevState) => {
      if (prevState.isRunning) {
        // 暂停计时
        clearInterval(this.timer);
      }
      return { isRunning: !prevState.isRunning }; // 切换状态
    });
  };

  resetTimer = () => {
    clearInterval(this.timer);
    this.setState({
      time: 25 * 60,
      isRunning: false,
      mode: "work",
    });
  };

  formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  handleCategoryModal = () => {
    this.setState({
      modalType: "category", // 切换到分类选择弹窗
      showModal: true
    });
  };

  finishingModal = () => {
    const { showModal, mode, showLoginAlert } = this.state;
    const { loggedIn } = this.props;
    return (
      <Modal show={showModal} onHide={this.closeModal}>
        <Modal.Header closeButton>
          <Modal.Title>{mode === "work" ? "Break Time is over" : "Working time is over"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {mode === "work"
            ? "Break time is over, select your next action."
            : "Working time is over, select your next action."}
          {showLoginAlert && !loggedIn && (
            <div className="alert alert-warning mt-3">
              You need to login to use this feature.
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          {mode === "work" ? (
            <>
              <Button variant="primary" onClick={this.startNewMode}>
                Start new task
              </Button>
              <Button variant="secondary" onClick={this.closeModal}>
                Close
              </Button>
            </>
          ) : (
            <>
              <Button variant="primary" onClick={this.startNewMode}>
                Stark break
              </Button>
              <Button variant="primary"
                onClick={() => {
                  if (!loggedIn) {
                    this.setState({ showLoginAlert: true });  // 显示警告
                  } else {
                    this.handleCategoryModal();  // 执行选择分类的功能
                  }
                }}
              >
                Select a category
              </Button>
              <Button variant="secondary" onClick={this.closeModal}>
                Close
              </Button>
            </>
          )}
        </Modal.Footer>
      </Modal>
    );
  };

  categoryModal = () => {
    const { showModal } = this.state;
    return (
      <Modal show={showModal} onHide={this.closeModal}>
        <Modal.Header closeButton>
          <Modal.Title>Select a category</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* 分类列表和新增分类按钮 */}
          <h5>Please select a category for your task:</h5>
          <ul>
            {this.state.categories.map((category, index) => (
              <li key={index}>
                <Button
                  variant="outline-primary"
                  onClick={() => this.selectCategory(category)}
                >
                  {category}
                </Button>
              </li>
            ))}
          </ul>
          <Button variant="primary" onClick={this.addCategory}>
            +
          </Button>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={this.closeModal}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    );
  };

  render() {
    const { time, isRunning, mode, modalType } = this.state;
    return (
      <div className="pomodoro-timer">
        <h2>{mode === "work" ? "Work Time" : "Break Time"}</h2>
        <h1>{this.formatTime(time)}</h1>
        <Button variant="success" onClick={this.toggleTimer}>
          {isRunning ? "Pause" : "Start"}
        </Button>
        <Button variant="danger" onClick={this.resetTimer}>
          Reset
        </Button>
        {modalType === "finish" && this.finishingModal()} {/* show finishing modal */}
        {modalType === "category" && this.categoryModal()}
      </div>
    );
  }
}

PomodoroTimer.propTypes = {
  loggedIn: PropTypes.bool.isRequired,  // 这里定义 loggedIn 为必需的布尔值
};

// Main App 
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      apiResponse: "",
      dbResponse: "",
      username: "",
      password: "",
      confirmPassword: "",
      registerMessage: "",
      loginMessage: "",
      showModal: false, // 控制 Modal 是否显示
      modalType: "login", // 控制 Modal 类型 ("login" 或 "register")
      loggedIn: false, // 控制是否已登录
      user: {} // 存储用户信息
    };
  }

  // API 调用
  async componentDidMount() {
    const apiResponse = await fetchTestAPI();
    const dbResponse = await fetchMongoDB();
    this.setState({ apiResponse, dbResponse }); //测试输出，需要删掉，同时也要删掉render中的apiResponse和dbResponse，testapi最后也要删掉
    // 页面加载时，从 localStorage 恢复登录状态
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    if (token && user) {
      this.setState({
        loggedIn: true,
        user: user
      });
    }

    this.autoLogout();
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
    this.setState({
      showModal: false,
      loginMessage: "",
      registerMessage: "",
      username: "",
      password: "",
      confirmPassword: "",
    });
  };

  handleLogin = async (event) => {
    event.preventDefault();
    const { username, password } = this.state;

    const result = await loginUser(username, password);
    if (result.error) {
      this.setState({ loginMessage: result.error });
      return;
    }
    const token = result.token;
    if (token) {
      // store user token in local storage
      localStorage.setItem('token', token);
      const decodedToken = jwtDecode(token);
      // store user information in local storage
      const user = {
        userId: decodedToken.userId,
        username: decodedToken.username
      };
      localStorage.setItem('user', JSON.stringify(user));
    }
    this.setState({ loggedIn: true })
    // this.setState({ loginMessage: result.error || result.message }); // 成功后modal会自动关闭，所以不需要显示成功信息
    this.closeModal();
  };

  handleRegister = async (event) => {
    event.preventDefault();
    const { username, password, confirmPassword } = this.state;

    if (password !== confirmPassword) {
      this.setState({ registerMessage: "Passwords do not match" });
      return;
    }

    const result = await registerUser(username, password);
    if (result.error) {
      this.setState({ registerMessage: result.error });
      return;
    }
    // this.setState({ registerMessage: result.message || "Registered successfully" }); // 成功后modal会自动关闭，所以不需要显示成功信息
    this.closeModal();
  };

  handleLogout = () => {
    // 清除存储的用户信息（例如 JWT Token）
    localStorage.removeItem('token'); // 假设你存储 token 时使用了 'token' 作为键名

    // 可能需要清除其他存储的数据，比如用户信息
    localStorage.removeItem('user'); // 如果你有存储用户信息

    // 更新状态来反映用户登出
    // this.setState({ loginMessage: "Logged out successfully" });
    this.setState({ loggedIn: false })
  };

  // Check token expiration
  checkTokenExpiration = () => {
    const token = localStorage.getItem('token');
    if (!token) return false;

    const decodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000; // 当前时间，以秒为单位
    return decodedToken.exp < currentTime; // 如果 token 已过期，返回 true
  };

  // Auto logout if token has expired
  autoLogout = () => {
    if (this.checkTokenExpiration()) {
      this.handleLogout(); // 如果 token 已过期，则自动登出
    }
  };

  showAccountModal = () => {
    const { showModal, modalType, loginMessage, registerMessage, username, password } = this.state;
    return (
      // 登录/注册的 Modal 弹窗
      < Modal show={showModal} onHide={this.closeModal} >
        <Modal.Header closeButton>
          <Modal.Title>{modalType === "login" ? "Login" : "Register"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* 显示登录或注册的消息 */}
          {modalType === "login" && loginMessage && (
            <div className="alert alert-info">{loginMessage}</div>
          )}
          {modalType === "register" && registerMessage && (
            <div className="alert alert-info">{registerMessage}</div>
          )}

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

            {/* 仅在注册时显示重复密码输入框 */}
            {modalType === "register" && (
              <Form.Group controlId="formConfirmPassword">
                <Form.Label>Confirm Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Re-enter password"
                  name="confirmPassword"
                  value={this.state.confirmPassword} // 确认密码的状态
                  onChange={this.handleChange}
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
          <Button variant="secondary" onClick={this.closeModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal >
    )
  }

  render() {
    const { apiResponse, dbResponse, loggedIn, user } = this.state;

    return (
      <div className="App">
        {/* Comment after testing */}
        <div className="App-intro">
          <p>{apiResponse}</p>
          <p>{dbResponse}</p>
        </div>

        <section>
          {loggedIn ? (
            <>
              {/* <Link to={`/userpage/${user.username}`}>{user.username}</Link>*/} {/*link to userpage*/}
              <p>Welcome, {user.username}!</p>
              <Button variant="secondary" onClick={this.handleLogout}>Logout</Button>
            </>
          ) : (
            <>
              <Button variant="primary" onClick={this.openLoginModal}>
                Login
              </Button>
              <Button variant="secondary" onClick={this.openRegisterModal}>
                Register
              </Button>
            </>
          )}
        </section>

        {/* 按钮，点击后弹出登录或注册表单 */}
        {this.showAccountModal()}


        {/* 番茄时钟 */}
        <PomodoroTimer
          loggedIn={this.state.loggedIn}
        />
      </div>
    );
  }
}

export default App;