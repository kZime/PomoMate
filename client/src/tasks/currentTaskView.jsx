import PropTypes from "prop-types";
import { Form, Button, InputGroup } from "react-bootstrap";
import { useState } from "react";

import { fetchExistingCategories } from "./taskAPIService";
import { useEffect } from "react";

// CurrentTaskView 组件，用于显示当前任务的信息
const CurrentTaskView = ({
  currentTask = { category: "", detail: "" },
  setCurrentTask,
}) => {
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [categories, setCategories] = useState(["Work", "Study", "Exercise"]); // DEBUG: 默认分类

  // // 如果没有当前任务，显示提示信息
  // if (!currentTask.category && !currentTask.detail) {
  //   return <p>No current task selected.</p>;
  // }
  useEffect(() => {
    fetchExistingCategories().then((categories) => {
      setCategories(categories);
    });
  }, []);

  return (
    <>
      <InputGroup>
        <Form.Select
          value={currentTask.category}
          onChange={(e) =>
            setCurrentTask({ ...currentTask, category: e.target.value })
          }
        >
          <option value="">Select a category</option>
          {categories.map((category, index) => (
            <option key={index} value={category}>
              {category}
            </option>
          ))}
        </Form.Select>

        <Button
          variant="outline-secondary"
          onClick={() => setShowNewCategory(!showNewCategory)}
        >
          +
        </Button>
      </InputGroup>

      {/* 按加号时，增加一个输入框添加新类别 */}
      {showNewCategory && (
        <InputGroup>
          <Form.Control
            placeholder="New Category"
            onChange={(e) =>
              setCurrentTask({ ...currentTask, category: e.target.value })
            }
          />
          <Button
            variant="outline-secondary"
            onClick={() => {
              setShowNewCategory(false);
              setCategories([...categories, currentTask.category]);
            }}
          >
            Add
          </Button>
        </InputGroup>
      )}

      {/* 分割线 */}
      <hr />

      {/* 添加Task 信息 */}

      <InputGroup
        onChange={(e) =>
          setCurrentTask({ ...currentTask, detail: e.target.value })
        }
      >
        <Form.Control placeholder="Task Detail" />
      </InputGroup>
    </>
  );
};

// 定义组件的 props 类型
CurrentTaskView.propTypes = {
  currentTask: PropTypes.object,
  setCurrentTask: PropTypes.func,
};

export default CurrentTaskView;
