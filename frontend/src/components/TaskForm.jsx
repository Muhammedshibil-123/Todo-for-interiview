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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-surface border border-border w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden transform transition-all animate-[modal-enter_0.2s_ease-out]"
        onClick={e => e.stopPropagation()}
      >
        
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-surfaceHover/50">
          <h3 className="text-lg font-bold text-textMain flex items-center gap-2">
            {isEdit ? '✏️ Edit Task' : '✨ New Task'}
          </h3>
          <button onClick={onClose} className="p-2 text-textMuted hover:text-white hover:bg-surface rounded-lg transition-colors">
            ✕
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-5">
          {error && <div className="bg-danger/10 text-danger text-sm p-3 rounded-lg border border-danger/30">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-textMuted mb-1.5">Title <span className="text-danger">*</span></label>
            <input
              name="title"
              type="text"
              placeholder="What needs to be done?"
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-textMain focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-textMuted/40"
              value={form.title}
              onChange={onChange}
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-textMuted mb-1.5">Description</label>
            <textarea
              name="description"
              placeholder="Add more details about this task…"
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-textMain focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-textMuted/40 resize-y min-h-[100px]"
              value={form.description}
              onChange={onChange}
              rows={3}
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-textMuted mb-1.5">Priority</label>
              <select 
                name="priority" 
                value={form.priority} 
                onChange={onChange}
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-textMain focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none cursor-pointer pr-10 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%239CA3AF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:10px_10px] bg-[position:right_1rem_center] bg-no-repeat"
              >
                <option value="low">⚪ Low</option>
                <option value="medium">🟡 Medium</option>
                <option value="high">🔴 High</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-textMuted mb-1.5">Status</label>
              <select 
                name="status" 
                value={form.status} 
                onChange={onChange}
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-textMain focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none cursor-pointer pr-10 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%239CA3AF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:10px_10px] bg-[position:right_1rem_center] bg-no-repeat"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-textMuted mb-1.5">Due Date</label>
            <input
              name="due_date"
              type="date"
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-textMain focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all [color-scheme:dark]"
              value={form.due_date}
              onChange={onChange}
            />
          </div>

          <div className="pt-4 border-t border-border mt-6 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-medium text-textMuted hover:text-white bg-surfaceHover transition-colors border border-transparent hover:border-border">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="bg-primary hover:bg-primaryHover text-white px-6 py-2.5 rounded-xl font-medium shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 flex items-center justify-center">
              {loading
                ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : isEdit ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
