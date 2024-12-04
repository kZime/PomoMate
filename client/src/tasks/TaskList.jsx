import { useState, useEffect, useMemo } from 'react';
import { fetchUserTasks, editTask, deleteTask } from "./taskAPIService";
import { Modal, Button, InputGroup, Form } from "react-bootstrap";
import PropTypes from 'prop-types';

const TaskList = ({ refreshList }) => {
  // console.log("New tasksResult received:", tasksResult);
  const [tasks, setTasks] = useState([]);
  const [expandedCategory, setExpandedCategory] = useState(null); // 用于跟踪展开的类别
  const [categoryDetails, setCategoryDetails] = useState({}); // 存储展开类别的详情
  const [errorMessage, setErrorMessage] = useState('');

  // 获取任务数据
  const fetchTasks = async () => {
    const result = await fetchUserTasks();
    console.log("fetched tasks", result)
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
  }, [refreshList]); 

  useEffect(() => {
    refreshCategoryDetails();
    // console.log("Updated task list because of new tasksResult")
  }, [tasks]); 

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

  const dateFormat = ( isoDate ) => {
    const date = new Date(isoDate);

  const options = { timeZone: 'America/Chicago', year: 'numeric', month: '2-digit', day: '2-digit' };
  const [month, day, year] = new Intl.DateTimeFormat('en-US', options).format(date).split('/');

  const formattedDate = `${year}-${month}-${day}`;
  return formattedDate;
  }

  const refreshCategoryDetails = () => {
    const newCategoryDetails = tasks.reduce((categories, task) => {
      // 如果任务的类别不存在于对象中，创建一个空数组
      if (!categories[task.category]) {
        categories[task.category] = [];
      }
      // 将任务添加到对应类别的数组中
      categories[task.category].push(task);
      return categories;
    }, {});
  
    // 更新 state，设置所有类别的任务
    setCategoryDetails(newCategoryDetails);
    console.log("new category detail", categoryDetails)
  };

  // 切换类别的展开与收起
  const handleCategoryToggle = (category) => {
    if (expandedCategory === category) {
      setExpandedCategory(null); // 如果当前类别已展开，则收起
    } else {
      setExpandedCategory(category); // 展开当前类别
    }
  };

  const handleDelete = async (taskId) => {
    // console.log("Deleting task with id:", id);
    const result = await deleteTask(taskId); // 调用 deleteTask 函数删除任务

    if (result.success) {
      // 如果删除成功，刷新任务列表或从本地状态中移除已删除的任务
      fetchTasks();
      // console.log("categoryDetails after delete:", categoryDetails);
      // alert(result.message); // 可以改成message组件显示删除成功的消息
    } else {
      alert(result.message); // 显示错误消息
    }
  }


  const [currentTaskId, setCurrentTaskId] = useState("");
  const [taskDetail, setTaskDetail] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const handleEdit = async (taskId) => {
    console.log("Editing task with id:", taskId);
    const result = await editTask(taskId, selectedCategory, taskDetail); // 调用 editTask 函数编辑任务
    if (result.success) {
      // 如果删除成功，刷新任务列表或从本地状态中移除已删除的任务
      fetchTasks();
      setShowModal(false);
      // console.log("categoryDetails after delete:", categoryDetails);
      // alert(result.message); // 可以改成message组件显示删除成功的消息
    } else {
      // alert(result.message); // 显示错误消息
    }
  }


  const showEditModal = (taskId, detail, category) => {
    setCurrentTaskId(taskId);
    setTaskDetail(detail);
    setSelectedCategory(category);
    setShowModal(true);
  }

  // Pasted from PomodoroTimer.js
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [currentCategories, setCurrentCategories] = useState(["Work", "Study", "Exercise"]); // DEBUG: 默认分类
  // const [selectedCategory, setSelectedCategory] = useState(categories[0]); // 默认选中第一个分类
  const [newCategoryContent, setNewCategoryContent] = useState("");
  // const [taskDetail, setTaskDetail] = useState("");
  const [showModal, setShowModal] = useState(false);

  const closeModal = () => {
    setShowModal(false);
  };

  const taskModal = () => (
    <Modal show={showModal} onHide={closeModal}>
      <Modal.Header closeButton>
        <Modal.Title>Edit Task</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h5>Please edit your task:</h5>
        {/* 显示所有现有类别的单选按钮 */}
        <Form.Select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">Select a category</option>
          {categories.map((category, index) => (
            <option key={index} value={category}>
              {category}
            </option>
          ))}
        </Form.Select>

        <Button
          variant="primary"
          onClick={() => setShowNewCategory(!showNewCategory)}
        >
          Add New Category
        </Button>

        {/* DEBUG: 测试消息 */}
        {/* <Button
          variant="info"
          onClick={() =>
            showMessage({
              type: "success",
              message: "This is a success message!",
            })
          }
        >
          Show Message
        </Button> */}

        {/* 按加号时，增加一个输入框添加新类别 */}
        {showNewCategory && (
          <InputGroup>
            <Form.Control
              placeholder="New Category"
              onChange={(e) => setNewCategoryContent(e.target.value)}
            />
            <Button
              variant="outline-secondary"
              onClick={() => {
                setShowNewCategory(false);
                setCurrentCategories([...currentCategories, newCategoryContent]);
              }}
            >
              Add
            </Button>
          </InputGroup>
        )}

        {/* 分割线 */}
        <hr />

        {/* 添加Task 信息 */}

        <InputGroup onChange={(e) => setTaskDetail(e.target.value)}>
          <Form.Control placeholder="Task Detail" value={taskDetail}/>
        </InputGroup>
      </Modal.Body>
      <Modal.Footer>
        {/* Save Button */}
        <Button variant="success" onClick={() => handleEdit(currentTaskId)}>
          Edit
        </Button>

        <Button variant="secondary" onClick={closeModal}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );

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
                          <table>
                            <thead>
                              <tr>
                                <th>Task</th>
                                <th>Completion Time</th>
                                <th>Actions</th> {/* Show New Button */}
                              </tr>
                            </thead>
                            <tbody>
                              {categoryDetails[category].map(task => (
                                <tr key={task._id}>
                                  <td>{task.detail}</td>
                                  <td>{dateFormat(task.completedAt)}</td>
                                  <td>
                                    <button onClick={() =>showEditModal(task._id, task.detail, task.category)}>Edit</button> {/* Edit Button */}
                                    <button onClick={() =>handleDelete(task._id)}>Delete</button> {/* Delete Button */}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                )}
            </div>
        )}
        {taskModal()}
    </div>
);
};

TaskList.propTypes = {
  refreshList: PropTypes.string.isRequired
};

export default TaskList;
