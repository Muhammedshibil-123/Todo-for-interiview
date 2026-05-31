import { useState, useEffect } from 'react';
import API from '../api/axios';

export default function TaskForm({ task, onSave, onClose }) {
  // Pre-fill form if editing an existing task
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo',
    due_date: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'medium',
        status: task.status || 'todo',
        due_date: task.due_date || '',
      });
    }
  }, [task]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (task) {
        // Edit mode — send PUT request
        await API.put(`/tasks/${task.id}/`, form);
      } else {
        // Create mode — send POST request
        await API.post('/tasks/', form);
      }
      onSave();
    } catch (err) {
      const data = err.response?.data;
      if (data) {
        const messages = Object.values(data).flat().join(' ');
        setError(messages);
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    // Modal overlay — clicking outside closes the form
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{task ? '✏️ Edit Task' : '➕ New Task'}</h3>
          <button id="close-modal" className="btn-close" onClick={onClose}>✕</button>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit} className="task-form">
          <div className="form-group">
            <label htmlFor="task-title">Title *</label>
            <input
              id="task-title"
              type="text"
              name="title"
              placeholder="Task title..."
              value={form.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="task-description">Description</label>
            <textarea
              id="task-description"
              name="description"
              placeholder="Describe the task..."
              value={form.description}
              onChange={handleChange}
              rows={3}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="task-priority">Priority</label>
              <select id="task-priority" name="priority" value={form.priority} onChange={handleChange}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="task-status">Status</label>
              <select id="task-status" name="status" value={form.status} onChange={handleChange}>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="task-due-date">Due Date</label>
            <input
              id="task-due-date"
              type="date"
              name="due_date"
              value={form.due_date}
              onChange={handleChange}
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" id="save-task-btn" className="btn-primary" disabled={loading}>
              {loading ? <span className="spinner-sm"></span> : task ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
