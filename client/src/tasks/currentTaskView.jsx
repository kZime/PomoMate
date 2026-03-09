import PropTypes from "prop-types";
import { Form, Button, InputGroup } from "react-bootstrap";
import { useState, useEffect } from "react";
import { fetchExistingCategories } from "./taskAPIService";

const CurrentTaskView = ({
  currentTask = { category: "", detail: "" },
  setCurrentTask,
}) => {
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchExistingCategories()
      .then((fetched) => {
        setCategories(Array.isArray(fetched) ? fetched : []);
      })
      .catch(() => {
        setCategories([]);
      });
  }, []);

  return (
    <div>
      <Form.Group className="mb-3">
        <Form.Label className="fw-medium" style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)" }}>
          Category
        </Form.Label>
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
            title="Add new category"
          >
            +
          </Button>
        </InputGroup>
      </Form.Group>

      {showNewCategory && (
        <InputGroup className="mb-3">
          <Form.Control
            placeholder="New category name"
            onChange={(e) =>
              setCurrentTask({ ...currentTask, category: e.target.value })
            }
          />
          <Button
            variant="outline-secondary"
            onClick={() => {
              if (currentTask.category.trim()) {
                setShowNewCategory(false);
                setCategories([...categories, currentTask.category]);
              }
            }}
          >
            Add
          </Button>
        </InputGroup>
      )}

      <Form.Group>
        <Form.Label className="fw-medium" style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)" }}>
          Detail
        </Form.Label>
        <Form.Control
          value={currentTask.detail}
          onChange={(e) =>
            setCurrentTask({ ...currentTask, detail: e.target.value })
          }
          placeholder="What are you working on?"
        />
      </Form.Group>
    </div>
  );
};

CurrentTaskView.propTypes = {
  currentTask: PropTypes.object,
  setCurrentTask: PropTypes.func,
};

export default CurrentTaskView;
