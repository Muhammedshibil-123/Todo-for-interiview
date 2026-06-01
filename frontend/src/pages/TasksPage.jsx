import { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/authSlice';
import API from '../api/axios';
import TaskCard from '../components/TaskCard';
import TaskForm from '../components/TaskForm';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import AIChatBubble from '../components/AIChatBubble';

export default function TasksPage() {
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();


  const [tasks, setTasks]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [editTask, setEditTask]   = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode]   = useState('card');
  const [filters, setFilters]     = useState({ status: '', priority: '', search: '' });


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

 
  const totalPages   = Math.ceil(totalCount / 6);
  const count = s => tasks.filter(t => t.status === s).length;
  const pcount = p => tasks.filter(t => t.priority === p).length;
  const hasFilters = filters.status || filters.priority || filters.search;

  return (
    <div className="min-h-screen bg-background text-textMain flex flex-col overflow-hidden">
      
     
      <nav className="w-full bg-surface border-b border-border flex items-center justify-between px-6 py-3 shrink-0 z-20">
        
       
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-bold shadow-lg shadow-primary/20">
            ✓
          </div>
          <span className="text-xl font-bold tracking-tight">TaskFlow</span>
        </div>

        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="font-semibold text-sm truncate">{user?.username}</p>
              <p className="text-xs text-textMuted truncate">Task Manager</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-lg font-bold">
              {user?.username?.[0]?.toUpperCase()}
            </div>
          </div>
          <div className="h-8 w-px bg-border mx-1"></div>
          <button 
            onClick={async () => {
              try { await API.post('/auth/logout/'); } catch(e) {}
              dispatch(logout());
            }}
            className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-sm font-medium text-textMuted hover:text-white hover:bg-danger/20 hover:border-danger/30 border border-transparent transition-all"
            title="Logout"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </nav>

      
      <main className="flex-1 flex flex-col overflow-hidden max-w-7xl mx-auto w-full">
        
        
        <header className="flex flex-col sm:flex-row sm:items-center justify-between px-8 py-6 z-10 gap-4 shrink-0">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">My Tasks</h2>
            <p className="text-textMuted text-sm mt-1">{totalCount} task{totalCount !== 1 ? 's' : ''} in total</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex p-1 bg-surface border border-border rounded-lg">
              <button
                onClick={() => setViewMode('card')}
                className={`p-2 rounded-md transition-colors ${viewMode === 'card' ? 'bg-surfaceHover text-white shadow' : 'text-textMuted hover:text-white'}`}
                title="Card View"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-md transition-colors ${viewMode === 'table' ? 'bg-surfaceHover text-white shadow' : 'text-textMuted hover:text-white'}`}
                title="Table View"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
              </button>
            </div>
            <button 
              onClick={openCreate}
              className="bg-primary hover:bg-primaryHover text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              New Task
            </button>
          </div>
        </header>

        
        <div className="flex-1 overflow-y-auto p-8 relative">
          

          
          <div className="flex flex-col lg:flex-row gap-4 mb-8">
            <div className="flex-1">
              <SearchBar value={filters.search} onChange={v => setFilter('search', v)} />
            </div>
            
            <div className="flex flex-wrap gap-3">
              <select
                className="bg-surface border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors appearance-none cursor-pointer pr-10 bg-no-repeat bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%239CA3AF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:10px_10px] bg-[position:right_1rem_center]"
                value={filters.status}
                onChange={e => setFilter('status', e.target.value)}
              >
                <option value="">All Status</option>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>

              <select
                className="bg-surface border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors appearance-none cursor-pointer pr-10 bg-no-repeat bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%239CA3AF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:10px_10px] bg-[position:right_1rem_center]"
                value={filters.priority}
                onChange={e => setFilter('priority', e.target.value)}
              >
                <option value="">All Priority</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>

              {hasFilters && (
                <button 
                  onClick={clearFilters}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium text-textMuted hover:text-white bg-surface hover:bg-surfaceHover border border-border transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  Clear
                </button>
              )}
            </div>
          </div>

          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
             <div className="bg-surface/50 border border-border p-4 rounded-2xl flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/20 text-primary flex items-center justify-center text-xl">📋</div>
                <div>
                  <div className="text-2xl font-bold">{totalCount}</div>
                  <div className="text-xs text-textMuted uppercase tracking-wider font-semibold">Total</div>
                </div>
             </div>
             <div className="bg-surface/50 border border-border p-4 rounded-2xl flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-500 flex items-center justify-center text-xl">⏱️</div>
                <div>
                  <div className="text-2xl font-bold">{count('todo')}</div>
                  <div className="text-xs text-textMuted uppercase tracking-wider font-semibold">To Do</div>
                </div>
             </div>
             <div className="bg-surface/50 border border-border p-4 rounded-2xl flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-warning/20 text-warning flex items-center justify-center text-xl">⚡</div>
                <div>
                  <div className="text-2xl font-bold">{count('in_progress')}</div>
                  <div className="text-xs text-textMuted uppercase tracking-wider font-semibold">In Progress</div>
                </div>
             </div>
             <div className="bg-surface/50 border border-border p-4 rounded-2xl flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-success/20 text-success flex items-center justify-center text-xl">🎉</div>
                <div>
                  <div className="text-2xl font-bold">{count('done')}</div>
                  <div className="text-xs text-textMuted uppercase tracking-wider font-semibold">Done</div>
                </div>
             </div>
          </div>


          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-textMuted">
              <div className="w-10 h-10 border-4 border-surfaceHover border-t-primary rounded-full animate-spin mb-4" />
              <p>Loading tasks…</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-surface/30 border border-border border-dashed rounded-3xl">
              <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center text-4xl mb-4 shadow-lg shadow-black/20">📭</div>
              <h3 className="text-xl font-bold mb-2">{hasFilters ? 'No tasks match your filters' : 'No tasks yet'}</h3>
              <p className="text-textMuted mb-6">{hasFilters ? 'Try adjusting or clearing your filters to see more results.' : 'Create your first task to get started on your journey!'}</p>
              {!hasFilters && (
                <button onClick={openCreate} className="bg-primary hover:bg-primaryHover text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-primary/20 transition-all hover:-translate-y-1">
                  + Create Your First Task
                </button>
              )}
            </div>
          ) : viewMode === 'card' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
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
            <div className="bg-surface/50 border border-border rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-surface border-b border-border uppercase tracking-wider text-xs text-textMuted font-semibold">
                    <tr>
                      <th className="px-6 py-4">Title</th>
                      <th className="px-6 py-4">Priority</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Due Date</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {tasks.map(task => (
                      <tr key={task.id} className={`hover:bg-surfaceHover/50 transition-colors ${task.status==='done'?'opacity-60':''}`}>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-textMain max-w-[300px] truncate">{task.title}</p>
                          {task.description && <p className="text-xs text-textMuted max-w-[300px] truncate mt-1">{task.description}</p>}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${
                            task.priority === 'high' ? 'bg-danger/10 text-danger border-danger/20' : 
                            task.priority === 'medium' ? 'bg-warning/10 text-warning border-warning/20' : 
                            'bg-primary/10 text-primary border-primary/20'
                          }`}>
                            {task.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={task.status}
                            onChange={e => handleStatusChange(task, e.target.value)}
                            className={`text-xs font-medium px-3 py-1.5 rounded-lg border focus:outline-none appearance-none cursor-pointer pr-8 bg-no-repeat bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%239CA3AF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:10px_10px] bg-[position:right_10px_center] ${
                              task.status === 'todo' ? 'bg-primary/10 text-primary border-primary/30' :
                              task.status === 'in_progress' ? 'bg-warning/10 text-warning border-warning/30' :
                              'bg-success/10 text-success border-success/30'
                            }`}
                          >
                            <option value="todo" className="bg-surface text-textMain">To Do</option>
                            <option value="in_progress" className="bg-surface text-textMain">In Progress</option>
                            <option value="done" className="bg-surface text-textMain">Done</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 text-textMuted">
                          {task.due_date ? new Date(task.due_date).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' }) : '—'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => openEdit(task)} className="p-2 text-textMuted hover:text-white hover:bg-surface rounded-lg transition-colors" title="Edit">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                            </button>
                            <button onClick={() => handleDelete(task.id)} className="p-2 text-textMuted hover:text-danger hover:bg-danger/10 rounded-lg transition-colors" title="Delete">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

       
          {totalPages > 1 && (
            <div className="mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      </main>

      {showForm && (
        <TaskForm
          task={editTask}
          onSave={afterSave}
          onClose={closeForm}
        />
      )}

      <AIChatBubble />
    </div>
  );
}
