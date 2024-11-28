import React, { Component } from 'react';
import logo from './logo.svg'; // 假设你有 logo.svg 文件
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      apiResponse: '',
      dbResponse: '',
      username: '',
      password: '',
      registerMessage: '',
      loginMessage: '',
      showRegisterForm: false, // 新增状态，控制表单显示
      showLoginForm: false, // 新增状态，控制表单显示
    };
  }

  handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  handleRegister = (e) => {
    e.preventDefault();
    // 执行注册逻辑
    this.setState({ registerMessage: 'Registration successful!' });
  };

  handleLogin = (e) => {
    e.preventDefault();
    // 执行登录逻辑
    this.setState({ loginMessage: 'Login successful!' });
  };

  toggleForm = (form) => {
    // 切换显示注册表单或登录表单
    if (form === 'register') {
      this.setState({ showRegisterForm: true, showLoginForm: false });
    } else if (form === 'login') {
      this.setState({ showLoginForm: true, showRegisterForm: false });
    }
  };

  render() {
    const { apiResponse, dbResponse, username, password, registerMessage, loginMessage, showRegisterForm, showLoginForm } = this.state;

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

        {/* 按钮切换表单 */}
        <div>
          <button onClick={() => this.toggleForm('register')}>Register</button>
          <button onClick={() => this.toggleForm('login')}>Login</button>
        </div>

        {/* 注册表单 */}
        {showRegisterForm && (
          <section>
            <h2>Register</h2>
            <form onSubmit={this.handleRegister}>
              <label>Username:</label>
              <input
                type="text"
                name="username"
                value={username}
                onChange={this.handleChange}
                required
              />
              <label>Password:</label>
              <input
                type="password"
                name="password"
                value={password}
                onChange={this.handleChange}
                required
              />
              <button type="submit">Register</button>
            </form>
            <p>{registerMessage}</p>
          </section>
        )}

        {/* 登录表单 */}
        {showLoginForm && (
          <section>
            <h2>Login</h2>
            <form onSubmit={this.handleLogin}>
              <label>Username:</label>
              <input
                type="text"
                name="username"
                value={username}
                onChange={this.handleChange}
                required
              />
              <label>Password:</label>
              <input
                type="password"
                name="password"
                value={password}
                onChange={this.handleChange}
                required
              />
              <button type="submit">Login</button>
            </form>
            <p>{loginMessage}</p>
          </section>
        )}
      </div>
    );
  }
}

export default App;
