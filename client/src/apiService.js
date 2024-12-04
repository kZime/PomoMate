const API_BASE_URL = "http://localhost:9000";

// 注册接口
export const registerUser = async (username, password) => {
    try {
        // 发起注册请求
        const response = await fetch(`${API_BASE_URL}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        // 解析响应数据
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || "Registration failed");
        }
        return data; // 返回注册成功的信息或 token
    } catch (error) {
        console.error(error);
        return { error: error.message };
    }
};

// 登录接口
export const loginUser = async (username, password) => {
    try {
        // 发起登录请求
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        // 解析响应数据
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || "Login failed");
        }
        return data; // 返回登录成功的信息或 token
    } catch (error) {
        console.error(error);
        return { error: error.message };
    }
};

export const askForNextTask = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/openai`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: ""
    });

    const data = await response.json();
    return data;
}

// 获取测试 API
export const fetchTestAPI = async () => {
    try {
        // 发起测试请求
        const response = await fetch(`${API_BASE_URL}/testAPI`);
        if (!response.ok) throw new Error("Failed to fetch API");
        return await response.text();
    } catch (error) {
        console.error(error);
        return "Error fetching API data.";
    }
};

// 获取数据库连接状态
export const fetchMongoDB = async () => {
    try {
        // 发起数据库连接请求
        const response = await fetch(`${API_BASE_URL}/mongoDB`);
        if (!response.ok) throw new Error("Failed to connect to MongoDB");
        return await response.text();
    } catch (error) {
        console.error(error);
        return "Error connecting to MongoDB.";
    }
};
