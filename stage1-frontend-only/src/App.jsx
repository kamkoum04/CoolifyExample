import { useState, useEffect } from 'react'

function App() {
  const [tasks, setTasks] = useState([])
  const [newTask, setNewTask] = useState('')

  // Load tasks from LocalStorage on mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('taskboard-tasks')
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks))
    }
  }, [])

  // Save tasks to LocalStorage whenever they change
  useEffect(() => {
    localStorage.setItem('taskboard-tasks', JSON.stringify(tasks))
  }, [tasks])

  const addTask = () => {
    if (!newTask.trim()) return
    
    const task = {
      id: Date.now(),
      title: newTask.trim(),
      completed: false,
      createdAt: new Date().toISOString()
    }
    
    setTasks([task, ...tasks])
    setNewTask('')
  }

  const toggleTask = (id) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ))
  }

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id))
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
        <span className="badge">Stage 1: Frontend Only (LocalStorage)</span>
      </header>

      <div className="task-board">
        <div className="add-task">
          <input
            type="text"
            placeholder="Add a new task..."
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button onClick={addTask}>Add Task</button>
        </div>

        {tasks.length === 0 ? (
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

        <div className="storage-info">
          💾 Data stored in browser's LocalStorage
        </div>
      </div>
    </div>
  )
}

export default App
