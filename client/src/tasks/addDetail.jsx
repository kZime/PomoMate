import { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { addTask } from "./taskAPIService";
import PropTypes from "prop-types";

const TaskDetailAdd = ({ category, showModal, setShowModal }) => {
  const [detail, setDetail] = useState("");

  const handleSubmit = async () => {
    const taskDetail = detail || "Not defined";
    await addTask(category, taskDetail);
    setDetail("");
    setShowModal(false);
  };

  return (
    <Modal show={showModal} onHide={() => setShowModal(false)} centered>
      <Modal.Header closeButton>
        <Modal.Title>Add Task Detail for: {category}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group>
          <Form.Label>Task Detail</Form.Label>
          <Form.Control
            type="text"
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            placeholder="Enter task detail"
          />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={handleSubmit}>
          Submit
        </Button>
        <Button variant="outline-secondary" onClick={() => setShowModal(false)}>
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

TaskDetailAdd.propTypes = {
  category: PropTypes.string.isRequired,
  showModal: PropTypes.bool.isRequired,
  setShowModal: PropTypes.func.isRequired,
};

export default TaskDetailAdd;
