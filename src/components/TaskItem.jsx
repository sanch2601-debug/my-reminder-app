// Форматируем дату для отображения
function formatDatetime(datetimeStr) {
  if (!datetimeStr) return null

  const date = new Date(datetimeStr)
  const now = new Date()

  // Разница в минутах
  const diffMs = date - now
  const diffMin = Math.round(diffMs / 60000)

  // Форматируем дату красиво
  const formatted = date.toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })

  // Определяем статус времени
  if (diffMs < 0) {
    return { text: `⏰ ${formatted}`, status: 'overdue' }
  } else if (diffMin <= 60) {
    return { text: `⚡ Через ${diffMin} мин`, status: 'upcoming' }
  } else {
    return { text: `📅 ${formatted}`, status: '' }
  }
}

function TaskItem({ task, onToggle, onDelete }) {
  const dateInfo = formatDatetime(task.datetime)

  return (
    <div
      className={`task-item ${task.completed ? 'completed' : ''} ${
        dateInfo?.status || ''
      }`}
    >
      {/* Чекбокс — нажимаем чтобы отметить выполненным */}
      <div
        className={`checkbox ${task.completed ? 'checked' : ''}`}
        onClick={() => onToggle(task.id)}
        role="checkbox"
        aria-checked={task.completed}
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onToggle(task.id)}
      >
        {task.completed && '✓'}
      </div>

      {/* Текст задачи и дата */}
      <div className="task-content">
        <div className="task-title">{task.title}</div>
        {dateInfo && (
          <div className={`task-datetime ${dateInfo.status}`}>
            {dateInfo.text}
          </div>
        )}
      </div>

      {/* Кнопка удаления */}
      <button
        className="btn-delete"
        onClick={() => onDelete(task.id)}
        title="Удалить задачу"
        aria-label="Удалить задачу"
      >
        ✕
      </button>
    </div>
  )
}

export default TaskItem