import { useState, useEffect } from 'react';
import API from '../api/axios';

export default function TaskForm({ task, onSave, onClose }) {
  const isEdit = Boolean(task);

  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo',
    due_date: '',
  });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  // Pre-fill when editing
  useEffect(() => {
    if (task) {
      setForm({
        title:       task.title || '',
        description: task.description || '',
        priority:    task.priority || 'medium',
        status:      task.status || 'todo',
        due_date:    task.due_date || '',
      });
    }
  }, [task]);

  const onChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isEdit) {
        await API.put(`/tasks/${task.id}/`, form);
      } else {
        await API.post('/tasks/', form);
      }
      onSave();
    } catch (err) {
      const data = err.response?.data;
      setError(data ? Object.values(data).flat().join(' ') : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>

        <div className="modal-header">
          <h3>{isEdit ? '✏️ Edit Task' : '✨ New Task'}</h3>
          <button id="close-modal" className="btn-close" onClick={onClose}>✕</button>
        </div>

        <form className="task-form" onSubmit={onSubmit}>
          {error && <div className="error-banner">{error}</div>}

          <div className="form-group">
            <label htmlFor="task-title">Title *</label>
            <input
              id="task-title"
              name="title"
              type="text"
              placeholder="What needs to be done?"
              value={form.title}
              onChange={onChange}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="task-desc">Description</label>
            <textarea
              id="task-desc"
              name="description"
              placeholder="Add more details about this task…"
              value={form.description}
              onChange={onChange}
              rows={3}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="task-priority">Priority</label>
              <select id="task-priority" name="priority" value={form.priority} onChange={onChange}>
                <option value="low">🟢 Low</option>
                <option value="medium">🟡 Medium</option>
                <option value="high">🔴 High</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="task-status">Status</label>
              <select id="task-status" name="status" value={form.status} onChange={onChange}>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="task-due">Due Date</label>
            <input
              id="task-due"
              name="due_date"
              type="date"
              value={form.due_date}
              onChange={onChange}
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button id="save-task-btn" type="submit" className="btn-primary" disabled={loading}>
              {loading
                ? <span className="spinner-sm" />
                : isEdit ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
