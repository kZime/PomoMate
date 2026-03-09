import { useState, useEffect, useMemo } from "react";
import { fetchUserTasks, editTask, deleteTask } from "./taskAPIService";
import { Modal, Button, Form, InputGroup, Badge } from "react-bootstrap";
import PropTypes from "prop-types";
import { useMessage } from "../message/MessageContext";
import "./TaskList.css";

const TaskList = ({ refreshList }) => {
  const [tasks, setTasks] = useState([]);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const { showMessage } = useMessage();

  const fetchTasks = async () => {
    const result = await fetchUserTasks();
    if (result.error) {
      setErrorMessage(result.message);
      setTasks([]);
    } else {
      setTasks(result.tasks);
      setErrorMessage("");
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [refreshList]);

  const categories = useMemo(() => {
    return tasks.reduce((cats, task) => {
      if (!cats.includes(task.category)) cats.push(task.category);
      return cats;
    }, []);
  }, [tasks]);

  const tasksByCategory = useMemo(() => {
    return tasks.reduce((grouped, task) => {
      if (!grouped[task.category]) grouped[task.category] = [];
      grouped[task.category].push(task);
      return grouped;
    }, {});
  }, [tasks]);

  const formatDate = (isoDate) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleCategoryToggle = (category) => {
    setExpandedCategory((prev) => (prev === category ? null : category));
  };

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState(null);

  const confirmDelete = (taskId) => setDeleteTarget(taskId);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const result = await deleteTask(deleteTarget);
    if (result.success) {
      showMessage({ type: "success", message: "Task deleted." });
      fetchTasks();
    } else {
      showMessage({ type: "error", message: result.message });
    }
    setDeleteTarget(null);
  };

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editId, setEditId] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editDetail, setEditDetail] = useState("");
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const openEditModal = (taskId, detail, category) => {
    setEditId(taskId);
    setEditDetail(detail);
    setEditCategory(category);
    setShowEditModal(true);
    setShowNewCategory(false);
  };

  const handleEdit = async () => {
    const result = await editTask(editId, editCategory, editDetail);
    if (result.success) {
      showMessage({ type: "success", message: "Task updated." });
      fetchTasks();
      setShowEditModal(false);
    } else {
      showMessage({ type: "error", message: result.message });
    }
  };

  if (errorMessage) {
    return <p className="text-muted">{errorMessage}</p>;
  }

  if (tasks.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">&#128203;</div>
        <p>No tasks yet. Complete a Pomodoro session to see your tasks here.</p>
      </div>
    );
  }

  return (
    <div className="task-list">
      {categories.map((category) => (
        <div key={category} className="task-category">
          <button
            className={`category-header ${expandedCategory === category ? "expanded" : ""}`}
            onClick={() => handleCategoryToggle(category)}
          >
            <div className="category-header-left">
              <span className="category-arrow">
                {expandedCategory === category ? "\u25BC" : "\u25B6"}
              </span>
              <span className="category-name">{category}</span>
              <Badge bg="secondary" pill>
                {tasksByCategory[category]?.length || 0}
              </Badge>
            </div>
          </button>

          {expandedCategory === category && tasksByCategory[category] && (
            <div className="category-tasks">
              {tasksByCategory[category].map((task) => (
                <div key={task._id} className="task-item">
                  <div className="task-item-content">
                    <div className="task-detail">{task.detail}</div>
                    <div className="task-date">{formatDate(task.completedAt)}</div>
                  </div>
                  <div className="task-actions">
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => openEditModal(task._id, task.detail, task.category)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => confirmDelete(task._id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Delete confirmation modal */}
      <Modal show={!!deleteTarget} onHide={() => setDeleteTarget(null)} centered size="sm">
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this task?</Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
          <Button variant="outline-secondary" onClick={() => setDeleteTarget(null)}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Task</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Category</Form.Label>
            <Form.Select
              value={editCategory}
              onChange={(e) => setEditCategory(e.target.value)}
            >
              <option value="">Select a category</option>
              {categories.map((cat, i) => (
                <option key={i} value={cat}>{cat}</option>
              ))}
            </Form.Select>
          </Form.Group>

          {!showNewCategory ? (
            <Button
              variant="link"
              size="sm"
              className="p-0 mb-3"
              onClick={() => setShowNewCategory(true)}
            >
              + Add New Category
            </Button>
          ) : (
            <InputGroup className="mb-3">
              <Form.Control
                placeholder="New category name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
              />
              <Button
                variant="outline-secondary"
                onClick={() => {
                  if (newCategoryName.trim()) {
                    setEditCategory(newCategoryName.trim());
                    setNewCategoryName("");
                    setShowNewCategory(false);
                  }
                }}
              >
                Add
              </Button>
            </InputGroup>
          )}

          <Form.Group>
            <Form.Label>Detail</Form.Label>
            <Form.Control
              value={editDetail}
              onChange={(e) => setEditDetail(e.target.value)}
              placeholder="Task detail"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleEdit}>
            Save Changes
          </Button>
          <Button variant="outline-secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

TaskList.propTypes = {
  refreshList: PropTypes.string.isRequired,
};

export default TaskList;
