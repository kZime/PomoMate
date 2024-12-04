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
  
    try {
      const response = await fetch(`${API_BASE_URL}/addTask`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ category, detail }), // 将任务数据作为请求体发送
      });

      const data = await response.json();
      console.log(data); // 处理返回的数据
      return { success: true, message: "Task added successfully!" };
    } catch (error) {
      console.error('Error adding task:', error);
      return { success: false, message: 'Failed to add task.' };
  }
};

export const editTask = async (taskId, category, detail) => {
    const token = localStorage.getItem('token');
    console.log("using editTask function") 

    try {
        const response = await fetch(`${API_BASE_URL}/editTask`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ taskId, category, detail }), 
        });

        const data = await response.json();
        console.log("Edit data:",data); // Get data
        return { success: true, message: "Task edited successfully!" };
    } catch (error) {
        console.error('Error editing task:', error);
        return { success: false, message: 'Failed to edit task.' };
    }
}

export const deleteTask = async (taskId) => {
    const token = localStorage.getItem('token'); // 获取存储的 token

    try{
        const response = await fetch(`${API_BASE_URL}/deleteTask`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ taskId }),
        });

        const data = await response.json();
        console.log("Delete data:",data); // Get data
        return { success: true, message: "Task deleted successfully!" };
    } catch (error) {
        console.error('Error deleting task:', error);
        return { success: false, message: 'Failed to delete task.' };
    }
}