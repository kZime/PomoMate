const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:9000";

export const fetchUserTasks = async () => {
    const token = localStorage.getItem('token');

    if (!token) {
        return { error: true, message: 'You need to log in to manage tasks.' };
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/task/get`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (response.status === 403) {
            return { error: true, message: 'Please log in again.' };
        }

        const data = await response.json();
        return data;
    } catch (error) {
        return { error: true, message: 'Failed to fetch tasks.' };
    }
};

export const fetchExistingCategories = async () => {
    const result = await fetchUserTasks();
    if (result.error) {
        return { error: true, message: 'Failed to fetch categories.' };
    }
    return [...new Set(result.tasks.map((task) => task.category))];
};

export const addTask = async (category, detail) => {
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`${API_BASE_URL}/api/task/add`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ category, detail }),
      });

      const data = await response.json();
      return { success: true, message: "Task added successfully!" };
    } catch (error) {
      return { success: false, message: 'Failed to add task.' };
    }
};

export const editTask = async (taskId, category, detail) => {
    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`${API_BASE_URL}/api/task/edit`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ taskId, category, detail }),
        });

        const data = await response.json();
        return { success: true, message: "Task edited successfully!" };
    } catch (error) {
        return { success: false, message: 'Failed to edit task.' };
    }
};

export const deleteTask = async (taskId) => {
    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`${API_BASE_URL}/api/task/delete`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ taskId }),
        });

        const data = await response.json();
        return { success: true, message: "Task deleted successfully!" };
    } catch (error) {
        return { success: false, message: 'Failed to delete task.' };
    }
};
