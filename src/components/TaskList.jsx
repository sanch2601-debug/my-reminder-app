import TaskItem from './TaskItem'

function TaskList({ tasks, filter, onToggle, onDelete }) {
  const filtered = tasks.filter((task) => {
    if (filter === 'active') return !task.completed
    if (filter === 'completed') return task.completed
    return true
  })

  if (filtered.length === 0) {
    return (
      <div className="empty-state">
        <div className="emoji">
          {filter === 'completed' ? '🎉' : '📝'}
        </div>
        <p>
          {filter === 'completed'
            ? 'Выполненных задач пока нет'
            : 'Задач пока нет. Добавь первую!'}
        </p>
      </div>
    )
  }

  return (
    <div className="task-list">
      {filtered.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}

export default TaskList