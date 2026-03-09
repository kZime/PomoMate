const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

export const registerUser = async (username, password) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/user/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || "Registration failed");
        }
        return data;
    } catch (error) {
        return { error: error.message };
    }
};

export const loginUser = async (username, password) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/user/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || "Login failed");
        }
        return data;
    } catch (error) {
        return { error: error.message };
    }
};

export const loginDemoUser = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/user/demo-login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || "Demo login failed");
        }
        return data;
    } catch (error) {
        return { error: error.message };
    }
};

export const askForNextTask = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/api/openai/predictTask`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: ""
    });

    const data = await response.json();
    return data;
};

export const fetchTestAPI = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/test`);
        if (!response.ok) throw new Error("Failed to fetch API");
        return await response.text();
    } catch (error) {
        return "Error fetching API data.";
    }
};

export const fetchMongoDB = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/mongodb`);
        if (!response.ok) throw new Error("Failed to connect to MongoDB");
        return await response.text();
    } catch (error) {
        return "Error connecting to MongoDB.";
    }
};
