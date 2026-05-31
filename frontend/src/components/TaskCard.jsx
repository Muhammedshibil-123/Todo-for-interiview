export default function TaskCard({ task, onEdit, onDelete, onStatusChange }) {
  const isOverdue =
    task.due_date &&
    task.status !== 'done' &&
    new Date(task.due_date) < new Date();

  return (
    <div className={`task-card ${task.status === 'done' ? 'is-done' : ''}`}>

      {/* Coloured top stripe based on priority */}
      <div className={`card-stripe ${task.priority}`}></div>

      <div className="card-body">

        {/* Title + action buttons */}
        <div className="card-header">
          <h3 className={`card-title ${task.status === 'done' ? 'done' : ''}`}>
            {task.title}
          </h3>
          <div className="card-actions">
            <button
              id={`edit-${task.id}`}
              className="btn-icon edit"
              onClick={() => onEdit(task)}
              title="Edit task"
            >✏️</button>
            <button
              id={`delete-${task.id}`}
              className="btn-icon delete"
              onClick={() => onDelete(task.id)}
              title="Delete task"
            >🗑️</button>
          </div>
        </div>

        {/* Description */}
        {task.description && (
          <p className="card-desc">{task.description}</p>
        )}

        {/* Footer: due date + priority pill + status dropdown */}
        <div className="card-footer">
          <div style={{ display:'flex', flexDirection:'column', gap:'.3rem' }}>
            <span className={`pill p-${task.priority}`}>
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
            </span>
            {task.due_date && (
              <span className={`due-tag ${isOverdue ? 'overdue' : ''}`}>
                📅{' '}
                {new Date(task.due_date).toLocaleDateString('en-GB', {
                  day: '2-digit', month: 'short', year: 'numeric',
                })}
                {isOverdue && ' · Overdue'}
              </span>
            )}
          </div>

          <select
            id={`status-${task.id}`}
            className={`status-sel ${task.status}`}
            value={task.status}
            onChange={e => onStatusChange(task, e.target.value)}
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
