import { useState } from 'react'

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition

function TaskForm({ onAddTask }) {
  const [title, setTitle] = useState('')
  const [datetime, setDatetime] = useState('')
  const [isRecording, setIsRecording] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()

    const trimmed = title.trim()
    if (!trimmed) return

    const newTask = {
      id: Date.now(),
      title: trimmed,
      datetime: datetime || null,
      completed: false,
      createdAt: new Date().toISOString(),
      notified: false,
    }

    onAddTask(newTask)
    setTitle('')
    setDatetime('')
  }

  function handleVoice() {
    if (!SpeechRecognition) {
      alert('Твой браузер не поддерживает голосовой ввод. Попробуй Chrome.')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = 'ru-RU'
    recognition.interimResults = false

    recognition.onstart = () => setIsRecording(true)
    recognition.onend = () => setIsRecording(false)

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript
      setTitle(prev => prev ? prev + ' ' + text : text)
    }

    recognition.onerror = (event) => {
      console.error('Ошибка голосового ввода:', event.error)
      setIsRecording(false)
      if (event.error === 'not-allowed') {
        alert('Разреши доступ к микрофону в браузере')
      }
    }

    recognition.start()
  }

  return (
    <div className="task-form">
      <h2>➕ Новая задача</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <input
            className="input-text"
            type="text"
            placeholder="Что нужно сделать?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          {SpeechRecognition && (
            <button
              type="button"
              className={`btn btn-mic ${isRecording ? 'recording' : ''}`}
              onClick={handleVoice}
              title="Голосовой ввод"
            >
              {isRecording ? '⏹' : '🎤'}
            </button>
          )}
        </div>

        <input
          className="input-datetime"
          type="datetime-local"
          value={datetime}
          onChange={(e) => setDatetime(e.target.value)}
        />

        <button type="submit" className="btn btn-primary">
          Добавить задачу
        </button>
      </form>
    </div>
  )
}

export default TaskForm