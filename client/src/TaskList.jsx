import { useState, useEffect, useMemo } from 'react';
import { fetchUserTasks } from "./apiService";
import PropTypes from 'prop-types';

const TaskList = ({ tasksResult }) => {
  // console.log("New tasksResult received:", tasksResult);
  const [tasks, setTasks] = useState([]);
  const [expandedCategory, setExpandedCategory] = useState(null); // 用于跟踪展开的类别
  const [categoryDetails, setCategoryDetails] = useState({}); // 存储展开类别的详情
  const [errorMessage, setErrorMessage] = useState('');

  // 获取任务数据
  const fetchTasks = async () => {
    const result = await fetchUserTasks();

        if (result.error) {
            // 如果出错，设置错误信息
            setErrorMessage(result.message);
            setTasks([]);
        } else {
            // 否则设置任务列表
            setTasks(result.tasks);
            setErrorMessage('');
        }
  };


  // 在组件加载时调用 fetchTasks
  useEffect(() => {
    fetchTasks();
    // console.log("Updated task list because of new tasksResult")
  }, [tasksResult]); // 空依赖数组，表示只在组件挂载时执行一次

  // 计算类别列表，使用 useMemo 优化
  const categories = useMemo(() => {
    // console.log("Calculating categories...")
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
        {errorMessage ? (
            <p style={{ color: 'red' }}>{errorMessage}</p> // 显示错误提示
        ) : (
            <div>
                {tasks.length === 0 ? (
                    <p>No tasks available.</p> // 没有任务时的提示
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
        )}
    </div>
);
};

TaskList.propTypes = {
  tasksResult: PropTypes.shape({
    tasks: PropTypes.array,
    error: PropTypes.bool,
    message: PropTypes.string,
  }).isRequired
};

export default TaskList;
