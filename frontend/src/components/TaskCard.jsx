// TaskCard component — displays a single task in card format
export default function TaskCard({ task, onEdit, onDelete, onStatusChange }) {
  const priorityColors = {
    high: 'priority-high',
    medium: 'priority-medium',
    low: 'priority-low',
  };

  const statusLabels = {
    todo: 'To Do',
    in_progress: 'In Progress',
    done: 'Done',
  };

  const isOverdue =
    task.due_date &&
    task.status !== 'done' &&
    new Date(task.due_date) < new Date();

  return (
    <div className={`task-card ${task.status === 'done' ? 'card-done' : ''}`}>
      {/* Priority ribbon */}
      <div className={`priority-bar ${priorityColors[task.priority]}`}></div>

      <div className="card-body">
        {/* Top row */}
        <div className="card-top">
          <span className={`badge-priority ${priorityColors[task.priority]}`}>
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
          </span>
          <div className="card-actions">
            <button
              id={`edit-task-${task.id}`}
              className="btn-icon edit"
              onClick={() => onEdit(task)}
              title="Edit"
            >✏️</button>
            <button
              id={`delete-task-${task.id}`}
              className="btn-icon delete"
              onClick={() => onDelete(task.id)}
              title="Delete"
            >🗑️</button>
          </div>
        </div>

        {/* Title & description */}
        <h3 className={`card-title ${task.status === 'done' ? 'done-text' : ''}`}>
          {task.title}
        </h3>
        {task.description && (
          <p className="card-desc">{task.description}</p>
        )}

        {/* Footer */}
        <div className="card-footer">
          <div className="card-meta">
            {task.due_date && (
              <span className={`due-date ${isOverdue ? 'overdue' : ''}`}>
                📅 {new Date(task.due_date).toLocaleDateString()}
                {isOverdue && ' · Overdue'}
              </span>
            )}
          </div>
          <select
            id={`status-task-${task.id}`}
            className={`status-select status-${task.status}`}
            value={task.status}
            onChange={(e) => onStatusChange(task, e.target.value)}
          >
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>
      </div>
    </div>
  );
}
