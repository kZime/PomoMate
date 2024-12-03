const API_BASE_URL = "http://localhost:9000";
// Get Task Api
export const fetchUserTasks = async () => {
    // 获取 token
    const token = localStorage.getItem('token');

    if (!token) {
        // 如果没有 token，提示用户登录
        console.log('You need to log in to manage tasks.');
        return { error: true, message: 'You need to log in to manage tasks.' };
    }

    try {
        const response = await fetch(`${API_BASE_URL}/getTasks`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`, // 携带 JWT token
            },
        });

        if (response.status === 403) {
            // 如果 token 无效或过期
            console.log('Invalid or expired token. Please log in again.');
            return { error: true, message: 'Please log in again.' };
        }

        const data = await response.json();
        console.log(data);
        return data; // 返回任务数据
    } catch (error) {
        console.error('Error fetching tasks:', error);
        return { error: true, message: 'Failed to fetch tasks.' };
    }
};

// Save Task Api
export const addTask = async (category, detail) => {
    const token = localStorage.getItem('token'); // 获取存储的 token
  
    const response = await fetch(`${API_BASE_URL}/addTask`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ category, detail }) // 将任务数据作为请求体发送
    });
  
    const data = await response.json();
    console.log(data); // 处理返回的数据
  };