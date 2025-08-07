import 'dotenv/config';
import express from 'express';
import { WebSocketServer } from 'ws';
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import cors from 'cors';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import TaskQueue from './task-queue.js';
import setupRoutes from './routes/setup.js';
import userSetupRoutes from './routes/user-setup.js';
import {
  helmetConfig,
  apiLimiter,
  eventLimiter,
  validateEvent,
  validateTask,
  validateAgentCompletion,
  validateChatTranscript,
  handleValidationErrors,
  sanitizeInput,
  securityHeaders
} from './middleware/security.js';
import { authMiddleware, requireAuth, initAuthTables, setupAuthRoutes } from './auth.mjs';
import { createApiKey, listApiKeys, revokeApiKey, verifyApiKey } from './api-keys.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const PORT = process.env.PORT || 3001;
const WS_PORT = process.env.WS_PORT || 8766;
const DB_PATH = process.env.DB_PATH || join(__dirname, 'events.db');

// Security check
if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  console.error('❌ SECURITY ERROR: JWT_SECRET must be set in production!');
  process.exit(1);
}

// Initialize Express app
const app = express();

// Security middleware
app.use(helmetConfig);
app.use(securityHeaders);

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176', 'http://localhost:5177', 'http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
}));

app.use(express.json({ limit: '10mb' })); // Limit request body size
app.use(sanitizeInput); // Sanitize all inputs
// app.use(apiLimiter); // DISABLED - Rate limiting makes no sense for real-time monitoring

// Initialize SQLite database
const db = new sqlite3.Database(DB_PATH);

// Initialize task queue
const taskQueue = new TaskQueue();

// Initialize auth tables
initAuthTables(db);

// Setup auth routes
setupAuthRoutes(app, db);

// API Key middleware - allows both JWT auth and API key auth
const apiKeyAuth = async (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (apiKey) {
    const result = await verifyApiKey(db, apiKey);
    if (result) {
      req.user = result.user;
      req.apiKey = result.apiKey;
      return next();
    }
  }
  
  // Fall back to JWT auth
  return authMiddleware(req, res, next);
};

// API Key Management Routes
app.post('/api/keys', requireAuth, async (req, res) => {
  try {
    const { name } = req.body;
    const apiKey = await createApiKey(db, req.user.id, name || 'Default');
    
    res.json({
      success: true,
      apiKey: apiKey.key, // Only shown once!
      message: 'Save this API key securely. It will not be shown again.'
    });
  } catch (error) {
    console.error('Failed to create API key:', error);
    res.status(500).json({ error: 'Failed to create API key' });
  }
});

app.get('/api/keys', requireAuth, async (req, res) => {
  try {
    const keys = await listApiKeys(db, req.user.id);
    res.json({ keys });
  } catch (error) {
    console.error('Failed to list API keys:', error);
    res.status(500).json({ error: 'Failed to list API keys' });
  }
});

app.delete('/api/keys/:keyId', requireAuth, async (req, res) => {
  try {
    const success = await revokeApiKey(db, req.user.id, req.params.keyId);
    if (success) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'API key not found' });
    }
  } catch (error) {
    console.error('Failed to revoke API key:', error);
    res.status(500).json({ error: 'Failed to revoke API key' });
  }
});

// Create tables if not exists
db.run(`
  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    app TEXT,
    session_id TEXT,
    event_type TEXT,
    payload TEXT,
    summary TEXT,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL
  )
`);

// Create chat transcripts table
db.run(`
  CREATE TABLE IF NOT EXISTS chat_transcripts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT UNIQUE,
    transcript TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Create retention settings table
db.run(`
  CREATE TABLE IF NOT EXISTS retention_settings (
    id INTEGER PRIMARY KEY,
    policy_name TEXT UNIQUE,
    retention_days INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Create cleanup log table
db.run(`
  CREATE TABLE IF NOT EXISTS cleanup_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cleanup_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    retention_policy TEXT,
    events_deleted INTEGER,
    cutoff_date DATETIME,
    execution_time_ms INTEGER
  )
`);

// Insert default retention policy
db.run(`
  INSERT OR IGNORE INTO retention_settings (policy_name, retention_days) 
  VALUES ('default', 30)
`);

// Create indexes for better performance
db.run('CREATE INDEX IF NOT EXISTS idx_app ON events(app)');
db.run('CREATE INDEX IF NOT EXISTS idx_session ON events(session_id)');
db.run('CREATE INDEX IF NOT EXISTS idx_event_type ON events(event_type)');
db.run('CREATE INDEX IF NOT EXISTS idx_timestamp ON events(timestamp)');

// WebSocket server with user authentication
const wss = new WebSocketServer({ port: WS_PORT });
const clients = new Map(); // Map of userId -> Set of WebSocket connections

wss.on('connection', async (ws, req) => {
  console.log('New WebSocket client connected');
  
  // Extract API key from query params or headers
  const url = new URL(req.url, `http://${req.headers.host}`);
  const apiKey = url.searchParams.get('apiKey') || req.headers['x-api-key'];
  
  if (!apiKey) {
    ws.send(JSON.stringify({
      type: 'error',
      message: 'API key required for WebSocket connection'
    }));
    ws.close();
    return;
  }
  
  // Verify API key
  const authResult = await verifyApiKey(db, apiKey);
  if (!authResult) {
    ws.send(JSON.stringify({
      type: 'error',
      message: 'Invalid API key'
    }));
    ws.close();
    return;
  }
  
  // Store connection with user association
  ws.userId = authResult.user.id;
  
  if (!clients.has(ws.userId)) {
    clients.set(ws.userId, new Set());
  }
  clients.get(ws.userId).add(ws);
  
  // Send connection confirmation
  ws.send(JSON.stringify({
    type: 'connection',
    message: 'Connected to observability server',
    userId: ws.userId,
    timestamp: new Date().toISOString()
  }));
  
  ws.on('close', () => {
    console.log('WebSocket client disconnected');
    if (clients.has(ws.userId)) {
      clients.get(ws.userId).delete(ws);
      if (clients.get(ws.userId).size === 0) {
        clients.delete(ws.userId);
      }
    }
  });
  
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    if (clients.has(ws.userId)) {
      clients.get(ws.userId).delete(ws);
    }
  });
});

// Broadcast event to specific user's connected clients
function broadcastEventToUser(event, userId) {
  const message = JSON.stringify(event);
  const userClients = clients.get(userId);
  
  if (userClients) {
    userClients.forEach(client => {
      if (client.readyState === 1) { // OPEN state
        client.send(message);
      }
    });
  }
}

// API Routes

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    connections: clients.size
  });
});

// Receive events from hooks (with API key auth)
app.post('/events', apiKeyAuth, validateEvent, handleValidationErrors, (req, res) => {
  const event = req.body;
  
  // Require authentication for events
  if (!req.user) {
    return res.status(401).json({ error: 'API key required' });
  }
  
  // Store in database with user isolation
  const stmt = db.prepare(`
    INSERT INTO events (app, session_id, event_type, payload, summary, user_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(
    event.app || 'unknown',
    event.session_id || 'unknown',
    event.event_type || 'unknown',
    JSON.stringify(event.payload || {}),
    event.summary || null,
    req.user.id,  // Always associate with authenticated user
    function(err) {
      if (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: 'Database error' });
        return;
      }
      
      // Add database ID to event
      event.id = this.lastID;
      event.timestamp = event.timestamp || new Date().toISOString();
      event.user_id = req.user.id;
      
      // Broadcast ONLY to WebSocket clients of the same user
      broadcastEventToUser(event, req.user.id);
      
      res.json({ success: true, id: event.id });
    }
  );
  
  stmt.finalize();
});

// Retention policy endpoints
app.get('/retention', (req, res) => {
  try {
    const stmt = db.prepare(`
      SELECT retention_days, updated_at FROM retention_settings 
      WHERE policy_name = 'default'
    `);
    const result = stmt.get();
    
    if (!result) {
      // Create default policy
      const insertStmt = db.prepare(`
        INSERT INTO retention_settings (policy_name, retention_days) 
        VALUES ('default', 30)
      `);
      insertStmt.run();
      return res.json({ retention_days: 30, updated_at: new Date().toISOString() });
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error getting retention policy:', error);
    res.status(500).json({ error: 'Failed to get retention policy' });
  }
});

app.post('/retention', (req, res) => {
  try {
    const { retention_days } = req.body;
    
    if (retention_days !== null && (typeof retention_days !== 'number' || retention_days < 1)) {
      return res.status(400).json({ error: 'retention_days must be a positive number or null' });
    }
    
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO retention_settings (policy_name, retention_days, updated_at)
      VALUES ('default', ?, CURRENT_TIMESTAMP)
    `);
    stmt.run(retention_days);
    
    res.json({ 
      success: true, 
      retention_days,
      message: `Retention policy updated to ${retention_days === null ? 'never delete' : retention_days + ' days'}`
    });
  } catch (error) {
    console.error('Error setting retention policy:', error);
    res.status(500).json({ error: 'Failed to set retention policy' });
  }
});

app.post('/cleanup/run', (req, res) => {
  try {
    const { dry_run = false } = req.body;
    
    // Get retention policy
    const retentionStmt = db.prepare(`
      SELECT retention_days FROM retention_settings WHERE policy_name = 'default'
    `);
    const retention = retentionStmt.get();
    const retentionDays = retention ? retention.retention_days : 30;
    
    if (retentionDays === null) {
      return res.json({ message: 'Retention policy set to never delete', deleted: 0 });
    }
    
    // Calculate cutoff date
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
    const cutoffISO = cutoffDate.toISOString();
    
    // Count/delete old events
    const countStmt = db.prepare('SELECT COUNT(*) as count FROM events WHERE timestamp < ?');
    const { count } = countStmt.get(cutoffISO);
    
    if (count === 0) {
      return res.json({ message: 'No old events to cleanup', deleted: 0 });
    }
    
    if (dry_run) {
      return res.json({ 
        message: `Would delete ${count} events older than ${retentionDays} days`,
        deleted: count,
        dry_run: true
      });
    }
    
    // Actually delete
    const deleteStmt = db.prepare('DELETE FROM events WHERE timestamp < ?');
    const result = deleteStmt.run(cutoffISO);
    
    // Log cleanup
    const logStmt = db.prepare(`
      INSERT INTO cleanup_log (retention_policy, events_deleted, cutoff_date, execution_time_ms)
      VALUES (?, ?, ?, ?)
    `);
    logStmt.run(`${retentionDays}d`, result.changes, cutoffISO, 0);
    
    res.json({ 
      message: `Deleted ${result.changes} old events`,
      deleted: result.changes,
      cutoffDate: cutoffISO
    });
  } catch (error) {
    console.error('Error running cleanup:', error);
    res.status(500).json({ error: 'Failed to run cleanup' });
  }
});

// Get recent events (with user isolation)
app.get('/events', requireAuth, (req, res) => {
  const { app, session_id, event_type, limit = 100, offset = 0 } = req.query;
  
  // Always filter by authenticated user
  let query = 'SELECT * FROM events WHERE user_id = ?';
  const params = [req.user.id];
  
  if (app) {
    query += ' AND app = ?';
    params.push(app);
  }
  
  if (session_id) {
    query += ' AND session_id = ?';
    params.push(session_id);
  }
  
  if (event_type) {
    query += ' AND event_type = ?';
    params.push(event_type);
  }
  
  query += ' ORDER BY timestamp DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));
  
  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      res.status(500).json({ error: 'Database error' });
      return;
    }
    
    // Parse JSON payloads
    const events = rows.map(row => ({
      ...row,
      payload: JSON.parse(row.payload || '{}')
    }));
    
    res.json(events);
  });
});

// Get event statistics (with user isolation)
app.get('/stats', requireAuth, (req, res) => {
  const stats = {};
  const userId = req.user.id;
  
  // Get total events for this user
  db.get('SELECT COUNT(*) as total FROM events WHERE user_id = ?', [userId], (err, row) => {
    if (err) {
      console.error('Database error:', err);
      res.status(500).json({ error: 'Database error' });
      return;
    }
    
    stats.total_events = row.total;
    
    // Get events by type
    db.all(`
      SELECT event_type, COUNT(*) as count 
      FROM events 
      GROUP BY event_type
    `, (err, rows) => {
      if (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: 'Database error' });
        return;
      }
      
      stats.by_type = {};
      rows.forEach(row => {
        stats.by_type[row.event_type] = row.count;
      });
      
      // Get active sessions
      db.all(`
        SELECT DISTINCT session_id, app, MAX(timestamp) as last_activity
        FROM events
        WHERE timestamp > datetime('now', '-1 hour')
        GROUP BY session_id, app
        ORDER BY last_activity DESC
      `, (err, rows) => {
        if (err) {
          console.error('Database error:', err);
          res.status(500).json({ error: 'Database error' });
          return;
        }
        
        stats.active_sessions = rows;
        stats.active_count = rows.length;
        
        res.json(stats);
      });
    });
  });
});

// Get unique apps
app.get('/apps', (req, res) => {
  db.all('SELECT DISTINCT app FROM events ORDER BY app', (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      res.status(500).json({ error: 'Database error' });
      return;
    }
    
    res.json(rows.map(row => row.app));
  });
});

// Get unique sessions
app.get('/sessions', (req, res) => {
  const { app } = req.query;
  
  let query = 'SELECT DISTINCT session_id, app, MIN(timestamp) as start_time, MAX(timestamp) as end_time, COUNT(*) as event_count FROM events';
  const params = [];
  
  if (app) {
    query += ' WHERE app = ?';
    params.push(app);
  }
  
  query += ' GROUP BY session_id, app ORDER BY end_time DESC';
  
  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      res.status(500).json({ error: 'Database error' });
      return;
    }
    
    res.json(rows);
  });
});

// Get chat transcript for session
app.get('/chat-transcripts/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  
  db.get(
    'SELECT * FROM chat_transcripts WHERE session_id = ?',
    [sessionId],
    (err, row) => {
      if (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: 'Database error' });
        return;
      }
      
      if (!row) {
        res.status(404).json({ error: 'Transcript not found' });
        return;
      }
      
      res.json({
        session_id: row.session_id,
        transcript: JSON.parse(row.transcript || '[]'),
        created_at: row.created_at,
        updated_at: row.updated_at
      });
    }
  );
});

// Save/update chat transcript
app.post('/chat-transcripts/:sessionId', validateChatTranscript, handleValidationErrors, (req, res) => {
  const { sessionId } = req.params;
  const { transcript } = req.body;
  
  const transcriptStr = JSON.stringify(transcript);
  
  db.run(
    `INSERT INTO chat_transcripts (session_id, transcript) 
     VALUES (?, ?) 
     ON CONFLICT(session_id) 
     DO UPDATE SET transcript = ?, updated_at = CURRENT_TIMESTAMP`,
    [sessionId, transcriptStr, transcriptStr],
    function(err) {
      if (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: 'Database error' });
        return;
      }
      
      res.json({ 
        success: true,
        session_id: sessionId
      });
    }
  );
});

// Handle agent completion reports
app.post('/agent-completion', validateAgentCompletion, handleValidationErrors, (req, res) => {
  const completion = req.body;
  
  // Store completion in database
  db.run(
    `INSERT INTO events (app, session_id, event_type, payload, summary) 
     VALUES (?, ?, ?, ?, ?)`,
    [
      completion.agent_id,
      completion.session_id,
      'AgentComplete',
      JSON.stringify(completion),
      `Agent ${completion.agent_id} completed: ${completion.summary}`
    ],
    function(err) {
      if (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: 'Database error' });
        return;
      }
      
      console.log(`📋 Agent completion received: ${completion.agent_id}`);
      
      // Broadcast to WebSocket clients
      broadcastEvent({
        id: this.lastID,
        timestamp: new Date().toISOString(),
        app: completion.agent_id,
        session_id: completion.session_id,
        event_type: 'AgentComplete',
        payload: completion,
        summary: `Agent ${completion.agent_id} completed: ${completion.summary}`
      });
      
      // TODO: Notify orchestrator to review and create new tasks
      notifyOrchestrator(completion);
      
      res.json({ success: true, id: this.lastID });
    }
  );
});

// Notify orchestrator of agent completion
function notifyOrchestrator(completion) {
  // Send completion to orchestrator for review and next task generation
  const orchestratorEvent = {
    type: 'agent_completion',
    agent_id: completion.agent_id,
    session_id: completion.session_id,
    completion_data: completion,
    requires_review: true
  };
  
  // Store orchestrator notification
  db.run(
    `INSERT INTO events (app, session_id, event_type, payload, summary) 
     VALUES (?, ?, ?, ?, ?)`,
    [
      'orchestrator',
      completion.session_id,
      'AgentCompletionNotification',
      JSON.stringify(orchestratorEvent),
      `Review needed: ${completion.agent_id} completed ${completion.summary}`
    ]
  );
}

// Clear old events (optional cleanup endpoint)
app.delete('/events/cleanup', (req, res) => {
  const { days = 7 } = req.query;
  
  db.run(
    'DELETE FROM events WHERE timestamp < datetime("now", ?)',
    [`-${days} days`],
    function(err) {
      if (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: 'Database error' });
        return;
      }
      
      res.json({ 
        success: true, 
        deleted: this.changes 
      });
    }
  );
});

// Task Queue API Routes

// Add task
app.post('/tasks', validateTask, handleValidationErrors, async (req, res) => {
  try {
    const taskId = await taskQueue.addTask(req.body);
    res.json({ success: true, taskId });
  } catch (err) {
    console.error('Error adding task:', err);
    res.status(500).json({ error: 'Failed to add task' });
  }
});

// Get next task for agent
app.get('/tasks/next/:agentId', async (req, res) => {
  try {
    const task = await taskQueue.getNextTask(req.params.agentId);
    res.json(task || { message: 'No pending tasks' });
  } catch (err) {
    console.error('Error getting next task:', err);
    res.status(500).json({ error: 'Failed to get task' });
  }
});

// Start task
app.post('/tasks/:taskId/start', async (req, res) => {
  try {
    await taskQueue.startTask(req.params.taskId, req.body.sessionId);
    res.json({ success: true });
  } catch (err) {
    console.error('Error starting task:', err);
    res.status(500).json({ error: 'Failed to start task' });
  }
});

// Complete task
app.post('/tasks/:taskId/complete', async (req, res) => {
  try {
    await taskQueue.completeTask(req.params.taskId, req.body.result);
    res.json({ success: true });
  } catch (err) {
    console.error('Error completing task:', err);
    res.status(500).json({ error: 'Failed to complete task' });
  }
});

// Get task history
app.get('/tasks/history/:agentId', async (req, res) => {
  try {
    const history = await taskQueue.getTaskHistory(req.params.agentId);
    res.json(history);
  } catch (err) {
    console.error('Error getting task history:', err);
    res.status(500).json({ error: 'Failed to get history' });
  }
});

// Get active tasks
app.get('/tasks/active', async (req, res) => {
  try {
    const tasks = await taskQueue.getActiveTasks();
    res.json(tasks);
  } catch (err) {
    console.error('Error getting active tasks:', err);
    res.status(500).json({ error: 'Failed to get active tasks' });
  }
});

// Generate tasks from analysis
app.post('/tasks/generate', async (req, res) => {
  try {
    const { agentId, analysis } = req.body;
    const taskIds = await taskQueue.generateTasks(agentId, analysis);
    res.json({ success: true, generated: taskIds.length, taskIds });
  } catch (err) {
    console.error('Error generating tasks:', err);
    res.status(500).json({ error: 'Failed to generate tasks' });
  }
});

// Get task stats
app.get('/tasks/stats/:agentId', async (req, res) => {
  try {
    const stats = await taskQueue.getStats(req.params.agentId);
    res.json(stats);
  } catch (err) {
    console.error('Error getting task stats:', err);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

// Setup script routes
app.use('/api/setup', setupRoutes);
app.use('/api/user-setup', userSetupRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Add agent endpoint
app.post('/api/agents', requireAuth, async (req, res) => {
  try {
    const agent = req.body;
    const userId = req.user.id;
    
    // Store agent in database
    const stmt = db.prepare(`
      INSERT INTO user_agents (user_id, agent_data, created_at, updated_at)
      VALUES (?, ?, datetime('now'), datetime('now'))
    `);
    
    const result = stmt.run(userId, JSON.stringify(agent));
    
    res.json({ 
      success: true, 
      agent: { ...agent, dbId: result.lastInsertRowid }
    });
  } catch (error) {
    console.error('Failed to add agent:', error);
    res.status(500).json({ error: 'Failed to add agent' });
  }
});

// Get user agents endpoint
app.get('/api/agents', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const stmt = db.prepare(`
      SELECT id, agent_data, created_at, updated_at 
      FROM user_agents 
      WHERE user_id = ?
      ORDER BY created_at DESC
    `);
    
    const rows = stmt.all(userId);
    const agents = rows.map(row => ({
      ...JSON.parse(row.agent_data),
      dbId: row.id,
      created_at: row.created_at,
      updated_at: row.updated_at
    }));
    
    res.json({ agents });
  } catch (error) {
    console.error('Failed to get agents:', error);
    res.status(500).json({ error: 'Failed to get agents' });
  }
});

// Register agent endpoint for Claude Code hooks
app.post('/agents/register', apiKeyAuth, (req, res) => {
  try {
    const agent = req.body;
    const userId = req.user ? req.user.id : null;
    
    // Store agent registration
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO agent_registrations 
      (agent_id, user_id, name, type, project, status, capabilities, registered_at, last_seen)
      VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `);
    
    stmt.run(
      agent.agent_id,
      userId,
      agent.name,
      agent.type,
      agent.project,
      agent.status,
      JSON.stringify(agent.capabilities || {})
    );
    
    // Broadcast agent registration to dashboard
    if (userId) {
      broadcastEventToUser({
        type: 'agent_registered',
        agent: agent,
        timestamp: new Date().toISOString()
      }, userId);
    }
    
    res.json({ success: true, agent_id: agent.agent_id });
  } catch (error) {
    console.error('Failed to register agent:', error);
    res.status(500).json({ error: 'Failed to register agent' });
  }
});

// Update agent status endpoint
app.post('/agents/status', apiKeyAuth, (req, res) => {
  try {
    const status = req.body;
    const userId = req.user ? req.user.id : null;
    
    // Update agent status
    const stmt = db.prepare(`
      UPDATE agent_registrations 
      SET status = ?, last_seen = datetime('now'), last_activity = ?
      WHERE agent_id = ? AND user_id = ?
    `);
    
    stmt.run(
      status.status,
      JSON.stringify(status),
      status.agent_id,
      userId
    );
    
    // Broadcast status update to dashboard
    if (userId) {
      broadcastEventToUser({
        type: 'agent_status_update',
        ...status
      }, userId);
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to update agent status:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// Metrics endpoint for activity tracking
app.post('/metrics', apiKeyAuth, (req, res) => {
  try {
    const metrics = req.body;
    const userId = req.user ? req.user.id : null;
    
    // Store metrics
    const stmt = db.prepare(`
      INSERT INTO metrics 
      (user_id, type, data, timestamp)
      VALUES (?, ?, ?, datetime('now'))
    `);
    
    stmt.run(
      userId,
      metrics.type,
      JSON.stringify(metrics)
    );
    
    // Broadcast metrics to dashboard
    if (userId) {
      broadcastEventToUser({
        type: 'metrics_update',
        metrics: metrics,
        timestamp: new Date().toISOString()
      }, userId);
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to store metrics:', error);
    res.status(500).json({ error: 'Failed to store metrics' });
  }
});

// Get active agents endpoint
app.get('/agents/active', requireAuth, (req, res) => {
  try {
    const stmt = db.prepare(`
      SELECT * FROM agent_registrations 
      WHERE user_id = ? 
      AND datetime(last_seen) > datetime('now', '-5 minutes')
      ORDER BY last_seen DESC
    `);
    
    const agents = stmt.all(req.user.id).map(agent => ({
      ...agent,
      capabilities: JSON.parse(agent.capabilities || '{}'),
      last_activity: JSON.parse(agent.last_activity || '{}')
    }));
    
    res.json({ agents });
  } catch (error) {
    console.error('Failed to get active agents:', error);
    res.status(500).json({ error: 'Failed to get active agents' });
  }
});

// Create necessary tables for agent tracking
db.run(`
  CREATE TABLE IF NOT EXISTS agent_registrations (
    agent_id TEXT PRIMARY KEY,
    user_id INTEGER,
    name TEXT,
    type TEXT,
    project TEXT,
    status TEXT,
    capabilities TEXT,
    registered_at TIMESTAMP,
    last_seen TIMESTAMP,
    last_activity TEXT,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    type TEXT,
    data TEXT,
    timestamp TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )
`);

// Start HTTP server
app.listen(PORT, () => {
  console.log(`HTTP server running on http://localhost:${PORT}`);
  console.log(`WebSocket server running on ws://localhost:${WS_PORT}`);
  console.log(`Database path: ${DB_PATH}`);
  console.log(`Task queue initialized`);
});