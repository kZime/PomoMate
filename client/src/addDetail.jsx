import { useState } from "react";
import { Modal, Button } from "react-bootstrap";
import {addTask} from "./apiService";
import PropTypes from 'prop-types';

const TaskDetailAdd = ({ category, showModal, setShowModal }) => {
    const [task, setTask] = useState([]);
    const [detail, setDetail] = useState('');

  // 处理输入框变化
    const handleDetailChange = (e) => {
        setDetail(e.target.value);
    };

  // 提交任务详情
    const handleSubmit = () => {
    // 如果没有提供 detail，就使用默认值 "Not defined"
    const newTask = {
        category,
        detail: detail || "Not defined", // 如果 detail 为空，则使用默认值
    };

    // 将新任务添加到任务列表
    setTask(newTask);
    addTask(task)

    // 清空输入框并关闭 modal
    setDetail('');
    closeModal()
    };

    const closeModal = () =>{
        setShowModal(false)
    }

    return (
    <Modal show={showModal} onHide={closeModal}>
        <Modal.Header closeButton>
        <Modal.Title>Add Task Detail for Category: {category}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <label>
            Task Detail:
            <input type="text" value={detail} onChange={handleDetailChange} />
            </label>
        </Modal.Body>
        <Modal.Footer>
            <Button variant="primary" onClick={handleSubmit}>Submit</Button>
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

