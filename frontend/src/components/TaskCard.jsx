export default function TaskCard({ task, onEdit, onDelete, onStatusChange }) {
  const isOverdue =
    task.due_date &&
    task.status !== 'done' &&
    new Date(task.due_date) < new Date();

  return (
    <div className={`relative flex flex-col bg-surface/80 backdrop-blur-xl border border-border rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/10 ${task.status === 'done' ? 'opacity-70 grayscale-[20%]' : ''}`}>
      
      {/* Priority Stripe */}
      <div className={`h-1.5 w-full ${task.priority === 'high' ? 'bg-danger' : task.priority === 'medium' ? 'bg-warning' : 'bg-primary'}`} />

      <div className="p-5 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-start mb-3 gap-4">
          <h3 className={`text-lg font-semibold text-textMain leading-tight ${task.status === 'done' ? 'line-through text-textMuted' : ''}`}>
            {task.title}
          </h3>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => onEdit(task)}
              className="p-1.5 text-textMuted hover:text-white hover:bg-surfaceHover rounded-lg transition-colors"
              title="Edit task"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
            </button>
            <button
              onClick={() => onDelete(task.id)}
              className="p-1.5 text-textMuted hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
              title="Delete task"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          </div>
        </div>

        {/* Description */}
        {task.description && (
          <p className="text-textMuted text-sm mb-4 line-clamp-2 flex-1">
            {task.description}
          </p>
        )}
        
        {/* Spacer if no description */}
        {!task.description && <div className="flex-1" />}

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-border flex items-end justify-between gap-2">
          
          <div className="flex flex-col gap-2">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium w-fit ${
              task.priority === 'high' ? 'bg-danger/10 text-danger border border-danger/20' : 
              task.priority === 'medium' ? 'bg-warning/10 text-warning border border-warning/20' : 
              'bg-primary/10 text-primary border border-primary/20'
            }`}>
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
            </span>

            {task.due_date && (
              <span className={`text-xs flex items-center gap-1 ${isOverdue ? 'text-danger font-medium' : 'text-textMuted'}`}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                {new Date(task.due_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                {isOverdue && ' (Overdue)'}
              </span>
            )}
          </div>

          <select
            value={task.status}
            onChange={e => onStatusChange(task, e.target.value)}
            className={`text-xs font-medium px-2 py-1.5 rounded-lg border focus:outline-none appearance-none cursor-pointer pr-6 bg-no-repeat bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%239CA3AF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:8px_8px] bg-[position:right_8px_center] ${
              task.status === 'todo' ? 'bg-primary/10 text-primary border-primary/30' :
              task.status === 'in_progress' ? 'bg-warning/10 text-warning border-warning/30' :
              'bg-success/10 text-success border-success/30'
            }`}
          >
            <option value="todo" className="text-textMain bg-surface">To Do</option>
            <option value="in_progress" className="text-textMain bg-surface">In Progress</option>
            <option value="done" className="text-textMain bg-surface">Done</option>
          </select>
        </div>
      </div>
    </div>
  );
}
