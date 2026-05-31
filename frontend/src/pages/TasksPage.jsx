import { useState, useEffect, useCallback } from 'react';
import API from '../api/axios';
import TaskCard from '../components/TaskCard';
import TaskForm from '../components/TaskForm';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import { useAuth } from '../context/AuthContext';

export default function TasksPage() {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('card'); // 'card' or 'table'

  // Filters & search
  const [filters, setFilters] = useState({ status: '', priority: '', search: '' });

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: currentPage };
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;
      if (filters.search) params.search = filters.search;

      const res = await API.get('/tasks/', { params });
      setTasks(res.data.results);
      setTotalCount(res.data.count);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filters]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    await API.delete(`/tasks/${id}/`);
    fetchTasks();
  };

  const handleStatusChange = async (task, newStatus) => {
    await API.patch(`/tasks/${task.id}/`, { status: newStatus });
    fetchTasks();
  };

  const handleSave = () => {
    setShowForm(false);
    setEditTask(null);
    fetchTasks();
  };

  const handleEdit = (task) => {
    setEditTask(task);
    setShowForm(true);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(totalCount / 6);

  const priorityCount = (p) => tasks.filter((t) => t.priority === p).length;
  const statusCount = (s) => tasks.filter((t) => t.status === s).length;

  return (
    <div className="app-layout">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span className="logo-icon">✓</span>
          <span>TaskFlow</span>
        </div>

        <div className="sidebar-user">
          <div className="user-avatar">{user?.username?.[0]?.toUpperCase()}</div>
          <div>
            <p className="user-name">{user?.username}</p>
            <p className="user-email">{user?.email || 'Manage tasks'}</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <p className="nav-label">Overview</p>
          <div className="stat-card-mini">
            <span>📋 All Tasks</span>
            <span className="badge">{totalCount}</span>
          </div>
          <div className="stat-card-mini todo">
            <span>🔵 To Do</span>
            <span className="badge">{statusCount('todo')}</span>
          </div>
          <div className="stat-card-mini progress">
            <span>🟡 In Progress</span>
            <span className="badge">{statusCount('in_progress')}</span>
          </div>
          <div className="stat-card-mini done">
            <span>🟢 Done</span>
            <span className="badge">{statusCount('done')}</span>
          </div>

          <p className="nav-label" style={{ marginTop: '1.5rem' }}>Priority</p>
          <div className="stat-card-mini high">
            <span>🔴 High</span>
            <span className="badge">{priorityCount('high')}</span>
          </div>
          <div className="stat-card-mini medium">
            <span>🟠 Medium</span>
            <span className="badge">{priorityCount('medium')}</span>
          </div>
          <div className="stat-card-mini low">
            <span>⚪ Low</span>
            <span className="badge">{priorityCount('low')}</span>
          </div>
        </nav>

        <button className="btn-logout" onClick={logout}>
          🚪 Logout
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">
        {/* Header */}
        <div className="content-header">
          <div>
            <h2 className="page-title">My Tasks</h2>
            <p className="page-subtitle">{totalCount} total tasks</p>
          </div>
          <div className="header-actions">
            <div className="view-toggle">
              <button
                id="view-card"
                className={viewMode === 'card' ? 'active' : ''}
                onClick={() => setViewMode('card')}
                title="Card View"
              >⊞</button>
              <button
                id="view-table"
                className={viewMode === 'table' ? 'active' : ''}
                onClick={() => setViewMode('table')}
                title="Table View"
              >☰</button>
            </div>
            <button
              id="add-task-btn"
              className="btn-primary"
              onClick={() => { setEditTask(null); setShowForm(true); }}
            >
              + New Task
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="toolbar">
          <SearchBar
            value={filters.search}
            onChange={(v) => handleFilterChange('search', v)}
          />
          <div className="filters">
            <select
              id="filter-status"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">All Status</option>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
            <select
              id="filter-priority"
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
            >
              <option value="">All Priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            {(filters.status || filters.priority || filters.search) && (
              <button
                className="btn-clear"
                onClick={() => { setFilters({ status: '', priority: '', search: '' }); setCurrentPage(1); }}
              >
                ✕ Clear
              </button>
            )}
          </div>
        </div>

        {/* Task List */}
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading tasks...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>No tasks found</h3>
            <p>Create your first task to get started!</p>
            <button className="btn-primary" onClick={() => setShowForm(true)}>+ Add Task</button>
          </div>
        ) : viewMode === 'card' ? (
          <div className="task-grid">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="task-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Due Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id}>
                    <td>
                      <div className="table-title">{task.title}</div>
                      <div className="table-desc">{task.description}</div>
                    </td>
                    <td>
                      <span className={`badge-priority priority-${task.priority}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td>
                      <select
                        className={`status-select status-${task.status}`}
                        value={task.status}
                        onChange={(e) => handleStatusChange(task, e.target.value)}
                      >
                        <option value="todo">To Do</option>
                        <option value="in_progress">In Progress</option>
                        <option value="done">Done</option>
                      </select>
                    </td>
                    <td className="table-date">
                      {task.due_date ? new Date(task.due_date).toLocaleDateString() : '—'}
                    </td>
                    <td>
                      <div className="table-actions">
                        <button className="btn-icon edit" onClick={() => handleEdit(task)}>✏️</button>
                        <button className="btn-icon delete" onClick={() => handleDelete(task.id)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </main>

      {/* Task Form Modal */}
      {showForm && (
        <TaskForm
          task={editTask}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditTask(null); }}
        />
      )}
    </div>
  );
}
