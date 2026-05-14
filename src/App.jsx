import { useState, useEffect } from 'react'
import TaskForm from './components/TaskForm'
import TaskList from './components/TaskList'
import './index.css'

const STORAGE_KEY = 'reminder-tasks'

function App() {
  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  const [filter, setFilter] = useState('all')

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  }, [tasks])

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      setTasks((prev) =>
        prev.map((task) => {
          if (task.completed || task.notified || !task.datetime) return task
          const taskTime = new Date(task.datetime)
          const diffMs = taskTime - now
          if (diffMs <= 0 && diffMs > -60000) {
            sendNotification(task.title)
            return { ...task, notified: true }
          }
          return task
        })
      )
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  function sendNotification(title) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('⏰ Напоминание!', { body: title, icon: '/favicon.ico' })
    }
  }

  function handleAddTask(newTask) {
    setTasks((prev) => [newTask, ...prev])
  }

  function handleToggle(id) {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    )
  }

  function handleDelete(id) {
    setTasks((prev) => prev.filter((task) => task.id !== id))
  }

  // Перестановка задач внутри одной группы (дня)
  // groupIds — упорядоченный массив id задач после перетаскивания
  function handleReorder(groupIds) {
    setTasks((prev) => {
      // Задачи не из этой группы — оставляем как есть, сохраняя их позиции
      const groupSet = new Set(groupIds)
      const otherTasks = prev.filter((t) => !groupSet.has(t.id))
      const groupTasks = groupIds.map((id) => prev.find((t) => t.id === id))

      // Вставляем переупорядоченную группу на место первого её элемента в общем массиве
      const firstIndex = prev.findIndex((t) => groupSet.has(t.id))
      const result = [...otherTasks]
      result.splice(firstIndex, 0, ...groupTasks)
      return result
    })
  }

  const activeCount = tasks.filter((t) => !t.completed).length

  return (
    <div className="app">
      <header className="app-header">
        <h1>📋 Мои задачи</h1>
        <p>Простой и удобный планировщик</p>
      </header>

      <TaskForm onAddTask={handleAddTask} />

      {tasks.length > 0 && (
        <>
          <p className="tasks-count">
            {activeCount === 0
              ? 'Все задачи выполнены 🎉'
              : `Активных задач: ${activeCount}`}
          </p>

          <div className="filters">
            {[
              { key: 'all', label: 'Все' },
              { key: 'active', label: 'Активные' },
              { key: 'completed', label: 'Выполненные' },
            ].map(({ key, label }) => (
              <button
                key={key}
                className={`filter-btn ${filter === key ? 'active' : ''}`}
                onClick={() => setFilter(key)}
              >
                {label}
              </button>
            ))}
          </div>
        </>
      )}

      <TaskList
        tasks={tasks}
        filter={filter}
        onToggle={handleToggle}
        onDelete={handleDelete}
        onReorder={handleReorder}
      />
    </div>
  )
}

export default App