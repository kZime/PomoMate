const API_BASE_URL = "http://localhost:9000"; // 假设你的后端 API 基础路径是这个

// 注册接口
export const registerUser = async (username, password) => {
    try {
        const response = await fetch(`${API_BASE_URL}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

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
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

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

// 获取测试 API
export const fetchTestAPI = async () => {
    try {
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
        const response = await fetch(`${API_BASE_URL}/mongoDB`);
        if (!response.ok) throw new Error("Failed to connect to MongoDB");
        return await response.text();
    } catch (error) {
        console.error(error);
        return "Error connecting to MongoDB.";
    }
};
