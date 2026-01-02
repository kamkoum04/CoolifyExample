from flask import Flask, jsonify
import os
from datetime import datetime

app = Flask(__name__)

@app.route('/')
def home():
    return '''
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Dockerfile App - Coolify Demo</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
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
                background: #f5576c;
                color: white;
                padding: 0.5rem 1rem;
                border-radius: 20px;
                font-size: 0.9rem;
                margin-top: 1rem;
            }
            code {
                background: #f4f4f4;
                padding: 0.2rem 0.5rem;
                border-radius: 5px;
                font-family: monospace;
            }
            .api-link {
                display: block;
                margin-top: 1.5rem;
                color: #f5576c;
                text-decoration: none;
            }
            .api-link:hover { text-decoration: underline; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🐳 Dockerfile App</h1>
            <p>This Python Flask application is deployed using a <strong>custom Dockerfile</strong>.</p>
            <p>Using: <code>python:3.11-slim</code> base image</p>
            <span class="badge">Custom Dockerfile</span>
            <a href="/api/info" class="api-link">Check API Endpoint →</a>
        </div>
    </body>
    </html>
    '''

@app.route('/api/info')
def info():
    return jsonify({
        'app': 'Python Flask App',
        'buildPack': 'Dockerfile',
        'pythonVersion': '3.11',
        'framework': 'Flask',
        'timestamp': datetime.now().isoformat(),
        'message': 'Hello from Coolify with Dockerfile! 🐳'
    })

@app.route('/api/health')
def health():
    return jsonify({'status': 'healthy'})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
