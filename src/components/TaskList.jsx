import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import TaskItem from './TaskItem'

// Возвращает строку-ключ группы для задачи: 'YYYY-MM-DD' или 'no-date'
function getGroupKey(task) {
  if (!task.datetime) return 'no-date'
  return task.datetime.slice(0, 10) // 'YYYY-MM-DD'
}

// Человекочитаемый заголовок группы
function getGroupLabel(key) {
  if (key === 'no-date') return '📌 Без даты'

  const today = new Date()
  const tomorrow = new Date()
  tomorrow.setDate(today.getDate() + 1)
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)

  const fmt = (d) => d.toISOString().slice(0, 10)

  if (key === fmt(today)) return '📅 Сегодня'
  if (key === fmt(tomorrow)) return '🔜 Завтра'
  if (key === fmt(yesterday)) return '🕐 Вчера'

  // Для остальных дат — читаемый формат
  const [year, month, day] = key.split('-')
  return new Date(year, month - 1, day).toLocaleDateString('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

function TaskList({ tasks, filter, onToggle, onDelete, onReorder }) {
  // Фильтрация
  const filtered = tasks.filter((task) => {
    if (filter === 'active') return !task.completed
    if (filter === 'completed') return task.completed
    return true
  })

  if (filtered.length === 0) {
    return (
      <div className="empty-state">
        <div className="emoji">{filter === 'completed' ? '🎉' : '📝'}</div>
        <p>
          {filter === 'completed'
            ? 'Выполненных задач пока нет'
            : 'Задач пока нет. Добавь первую!'}
        </p>
      </div>
    )
  }

  // Группируем задачи по дате, сохраняя порядок появления групп
  const groupOrder = []
  const groups = {}
  for (const task of filtered) {
    const key = getGroupKey(task)
    if (!groups[key]) {
      groups[key] = []
      groupOrder.push(key)
    }
    groups[key].push(task)
  }

  function handleDragEnd(result) {
    if (!result.destination) return
    if (result.source.index === result.destination.index) return

    const groupKey = result.source.droppableId
    const groupTasks = [...groups[groupKey]]
    const [moved] = groupTasks.splice(result.source.index, 1)
    groupTasks.splice(result.destination.index, 0, moved)

    onReorder(groupTasks.map((t) => t.id))
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="task-list">
        {groupOrder.map((key) => (
          <div key={key} className="task-group">
            <h3 className="task-group-label">{getGroupLabel(key)}</h3>

            <Droppable droppableId={key}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`task-group-list ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
                >
                  {groups[key].map((task, index) => (
                    <Draggable
                      key={task.id}
                      draggableId={String(task.id)}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`draggable-task ${snapshot.isDragging ? 'is-dragging' : ''}`}
                        >
                          {/* Иконка-ручка для перетаскивания */}
                          <span
                            className="drag-handle"
                            {...provided.dragHandleProps}
                            title="Перетащить"
                            aria-label="Перетащить задачу"
                          >
                            ⠿
                          </span>
                          <TaskItem
                            task={task}
                            onToggle={onToggle}
                            onDelete={onDelete}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  )
}

export default TaskList