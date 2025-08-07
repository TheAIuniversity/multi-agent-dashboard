// Agent Communication System
import express from 'express';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const router = express.Router();

// Initialize agent communication database
const db = new Database(path.join(__dirname, 'agent-comms.db'));

// Create tables for agent communication
db.exec(`
  CREATE TABLE IF NOT EXISTS agent_tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id TEXT UNIQUE,
    from_agent TEXT,
    to_agent TEXT,
    task_description TEXT,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    started_at DATETIME,
    completed_at DATETIME,
    result TEXT,
    metadata TEXT
  );

  CREATE TABLE IF NOT EXISTS agent_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id TEXT UNIQUE,
    agent_name TEXT,
    task_id TEXT,
    status TEXT,
    summary TEXT,
    details TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES agent_tasks(task_id)
  );

  CREATE TABLE IF NOT EXISTS agent_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    request_id TEXT UNIQUE,
    from_agent TEXT,
    request_type TEXT,
    request_data TEXT,
    status TEXT DEFAULT 'pending',
    response TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    responded_at DATETIME
  );
`);

// Prepared statements
const createTask = db.prepare(`
  INSERT INTO agent_tasks (task_id, from_agent, to_agent, task_description, metadata)
  VALUES (?, ?, ?, ?, ?)
`);

const updateTaskStatus = db.prepare(`
  UPDATE agent_tasks 
  SET status = ?, started_at = CASE WHEN ? = 'in_progress' THEN CURRENT_TIMESTAMP ELSE started_at END,
      completed_at = CASE WHEN ? IN ('completed', 'failed') THEN CURRENT_TIMESTAMP ELSE completed_at END,
      result = ?
  WHERE task_id = ?
`);

const createReport = db.prepare(`
  INSERT INTO agent_reports (report_id, agent_name, task_id, status, summary, details)
  VALUES (?, ?, ?, ?, ?, ?)
`);

const getPendingTasks = db.prepare(`
  SELECT * FROM agent_tasks 
  WHERE to_agent = ? AND status = 'pending'
  ORDER BY created_at ASC
`);

const createRequest = db.prepare(`
  INSERT INTO agent_requests (request_id, from_agent, request_type, request_data)
  VALUES (?, ?, ?, ?)
`);

// API Routes

// Orchestrator assigns task to agent
router.post('/tasks/assign', (req, res) => {
  const { from_agent, to_agent, task_description, metadata } = req.body;
  const task_id = `task-${to_agent}-${Date.now()}`;
  
  try {
    createTask.run(task_id, from_agent, to_agent, task_description, JSON.stringify(metadata || {}));
    
    // Emit event for dashboard
    req.app.locals.io?.emit('agent-task-assigned', {
      task_id,
      from_agent,
      to_agent,
      task_description,
      timestamp: new Date().toISOString()
    });
    
    res.json({ success: true, task_id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Agent checks for pending tasks
router.get('/tasks/pending/:agent_name', (req, res) => {
  const { agent_name } = req.params;
  
  try {
    const tasks = getPendingTasks.all(agent_name);
    res.json({ tasks });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Agent updates task status
router.put('/tasks/:task_id/status', (req, res) => {
  const { task_id } = req.params;
  const { status, result } = req.body;
  
  try {
    updateTaskStatus.run(status, status, status, result || null, task_id);
    
    // Emit event for dashboard
    req.app.locals.io?.emit('agent-task-updated', {
      task_id,
      status,
      result,
      timestamp: new Date().toISOString()
    });
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Agent submits completion report
router.post('/reports', (req, res) => {
  const { agent_name, task_id, status, summary, details } = req.body;
  const report_id = `report-${agent_name}-${Date.now()}`;
  
  try {
    createReport.run(report_id, agent_name, task_id, status, summary, JSON.stringify(details || {}));
    
    // Update task status if completed
    if (status === 'completed' || status === 'failed') {
      updateTaskStatus.run(status, status, status, summary, task_id);
    }
    
    // Emit event for dashboard
    req.app.locals.io?.emit('agent-report-submitted', {
      report_id,
      agent_name,
      task_id,
      status,
      summary,
      timestamp: new Date().toISOString()
    });
    
    res.json({ success: true, report_id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Agent requests new capability (triggers meta-agent)
router.post('/requests/new-agent', (req, res) => {
  const { from_agent, agent_type, capabilities } = req.body;
  const request_id = `req-${Date.now()}`;
  
  try {
    createRequest.run(
      request_id,
      from_agent,
      'new_agent',
      JSON.stringify({ agent_type, capabilities })
    );
    
    // Emit event for orchestrator and dashboard
    req.app.locals.io?.emit('new-agent-requested', {
      request_id,
      from_agent,
      agent_type,
      capabilities,
      timestamp: new Date().toISOString()
    });
    
    res.json({ success: true, request_id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all active tasks (for dashboard)
router.get('/tasks/active', (req, res) => {
  try {
    const tasks = db.prepare(`
      SELECT * FROM agent_tasks 
      WHERE status IN ('pending', 'in_progress')
      ORDER BY created_at DESC
    `).all();
    
    res.json({ tasks });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get agent communication history
router.get('/communications/:agent_name', (req, res) => {
  const { agent_name } = req.params;
  
  try {
    const sent_tasks = db.prepare('SELECT * FROM agent_tasks WHERE from_agent = ?').all(agent_name);
    const received_tasks = db.prepare('SELECT * FROM agent_tasks WHERE to_agent = ?').all(agent_name);
    const reports = db.prepare('SELECT * FROM agent_reports WHERE agent_name = ?').all(agent_name);
    const requests = db.prepare('SELECT * FROM agent_requests WHERE from_agent = ?').all(agent_name);
    
    res.json({
      sent_tasks,
      received_tasks,
      reports,
      requests
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;