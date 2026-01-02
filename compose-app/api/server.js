const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: 'API Service is running!' });
});

app.get('/info', (req, res) => {
    res.json({
        app: 'Docker Compose Multi-Service App',
        buildPack: 'Docker Compose',
        services: ['web (Nginx)', 'api (Node.js)'],
        nodeVersion: process.version,
        timestamp: new Date().toISOString(),
        message: 'Hello from the API service! 🐙'
    });
});

app.get('/health', (req, res) => {
    res.json({ status: 'healthy', service: 'api', uptime: process.uptime() });
});

app.listen(PORT, () => {
    console.log(`🚀 API service running on port ${PORT}`);
});
