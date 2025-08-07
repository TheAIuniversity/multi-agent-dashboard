import sqlite3 from 'sqlite3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class TaskQueue {
  constructor() {
    this.db = new sqlite3.Database(join(__dirname, 'tasks.db'));
    this.initDatabase();
  }

  initDatabase() {
    this.db.run(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        agent_id TEXT NOT NULL,
        session_id TEXT,
        task_type TEXT NOT NULL,
        priority INTEGER DEFAULT 5,
        status TEXT DEFAULT 'pending',
        title TEXT NOT NULL,
        description TEXT,
        context TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        started_at DATETIME,
        completed_at DATETIME,
        result TEXT,
        error TEXT,
        retry_count INTEGER DEFAULT 0,
        parent_task_id INTEGER,
        FOREIGN KEY (parent_task_id) REFERENCES tasks(id)
      )
    `);

    // Create indexes
    this.db.run('CREATE INDEX IF NOT EXISTS idx_agent_status ON tasks(agent_id, status)');
    this.db.run('CREATE INDEX IF NOT EXISTS idx_priority ON tasks(priority DESC, created_at)');
  }

  // Add a new task
  async addTask(task) {
    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare(`
        INSERT INTO tasks (agent_id, session_id, task_type, priority, title, description, context)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      
      stmt.run(
        task.agent_id,
        task.session_id || null,
        task.task_type,
        task.priority || 5,
        task.title,
        task.description || null,
        JSON.stringify(task.context || {}),
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
      
      stmt.finalize();
    });
  }

  // Get next task for an agent
  async getNextTask(agentId) {
    return new Promise((resolve, reject) => {
      this.db.get(
        `SELECT * FROM tasks 
         WHERE agent_id = ? 
         AND status = 'pending' 
         ORDER BY priority DESC, created_at ASC 
         LIMIT 1`,
        [agentId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row ? this.parseTask(row) : null);
        }
      );
    });
  }

  // Start a task
  async startTask(taskId, sessionId) {
    return new Promise((resolve, reject) => {
      this.db.run(
        `UPDATE tasks 
         SET status = 'in_progress', 
             started_at = CURRENT_TIMESTAMP,
             session_id = ?
         WHERE id = ?`,
        [sessionId, taskId],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  // Complete a task
  async completeTask(taskId, result) {
    return new Promise((resolve, reject) => {
      this.db.run(
        `UPDATE tasks 
         SET status = 'completed', 
             completed_at = CURRENT_TIMESTAMP,
             result = ?
         WHERE id = ?`,
        [JSON.stringify(result), taskId],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  // Fail a task
  async failTask(taskId, error) {
    return new Promise((resolve, reject) => {
      this.db.run(
        `UPDATE tasks 
         SET status = 'failed', 
             error = ?,
             retry_count = retry_count + 1
         WHERE id = ?`,
        [error, taskId],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  // Get agent's task history
  async getTaskHistory(agentId, limit = 100) {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT * FROM tasks 
         WHERE agent_id = ? 
         ORDER BY created_at DESC 
         LIMIT ?`,
        [agentId, limit],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows.map(row => this.parseTask(row)));
        }
      );
    });
  }

  // Get active tasks across all agents
  async getActiveTasks() {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT * FROM tasks 
         WHERE status = 'in_progress' 
         ORDER BY started_at DESC`,
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows.map(row => this.parseTask(row)));
        }
      );
    });
  }

  // Generate new tasks based on analysis
  async generateTasks(agentId, analysis) {
    const tasks = [];
    
    // Generate tasks from TODO comments
    if (analysis.todos && analysis.todos.length > 0) {
      for (const todo of analysis.todos) {
        tasks.push({
          agent_id: agentId,
          task_type: 'implement_todo',
          priority: 6,
          title: `Implement TODO: ${todo.text}`,
          description: `Found in ${todo.file}:${todo.line}`,
          context: { file: todo.file, line: todo.line, text: todo.text }
        });
      }
    }

    // Generate tasks for low test coverage
    if (analysis.coverage && analysis.coverage.lowCoverage) {
      for (const file of analysis.coverage.lowCoverage) {
        tasks.push({
          agent_id: agentId,
          task_type: 'improve_coverage',
          priority: 7,
          title: `Improve test coverage for ${file.name}`,
          description: `Current coverage: ${file.coverage}%, target: 90%`,
          context: { file: file.path, currentCoverage: file.coverage }
        });
      }
    }

    // Generate tasks for code quality issues
    if (analysis.quality && analysis.quality.issues) {
      for (const issue of analysis.quality.issues) {
        tasks.push({
          agent_id: agentId,
          task_type: 'fix_quality',
          priority: issue.severity === 'high' ? 8 : 5,
          title: `Fix ${issue.type}: ${issue.message}`,
          description: `In ${issue.file}`,
          context: { file: issue.file, type: issue.type, line: issue.line }
        });
      }
    }

    // Add all generated tasks
    const taskIds = [];
    for (const task of tasks) {
      const id = await this.addTask(task);
      taskIds.push(id);
    }

    return taskIds;
  }

  // Parse task from database row
  parseTask(row) {
    return {
      ...row,
      context: row.context ? JSON.parse(row.context) : {},
      result: row.result ? JSON.parse(row.result) : null
    };
  }

  // Get task statistics
  async getStats(agentId) {
    return new Promise((resolve, reject) => {
      this.db.get(
        `SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
          COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
          COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress
         FROM tasks 
         WHERE agent_id = ?`,
        [agentId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }
}

export default TaskQueue;