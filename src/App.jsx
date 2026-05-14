import { useState, useEffect, useCallback } from 'react'
import TaskForm from './components/TaskForm'
import TaskList from './components/TaskList'
import './index.css'

// Ключ для localStorage — под этим именем храним задачи
const STORAGE_KEY = 'reminder-tasks'

function App() {
  // Загружаем задачи из localStorage при старте
  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  const [filter, setFilter] = useState('all') // текущий фильтр

  // Сохраняем задачи в localStorage каждый раз когда они меняются
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  }, [tasks])

  // Запрашиваем разрешение на уведомления при загрузке
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  // Проверяем время задач каждые 30 секунд
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()

      setTasks((prev) =>
        prev.map((task) => {
          // Пропускаем выполненные и уже уведомлённые
          if (task.completed || task.notified || !task.datetime) return task

          const taskTime = new Date(task.datetime)
          const diffMs = taskTime - now

          // Если время пришло (в пределах 1 минуты)
          if (diffMs <= 0 && diffMs > -60000) {
            sendNotification(task.title)
            return { ...task, notified: true }
          }

          return task
        })
      )
    }, 30000) // каждые 30 секунд

    return () => clearInterval(interval) // очищаем при размонтировании
  }, [])

  // Отправляем браузерное уведомление
  function sendNotification(title) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('⏰ Напоминание!', {
        body: title,
        icon: '/favicon.ico',
      })
    }
  }

  // Добавляем новую задачу
  function handleAddTask(newTask) {
    setTasks((prev) => [newTask, ...prev]) // добавляем в начало списка
  }

  // Переключаем выполнение задачи
  function handleToggle(id) {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    )
  }

  // Удаляем задачу
  function handleDelete(id) {
    setTasks((prev) => prev.filter((task) => task.id !== id))
  }

  // Считаем активные задачи для счётчика
  const activeCount = tasks.filter((t) => !t.completed).length

  return (
    <div className="app">
      {/* Заголовок */}
      <header className="app-header">
        <h1>📋 Мои задачи</h1>
        <p>Простой и удобный планировщик</p>
      </header>

      {/* Форма добавления */}
      <TaskForm onAddTask={handleAddTask} />

      {/* Счётчик и фильтры */}
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

      {/* Список задач */}
      <TaskList
        tasks={tasks}
        filter={filter}
        onToggle={handleToggle}
        onDelete={handleDelete}
      />
    </div>
  )
}

export default App