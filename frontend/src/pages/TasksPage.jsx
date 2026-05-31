import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import TaskCard from '../components/TaskCard';
import TaskForm from '../components/TaskForm';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';

export default function TasksPage() {
  const { user, logout } = useAuth();

  // ── State ──────────────────────────────────────────
  const [tasks, setTasks]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [editTask, setEditTask]   = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode]   = useState('card');
  const [filters, setFilters]     = useState({ status: '', priority: '', search: '' });

  // ── Fetch ──────────────────────────────────────────
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: currentPage };
      if (filters.status)   params.status   = filters.status;
      if (filters.priority) params.priority  = filters.priority;
      if (filters.search)   params.search    = filters.search;

      const res = await API.get('/tasks/', { params });
      setTasks(res.data.results);
      setTotalCount(res.data.count);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filters]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  // ── Handlers ───────────────────────────────────────
  const openCreate = () => { setEditTask(null); setShowForm(true); };
  const openEdit   = task => { setEditTask(task); setShowForm(true); };
  const closeForm  = () => { setShowForm(false); setEditTask(null); };
  const afterSave  = () => { closeForm(); fetchTasks(); };

  const handleDelete = async id => {
    if (!window.confirm('Delete this task?')) return;
    await API.delete(`/tasks/${id}/`);
    fetchTasks();
  };

  const handleStatusChange = async (task, newStatus) => {
    await API.patch(`/tasks/${task.id}/`, { status: newStatus });
    fetchTasks();
  };

  const setFilter = (key, value) => {
    setFilters(f => ({ ...f, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({ status: '', priority: '', search: '' });
    setCurrentPage(1);
  };

  // ── Derived ────────────────────────────────────────
  const totalPages   = Math.ceil(totalCount / 6);
  const count = s => tasks.filter(t => t.status === s).length;
  const pcount = p => tasks.filter(t => t.priority === p).length;
  const hasFilters = filters.status || filters.priority || filters.search;

  return (
    <div className="app-layout">

      {/* ═══ SIDEBAR ═══════════════════════════════════ */}
      <aside className="sidebar">

        <div className="sidebar-logo">
          <div className="logo-icon" style={{ fontSize: '.85rem' }}>✓</div>
          <span>TaskFlow</span>
        </div>

        <div className="sidebar-user">
          <div className="user-avatar">
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="user-name">{user?.username}</p>
            <p className="user-role">Task Manager</p>
          </div>
        </div>

        {/* Status overview */}
        <div className="nav-section">
          <p className="nav-label">Status</p>
          <div className="stat-row">
            <span className="stat-row-left">📋 All Tasks</span>
            <span className="stat-num">{totalCount}</span>
          </div>
          <div className="stat-row s-todo">
            <span className="stat-row-left">🔵 To Do</span>
            <span className="stat-num">{count('todo')}</span>
          </div>
          <div className="stat-row s-prog">
            <span className="stat-row-left">🟡 In Progress</span>
            <span className="stat-num">{count('in_progress')}</span>
          </div>
          <div className="stat-row s-done">
            <span className="stat-row-left">🟢 Done</span>
            <span className="stat-num">{count('done')}</span>
          </div>
        </div>

        {/* Priority overview */}
        <div className="nav-section">
          <p className="nav-label">Priority</p>
          <div className="stat-row s-high">
            <span className="stat-row-left">🔴 High</span>
            <span className="stat-num">{pcount('high')}</span>
          </div>
          <div className="stat-row s-medium">
            <span className="stat-row-left">🟠 Medium</span>
            <span className="stat-num">{pcount('medium')}</span>
          </div>
          <div className="stat-row s-low">
            <span className="stat-row-left">⚪ Low</span>
            <span className="stat-num">{pcount('low')}</span>
          </div>
        </div>

        <div className="sidebar-footer">
          <button className="btn-logout" onClick={logout}>
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* ═══ MAIN ═══════════════════════════════════════ */}
      <main className="main-content">

        {/* Top bar */}
        <div className="top-bar">
          <div className="top-bar-left">
            <h2>My Tasks</h2>
            <p>{totalCount} task{totalCount !== 1 ? 's' : ''} in total</p>
          </div>
          <div className="top-bar-right">
            <div className="view-toggle">
              <button
                id="view-card"
                className={viewMode === 'card' ? 'active' : ''}
                onClick={() => setViewMode('card')}
                title="Card view"
              >⊞</button>
              <button
                id="view-table"
                className={viewMode === 'table' ? 'active' : ''}
                onClick={() => setViewMode('table')}
                title="Table view"
              >☰</button>
            </div>
            <button id="add-task-btn" className="btn-primary" onClick={openCreate}>
              + New Task
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="toolbar">
          <SearchBar
            value={filters.search}
            onChange={v => setFilter('search', v)}
          />
          <select
            id="filter-status"
            className="filter-select"
            value={filters.status}
            onChange={e => setFilter('status', e.target.value)}
          >
            <option value="">All Status</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>
          <select
            id="filter-priority"
            className="filter-select"
            value={filters.priority}
            onChange={e => setFilter('priority', e.target.value)}
          >
            <option value="">All Priority</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          {hasFilters && (
            <button className="btn-clear-filter" onClick={clearFilters}>
              ✕ Clear
            </button>
          )}
        </div>

        {/* Content */}
        <div className="content-area">

          {/* Stats bar */}
          <div className="stats-bar">
            <div className="stat-card">
              <div className="stat-icon purple">📋</div>
              <div>
                <div className="stat-card-num">{totalCount}</div>
                <div className="stat-card-lbl">Total Tasks</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon blue">🔵</div>
              <div>
                <div className="stat-card-num">{count('todo')}</div>
                <div className="stat-card-lbl">To Do</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon amber">🟡</div>
              <div>
                <div className="stat-card-num">{count('in_progress')}</div>
                <div className="stat-card-lbl">In Progress</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon green">✅</div>
              <div>
                <div className="stat-card-num">{count('done')}</div>
                <div className="stat-card-lbl">Completed</div>
              </div>
            </div>
          </div>

          {/* Tasks list */}
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading tasks…</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h3>{hasFilters ? 'No tasks match your filters' : 'No tasks yet'}</h3>
              <p>{hasFilters ? 'Try clearing the filters' : 'Create your first task to get started!'}</p>
              {!hasFilters && (
                <button className="btn-primary" onClick={openCreate}>+ Create Task</button>
              )}
            </div>
          ) : viewMode === 'card' ? (
            <div className="task-grid">
              {tasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={openEdit}
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
                  {tasks.map(task => (
                    <tr key={task.id}>
                      <td>
                        <div className="tbl-title">{task.title}</div>
                        {task.description && <div className="tbl-desc">{task.description}</div>}
                      </td>
                      <td>
                        <span className={`pill p-${task.priority}`}>
                          {task.priority}
                        </span>
                      </td>
                      <td>
                        <select
                          className={`status-sel ${task.status}`}
                          value={task.status}
                          onChange={e => handleStatusChange(task, e.target.value)}
                        >
                          <option value="todo">To Do</option>
                          <option value="in_progress">In Progress</option>
                          <option value="done">Done</option>
                        </select>
                      </td>
                      <td className="tbl-date">
                        {task.due_date
                          ? new Date(task.due_date).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' })
                          : '—'}
                      </td>
                      <td>
                        <div className="tbl-actions">
                          <button className="btn-icon edit"   onClick={() => openEdit(task)}      title="Edit">✏️</button>
                          <button className="btn-icon delete" onClick={() => handleDelete(task.id)} title="Delete">🗑️</button>
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
        </div>
      </main>

      {/* Modal */}
      {showForm && (
        <TaskForm
          task={editTask}
          onSave={afterSave}
          onClose={closeForm}
        />
      )}
    </div>
  );
}
