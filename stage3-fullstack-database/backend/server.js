const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes

// GET all tasks
app.get('/api/tasks', async (req, res) => {
    try {
        const tasks = await prisma.task.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(tasks);
    } catch (err) {
        console.error('Error fetching tasks:', err);
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
});

// GET single task
app.get('/api/tasks/:id', async (req, res) => {
    try {
        const task = await prisma.task.findUnique({
            where: { id: parseInt(req.params.id) }
        });
        
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }
        
        res.json(task);
    } catch (err) {
        console.error('Error fetching task:', err);
        res.status(500).json({ error: 'Failed to fetch task' });
    }
});

// POST new task
app.post('/api/tasks', async (req, res) => {
    try {
        const { title } = req.body;
        
        if (!title || !title.trim()) {
            return res.status(400).json({ error: 'Title is required' });
        }
        
        const task = await prisma.task.create({
            data: { title: title.trim() }
        });
        
        res.status(201).json(task);
    } catch (err) {
        console.error('Error creating task:', err);
        res.status(500).json({ error: 'Failed to create task' });
    }
});

// PATCH update task
app.patch('/api/tasks/:id', async (req, res) => {
    try {
        const { title, completed } = req.body;
        const data = {};
        
        if (title !== undefined) data.title = title.trim();
        if (completed !== undefined) data.completed = completed;
        
        const task = await prisma.task.update({
            where: { id: parseInt(req.params.id) },
            data
        });
        
        res.json(task);
    } catch (err) {
        if (err.code === 'P2025') {
            return res.status(404).json({ error: 'Task not found' });
        }
        console.error('Error updating task:', err);
        res.status(500).json({ error: 'Failed to update task' });
    }
});

// DELETE task
app.delete('/api/tasks/:id', async (req, res) => {
    try {
        const task = await prisma.task.delete({
            where: { id: parseInt(req.params.id) }
        });
        
        res.json({ message: 'Task deleted', task });
    } catch (err) {
        if (err.code === 'P2025') {
            return res.status(404).json({ error: 'Task not found' });
        }
        console.error('Error deleting task:', err);
        res.status(500).json({ error: 'Failed to delete task' });
    }
});

// Health check
app.get('/api/health', async (req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        res.json({ 
            status: 'healthy',
            service: 'backend',
            database: 'connected',
            orm: 'Prisma',
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        res.json({ 
            status: 'unhealthy',
            service: 'backend',
            database: 'disconnected',
            error: err.message
        });
    }
});

// Graceful shutdown
process.on('beforeExit', async () => {
    await prisma.$disconnect();
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Backend API running on port ${PORT}`);
    console.log(`🗄️  Connected to PostgreSQL via Prisma`);
});
