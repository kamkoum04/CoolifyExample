import { useState, useEffect } from 'react'

const API_URL = '/api'

function App() {
  const [tasks, setTasks] = useState([])
  const [newTask, setNewTask] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [backendStatus, setBackendStatus] = useState('loading')

  // Check backend health and load tasks
  useEffect(() => {
    checkBackendHealth()
    fetchTasks()
  }, [])

  const checkBackendHealth = async () => {
    try {
      const res = await fetch(`${API_URL}/health`)
      if (res.ok) {
        setBackendStatus('connected')
      } else {
        setBackendStatus('disconnected')
      }
    } catch (err) {
      setBackendStatus('disconnected')
    }
  }

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_URL}/tasks`)
      if (!res.ok) throw new Error('Failed to fetch tasks')
      const data = await res.json()
      setTasks(data)
      setError(null)
      setBackendStatus('connected')
    } catch (err) {
      setError('Failed to connect to backend API')
      setBackendStatus('disconnected')
    } finally {
      setLoading(false)
    }
  }

  const addTask = async () => {
    if (!newTask.trim()) return

    try {
      const res = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTask.trim() })
      })
      
      if (!res.ok) throw new Error('Failed to add task')
      
      const task = await res.json()
      setTasks([task, ...tasks])
      setNewTask('')
      setError(null)
    } catch (err) {
      setError('Failed to add task')
    }
  }

  const toggleTask = async (id) => {
    const task = tasks.find(t => t.id === id)
    if (!task) return

    try {
      const res = await fetch(`${API_URL}/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !task.completed })
      })
      
      if (!res.ok) throw new Error('Failed to update task')
      
      const updatedTask = await res.json()
      setTasks(tasks.map(t => t.id === id ? updatedTask : t))
      setError(null)
    } catch (err) {
      setError('Failed to update task')
    }
  }

  const deleteTask = async (id) => {
    try {
      const res = await fetch(`${API_URL}/tasks/${id}`, {
        method: 'DELETE'
      })
      
      if (!res.ok) throw new Error('Failed to delete task')
      
      setTasks(tasks.filter(t => t.id !== id))
      setError(null)
    } catch (err) {
      setError('Failed to delete task')
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') addTask()
  }

  const completedCount = tasks.filter(t => t.completed).length
  const pendingCount = tasks.filter(t => !t.completed).length

  return (
    <div className="container">
      <header className="header">
        <h1>📋 Task Board</h1>
        <span className="badge">Stage 2: Frontend + Backend API</span>
      </header>

      <div className="task-board">
        <div className={`connection-status ${backendStatus}`}>
          <span className="status-dot"></span>
          {backendStatus === 'connected' && 'Connected to Backend API'}
          {backendStatus === 'disconnected' && 'Backend API Disconnected'}
          {backendStatus === 'loading' && 'Connecting to Backend...'}
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="add-task">
          <input
            type="text"
            placeholder="Add a new task..."
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={backendStatus !== 'connected'}
          />
          <button onClick={addTask} disabled={backendStatus !== 'connected'}>
            Add Task
          </button>
        </div>

        {loading ? (
          <div className="empty-state">
            <span>⏳</span>
            <p>Loading tasks...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="empty-state">
            <span>📝</span>
            <p>No tasks yet. Add your first task above!</p>
          </div>
        ) : (
          <ul className="task-list">
            {tasks.map(task => (
              <li key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
                <input
                  type="checkbox"
                  className="task-checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(task.id)}
                />
                <span className="task-title">{task.title}</span>
                <button className="task-delete" onClick={() => deleteTask(task.id)}>
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}

        {tasks.length > 0 && (
          <div className="stats">
            <div className="stat">
              <div className="stat-value">{tasks.length}</div>
              <div className="stat-label">Total</div>
            </div>
            <div className="stat">
              <div className="stat-value">{pendingCount}</div>
              <div className="stat-label">Pending</div>
            </div>
            <div className="stat">
              <div className="stat-value">{completedCount}</div>
              <div className="stat-label">Completed</div>
            </div>
          </div>
        )}

        <div className="api-info">
          🔗 REST API: GET, POST, PATCH, DELETE /api/tasks
        </div>
      </div>
    </div>
  )
}

export default App
