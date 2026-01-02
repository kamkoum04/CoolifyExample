const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Routes
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Node.js App - Coolify Demo</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
                    min-height: 100vh;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
                .container {
                    background: white;
                    padding: 3rem;
                    border-radius: 20px;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                    text-align: center;
                    max-width: 500px;
                }
                h1 { color: #333; margin-bottom: 1rem; font-size: 2.5rem; }
                p { color: #666; line-height: 1.6; margin-bottom: 1rem; }
                .badge {
                    display: inline-block;
                    background: #11998e;
                    color: white;
                    padding: 0.5rem 1rem;
                    border-radius: 20px;
                    font-size: 0.9rem;
                    margin-top: 1rem;
                }
                .api-link {
                    display: block;
                    margin-top: 1.5rem;
                    color: #11998e;
                    text-decoration: none;
                }
                .api-link:hover { text-decoration: underline; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>⚡ Node.js App</h1>
                <p>This Express.js application is deployed on Coolify using <strong>Nixpacks</strong> build pack.</p>
                <p>Nixpacks automatically detects Node.js and builds the container.</p>
                <span class="badge">Nixpacks Auto-Detection</span>
                <a href="/api/info" class="api-link">Check API Endpoint →</a>
            </div>
        </body>
        </html>
    `);
});

app.get('/api/info', (req, res) => {
    res.json({
        app: 'Node.js Express App',
        buildPack: 'Nixpacks',
        nodeVersion: process.version,
        timestamp: new Date().toISOString(),
        message: 'Hello from Coolify! 🚀'
    });
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'healthy', uptime: process.uptime() });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
