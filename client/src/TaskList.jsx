import { useState, useEffect, useMemo } from 'react';
import { fetchUserTasks } from "./apiService";

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [expandedCategory, setExpandedCategory] = useState(null); // 用于跟踪展开的类别
  const [categoryDetails, setCategoryDetails] = useState({}); // 存储展开类别的详情

  // 获取任务数据
  const fetchTasks = async () => {
    try {
      const data = await fetchUserTasks(); // 调用 apiService 中的函数
      setTasks(data); // 将任务数据保存到 state 中
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  // 在组件加载时调用 fetchTasks
  useEffect(() => {
    fetchTasks();
  }, []); // 空依赖数组，表示只在组件挂载时执行一次

  // 计算类别列表，使用 useMemo 优化
  const categories = useMemo(() => {
    return tasks.reduce((categories, task) => {
      if (!categories.includes(task.category)) {
        categories.push(task.category);
      }
      return categories;
    }, []);
  }, [tasks]);

  // 切换类别的展开与收起
  const handleCategoryToggle = (category) => {
    if (expandedCategory === category) {
      setExpandedCategory(null); // 如果当前类别已展开，则收起
    } else {
      setExpandedCategory(category); // 展开当前类别
      // 如果是第一次展开，获取该类别的详细信息
      if (!categoryDetails[category]) {
        const tasksInCategory = tasks.filter(task => task.category === category);
        setCategoryDetails(prevDetails => ({
          ...prevDetails,
          [category]: tasksInCategory
        }));
      }
    }
  };

  // 渲染任务列表
  return (
    <div>
      {tasks.length === 0 ? (
        <p>No tasks available.</p>
      ) : (
        <div>
          {categories.map(category => (
            <div key={category}>
              <h3>
                {category} ({tasks.filter(task => task.category === category).length} tasks)
                <button onClick={() => handleCategoryToggle(category)}>
                  {expandedCategory === category ? 'Hide Details' : 'Show Details'}
                </button>
              </h3>
              {expandedCategory === category && categoryDetails[category] && (
                <div>
                  {categoryDetails[category].map(task => (
                    <div key={task._id}> {/* 使用任务的 _id 作为 key */}
                      <p><strong>Task:</strong> {task.detail}</p>
                      <p><strong>Completion Time:</strong> {task.completionTime}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskList;
