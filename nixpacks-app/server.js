const express = require('express');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

// PostgreSQL connection using environment variables from Coolify
let poolConfig;

if (process.env.DATABASE_URL) {
    // Trim whitespace from DATABASE_URL (Coolify sometimes adds newlines)
    const dbUrl = process.env.DATABASE_URL.trim();
    poolConfig = {
        connectionString: dbUrl,
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
    };
    console.log('✅ Using DATABASE_URL connection string');
} else {
    // Fallback to individual variables
    poolConfig = {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME || 'postgres',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD,
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
    };
    console.log('✅ Using individual DB environment variables');
}

const pool = new Pool(poolConfig);

app.use(express.json());

// Initialize database table
async function initDB() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS tasks (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                completed BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Database initialized');
    } catch (err) {
        console.error('❌ Database initialization error:', err.message);
    }
}

// Home page
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Nixpacks App - Database Demo</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    background: linear-gradient(135deg, #ff6b6b 0%, #feca57 100%);
                    min-height: 100vh;
                    padding: 2rem;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    background: white;
                    padding: 2rem;
                    border-radius: 20px;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                }
                h1 { color: #333; margin-bottom: 0.5rem; text-align: center; }
                .subtitle { color: #666; text-align: center; margin-bottom: 2rem; }
                .badge {
                    display: inline-block;
                    background: #ff6b6b;
                    color: white;
                    padding: 0.3rem 0.8rem;
                    border-radius: 20px;
                    font-size: 0.8rem;
                }
                .form-group { margin-bottom: 1rem; }
                input[type="text"] {
                    width: 100%;
                    padding: 0.8rem;
                    border: 2px solid #eee;
                    border-radius: 10px;
                    font-size: 1rem;
                }
                button {
                    background: #ff6b6b;
                    color: white;
                    border: none;
                    padding: 0.8rem 1.5rem;
                    border-radius: 10px;
                    cursor: pointer;
                    font-size: 1rem;
                    width: 100%;
                }
                button:hover { background: #ee5a5a; }
                .tasks { margin-top: 2rem; }
                .task {
                    display: flex;
                    align-items: center;
                    padding: 1rem;
                    background: #f8f9fa;
                    border-radius: 10px;
                    margin-bottom: 0.5rem;
                }
                .task.completed { opacity: 0.6; text-decoration: line-through; }
                .task-title { flex: 1; }
                .task-actions button {
                    width: auto;
                    padding: 0.5rem 1rem;
                    margin-left: 0.5rem;
                    font-size: 0.8rem;
                }
                .task-actions .complete { background: #10ac84; }
                .task-actions .delete { background: #ee5a5a; }
                .status { padding: 1rem; border-radius: 10px; margin-bottom: 1rem; text-align: center; }
                .status.connected { background: #d4edda; color: #155724; }
                .status.disconnected { background: #f8d7da; color: #721c24; }
                .api-info { margin-top: 2rem; padding: 1rem; background: #f8f9fa; border-radius: 10px; }
                .api-info h3 { margin-bottom: 0.5rem; }
                .api-info code { background: #eee; padding: 0.2rem 0.5rem; border-radius: 5px; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>📦 Nixpacks App</h1>
                <p class="subtitle">Node.js + PostgreSQL <span class="badge">Nixpacks</span></p>
                
                <div id="status" class="status">Checking database connection...</div>
                
                <div class="form-group">
                    <input type="text" id="taskInput" placeholder="Enter a new task...">
                </div>
                <button onclick="addTask()">Add Task</button>
                
                <div class="tasks" id="taskList"></div>
                
                <div class="api-info">
                    <h3>API Endpoints</h3>
                    <p><code>GET /api/tasks</code> - List all tasks</p>
                    <p><code>POST /api/tasks</code> - Create task</p>
                    <p><code>PUT /api/tasks/:id</code> - Toggle complete</p>
                    <p><code>DELETE /api/tasks/:id</code> - Delete task</p>
                    <p><code>GET /api/health</code> - Health check</p>
                </div>
            </div>
            
            <script>
                async function checkHealth() {
                    try {
                        const res = await fetch('/api/health');
                        const data = await res.json();
                        const statusEl = document.getElementById('status');
                        if (data.database === 'connected') {
                            statusEl.className = 'status connected';
                            statusEl.textContent = '✅ Connected to PostgreSQL database';
                        } else {
                            statusEl.className = 'status disconnected';
                            statusEl.textContent = '❌ Database not connected';
                        }
                    } catch (e) {
                        document.getElementById('status').className = 'status disconnected';
                        document.getElementById('status').textContent = '❌ Error checking connection';
                    }
                }
                
                async function loadTasks() {
                    try {
                        const res = await fetch('/api/tasks');
                        const tasks = await res.json();
                        const list = document.getElementById('taskList');
                        list.innerHTML = tasks.map(t => \`
                            <div class="task \${t.completed ? 'completed' : ''}">
                                <span class="task-title">\${t.title}</span>
                                <div class="task-actions">
                                    <button class="complete" onclick="toggleTask(\${t.id})">✓</button>
                                    <button class="delete" onclick="deleteTask(\${t.id})">✕</button>
                                </div>
                            </div>
                        \`).join('');
                    } catch (e) {
                        console.error('Error loading tasks:', e);
                    }
                }
                
                async function addTask() {
                    const input = document.getElementById('taskInput');
                    if (!input.value.trim()) return;
                    await fetch('/api/tasks', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ title: input.value })
                    });
                    input.value = '';
                    loadTasks();
                }
                
                async function toggleTask(id) {
                    await fetch(\`/api/tasks/\${id}\`, { method: 'PUT' });
                    loadTasks();
                }
                
                async function deleteTask(id) {
                    await fetch(\`/api/tasks/\${id}\`, { method: 'DELETE' });
                    loadTasks();
                }
                
                document.getElementById('taskInput').addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') addTask();
                });
                
                checkHealth();
                loadTasks();
            </script>
        </body>
        </html>
    `);
});

// API Routes
app.get('/api/tasks', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM tasks ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/tasks', async (req, res) => {
    try {
        const { title } = req.body;
        const result = await pool.query(
            'INSERT INTO tasks (title) VALUES ($1) RETURNING *',
            [title]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/tasks/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            'UPDATE tasks SET completed = NOT completed WHERE id = $1 RETURNING *',
            [id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/tasks/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/health', async (req, res) => {
    try {
        await pool.query('SELECT 1');
        res.json({ 
            status: 'healthy', 
            database: 'connected',
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        res.json({ 
            status: 'unhealthy', 
            database: 'disconnected',
            error: err.message 
        });
    }
});

// Start server
app.listen(PORT, async () => {
    console.log(`🚀 Server running on port ${PORT}`);
    await initDB();
});
