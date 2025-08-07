import express from 'express';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// Serve the ultimate setup script
router.get('/download', (req, res) => {
  const setupScript = `#!/bin/bash

# 🚀 Multi-Agent Dashboard Ultimate Setup Script
# This script does EVERYTHING automatically!

echo "🚀 Starting Multi-Agent Dashboard Ultimate Setup..."
echo "================================================"

# Colors for output
GREEN='\\033[0;32m'
BLUE='\\033[0;34m'
YELLOW='\\033[1;33m'
RED='\\033[0;31m'
NC='\\033[0m' # No Color

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Create project directory
PROJECT_DIR="multi-agent-dashboard"
echo -e "\${BLUE}📁 Creating project directory: \${PROJECT_DIR}\${NC}"
mkdir -p "\${PROJECT_DIR}"
cd "\${PROJECT_DIR}"

# Download necessary files
echo -e "\${BLUE}📥 Downloading dashboard files...\${NC}"

# Create package.json for the server
cat > package.json << 'EOF'
{
  "name": "multi-agent-observability-server",
  "version": "1.0.0",
  "description": "Backend server for Multi-Agent Observability Dashboard",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "sqlite3": "^5.1.6",
    "ws": "^8.16.0",
    "dotenv": "^16.3.1"
  }
}
EOF

# Create the server file
cat > server.js << 'EOF'
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const WebSocket = require('ws');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const WS_PORT = process.env.WS_PORT || 8766;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize SQLite database
const db = new sqlite3.Database('./events.db');

// Create events table
db.run(\`
  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    event_type TEXT,
    session_id TEXT,
    app TEXT,
    summary TEXT,
    payload TEXT
  )
\`);

// WebSocket server
const wss = new WebSocket.Server({ port: WS_PORT });
const clients = new Set();

wss.on('connection', (ws) => {
  clients.add(ws);
  console.log('New WebSocket client connected');
  
  ws.send(JSON.stringify({ type: 'connection', message: 'Connected to dashboard' }));
  
  ws.on('close', () => {
    clients.delete(ws);
    console.log('Client disconnected');
  });
});

// Broadcast event to all connected clients
function broadcastEvent(event) {
  const message = JSON.stringify(event);
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// API Routes
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    connections: clients.size 
  });
});

app.post('/events', (req, res) => {
  const event = req.body;
  
  db.run(
    \`INSERT INTO events (event_type, session_id, app, summary, payload) 
     VALUES (?, ?, ?, ?, ?)\`,
    [event.event_type, event.session_id, event.app, event.summary, JSON.stringify(event.payload)],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      const savedEvent = {
        id: this.lastID,
        ...event,
        timestamp: new Date().toISOString()
      };
      
      broadcastEvent(savedEvent);
      res.json({ success: true, id: this.lastID });
    }
  );
});

app.get('/events', (req, res) => {
  const limit = req.query.limit || 100;
  
  db.all(
    \`SELECT * FROM events ORDER BY timestamp DESC LIMIT ?\`,
    [limit],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows.map(row => ({
        ...row,
        payload: JSON.parse(row.payload || '{}')
      })));
    }
  );
});

app.get('/stats', (req, res) => {
  db.get(
    \`SELECT COUNT(*) as total_events FROM events\`,
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({
        total_events: row.total_events,
        active_count: clients.size,
        active_sessions: []
      });
    }
  );
});

// Serve the dashboard
app.use(express.static('public'));

app.listen(PORT, () => {
  console.log(\`✅ Server running on http://localhost:\${PORT}\`);
  console.log(\`✅ WebSocket server on ws://localhost:\${WS_PORT}\`);
});
EOF

# Install dependencies
echo -e "\${BLUE}📦 Installing server dependencies...\${NC}"
npm install

# Find Claude settings
echo -e "\${BLUE}🔍 Looking for Claude settings...\${NC}"
CLAUDE_SETTINGS=""
POSSIBLE_PATHS=(
  "$HOME/Library/Application Support/Claude/claude_desktop_config.json"
  "$HOME/.config/Claude/claude_desktop_config.json"
  "$HOME/Library/Application Support/com.anthropic.claude/settings.json"
  "$HOME/.config/com.anthropic.claude/settings.json"
)

for path in "\${POSSIBLE_PATHS[@]}"; do
  if [ -f "$path" ]; then
    CLAUDE_SETTINGS="$path"
    echo -e "\${GREEN}✅ Found Claude settings at: $path\${NC}"
    break
  fi
done

if [ -z "$CLAUDE_SETTINGS" ]; then
  echo -e "\${YELLOW}⚠️  Could not find Claude settings file\${NC}"
  echo "Please enter the path to your Claude settings file:"
  read -r CLAUDE_SETTINGS
fi

# Configure Claude hooks
if [ -n "$CLAUDE_SETTINGS" ] && [ -f "$CLAUDE_SETTINGS" ]; then
  echo -e "\${BLUE}⚙️  Configuring Claude hooks...\${NC}"
  
  # Backup settings
  cp "$CLAUDE_SETTINGS" "$CLAUDE_SETTINGS.backup"
  
  # Add hooks using Python for proper JSON handling
  python3 -c "
import json
import sys

settings_path = '$CLAUDE_SETTINGS'
with open(settings_path, 'r') as f:
    settings = json.load(f)

if 'hooks' not in settings:
    settings['hooks'] = {}

settings['hooks']['preToolUse'] = 'curl -X POST http://localhost:3001/events -H \\"Content-Type: application/json\\" -d \\"{\\\\\"event_type\\\\\":\\\\\"PreToolUse\\\\\",\\\\\"session_id\\\\\":\\\\\"\\\${SESSION_ID}\\\\\",\\\\\"app\\\\\":\\\\\"\\\${APP_NAME}\\\\\",\\\\\"summary\\\\\":\\\\\"\\\${TOOL_NAME}\\\\\",\\\\\"payload\\\\\":{\\\\\"tool\\\\\":\\\\\"\\\${TOOL_NAME}\\\\\",\\\\\"params\\\\\":\\\${TOOL_PARAMS}}}\\"'

settings['hooks']['postToolUse'] = 'curl -X POST http://localhost:3001/events -H \\"Content-Type: application/json\\" -d \\"{\\\\\"event_type\\\\\":\\\\\"PostToolUse\\\\\",\\\\\"session_id\\\\\":\\\\\"\\\${SESSION_ID}\\\\\",\\\\\"app\\\\\":\\\\\"\\\${APP_NAME}\\\\\",\\\\\"summary\\\\\":\\\\\"Result: \\\${TOOL_RESULT:0:100}\\\\\",\\\\\"payload\\\\\":{\\\\\"tool\\\\\":\\\\\"\\\${TOOL_NAME}\\\\\",\\\\\"result\\\\\":\\\\\"\\\${TOOL_RESULT}\\\\\"}}\\"'

with open(settings_path, 'w') as f:
    json.dump(settings, f, indent=2)

print('✅ Hooks configured successfully!')
"
fi

# Start servers
echo -e "\${BLUE}🚀 Starting servers...\${NC}"
npm start &
SERVER_PID=$!

# Wait for server to start
sleep 3

# Test connection
echo -e "\${BLUE}🧪 Testing connection...\${NC}"
if curl -s http://localhost:3001/health > /dev/null; then
  echo -e "\${GREEN}✅ Server is running!\${NC}"
else
  echo -e "\${RED}❌ Server failed to start\${NC}"
  exit 1
fi

# Open dashboard
echo -e "\${BLUE}🌐 Opening dashboard...\${NC}"
if [[ "$OSTYPE" == "darwin"* ]]; then
  open "http://localhost:3001"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
  xdg-open "http://localhost:3001"
fi

echo -e "\${GREEN}✨ Setup complete!\${NC}"
echo -e "\${GREEN}Dashboard: http://localhost:3001\${NC}"
echo -e "\${GREEN}API: http://localhost:3001\${NC}"
echo -e "\${GREEN}WebSocket: ws://localhost:8766\${NC}"
echo ""
echo "Press Ctrl+C to stop the servers"

# Keep script running
wait $SERVER_PID
`;

  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Content-Disposition', 'attachment; filename="ultimate-setup.sh"');
  res.send(setupScript);
});

// Serve a simple installer command
router.get('/install-command', (req, res) => {
  const host = req.get('host') || 'localhost:3001';
  const protocol = req.secure ? 'https' : 'http';
  
  const command = `curl -o ultimate-setup.sh ${protocol}://${host}/api/setup/download && chmod +x ultimate-setup.sh && ./ultimate-setup.sh`;
  
  res.json({ command });
});

export default router;