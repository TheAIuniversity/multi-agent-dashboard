#!/usr/bin/env node
/**
 * Event Cleanup Service - Auto-cleanup old events based on retention policy
 */

import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new Database(join(__dirname, 'events.db'));

// Default retention policies (in days)
const RETENTION_POLICIES = {
  '1': 1,     // 1 day
  '7': 7,     // 1 week  
  '30': 30,   // 1 month
  '90': 90,   // 3 months
  '365': 365, // 1 year
  'never': null // Never delete
};

class EventCleanupService {
  constructor() {
    this.setupDatabase();
  }

  setupDatabase() {
    // Create settings table for retention policies
    db.exec(`
      CREATE TABLE IF NOT EXISTS retention_settings (
        id INTEGER PRIMARY KEY,
        policy_name TEXT UNIQUE,
        retention_days INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create cleanup log table
    db.exec(`  
      CREATE TABLE IF NOT EXISTS cleanup_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cleanup_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        retention_policy TEXT,
        events_deleted INTEGER,
        cutoff_date DATETIME,
        execution_time_ms INTEGER
      )
    `);

    // Insert default retention policy if not exists
    const defaultPolicy = db.prepare(`
      INSERT OR IGNORE INTO retention_settings (policy_name, retention_days) 
      VALUES (?, ?)
    `);
    defaultPolicy.run('default', 30); // Default 30 days
  }

  getCurrentRetentionPolicy() {
    const stmt = db.prepare(`
      SELECT retention_days FROM retention_settings 
      WHERE policy_name = 'default'
    `);
    const result = stmt.get();
    return result ? result.retention_days : 30;
  }

  setRetentionPolicy(days) {
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO retention_settings (policy_name, retention_days, updated_at)
      VALUES ('default', ?, CURRENT_TIMESTAMP)
    `);
    stmt.run(days);
    console.log(`✅ Retention policy updated to ${days} days`);
  }

  cleanupOldEvents(dryRun = false) {
    const startTime = Date.now();
    const retentionDays = this.getCurrentRetentionPolicy();
    
    if (retentionDays === null) {
      console.log('🔄 Retention policy set to "never" - no cleanup performed');
      return { deleted: 0, cutoffDate: null };
    }

    // Calculate cutoff date
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
    const cutoffISO = cutoffDate.toISOString();

    console.log(`🧹 ${dryRun ? 'DRY RUN: ' : ''}Cleaning up events older than ${retentionDays} days (before ${cutoffDate.toLocaleDateString()})`);

    // Count events to be deleted
    const countStmt = db.prepare(`
      SELECT COUNT(*) as count FROM events 
      WHERE timestamp < ?
    `);
    const { count } = countStmt.get(cutoffISO);

    if (count === 0) {
      console.log('✨ No old events to cleanup');
      return { deleted: 0, cutoffDate: cutoffISO };
    }

    console.log(`📊 Found ${count} events to ${dryRun ? 'be deleted' : 'delete'}`);

    if (!dryRun) {
      // Delete old events
      const deleteStmt = db.prepare(`
        DELETE FROM events WHERE timestamp < ?
      `);
      const result = deleteStmt.run(cutoffISO);
      
      const executionTime = Date.now() - startTime;

      // Log the cleanup
      const logStmt = db.prepare(`
        INSERT INTO cleanup_log (retention_policy, events_deleted, cutoff_date, execution_time_ms)
        VALUES (?, ?, ?, ?)
      `);
      logStmt.run(`${retentionDays}d`, result.changes, cutoffISO, executionTime);

      console.log(`✅ Deleted ${result.changes} old events in ${executionTime}ms`);
      
      // Vacuum database to reclaim space
      console.log('🗜️ Optimizing database...');
      db.exec('VACUUM');
      console.log('✅ Database optimized');

      return { deleted: result.changes, cutoffDate: cutoffISO };
    }

    return { deleted: count, cutoffDate: cutoffISO, dryRun: true };
  }

  getCleanupStats() {
    // Get current database stats
    const totalEvents = db.prepare('SELECT COUNT(*) as count FROM events').get().count;
    const oldestEvent = db.prepare('SELECT MIN(timestamp) as oldest FROM events').get().oldest;
    const newestEvent = db.prepare('SELECT MAX(timestamp) as newest FROM events').get().newest;
    
    // Get cleanup history
    const cleanupHistory = db.prepare(`
      SELECT * FROM cleanup_log 
      ORDER BY cleanup_date DESC 
      LIMIT 10
    `).all();

    const retentionDays = this.getCurrentRetentionPolicy();

    return {
      totalEvents,
      oldestEvent,
      newestEvent,
      currentRetentionPolicy: retentionDays,
      cleanupHistory
    };
  }

  scheduleCleanup(intervalHours = 24) {
    console.log(`⏰ Scheduling automatic cleanup every ${intervalHours} hours`);
    
    const cleanup = () => {
      console.log(`\n🕐 ${new Date().toISOString()} - Running scheduled cleanup...`);
      this.cleanupOldEvents();
    };

    // Run initial cleanup
    cleanup();

    // Schedule recurring cleanup
    setInterval(cleanup, intervalHours * 60 * 60 * 1000);
  }
}

// CLI Interface
function printHelp() {
  console.log(`
📊 Event Cleanup Service

Usage: node cleanup-events.js [command] [options]

Commands:
  cleanup [--dry-run]     Clean up old events
  set-policy <days>       Set retention policy (1, 7, 30, 90, 365, never)
  stats                   Show cleanup statistics
  schedule [hours]        Run cleanup service (default: every 24 hours)
  help                    Show this help

Examples:
  node cleanup-events.js cleanup --dry-run    # Preview what would be deleted
  node cleanup-events.js cleanup              # Delete old events
  node cleanup-events.js set-policy 7         # Keep events for 7 days
  node cleanup-events.js set-policy never     # Never delete events
  node cleanup-events.js stats                # Show database statistics
  node cleanup-events.js schedule 12          # Run cleanup every 12 hours
`);
}

async function main() {
  const service = new EventCleanupService();
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'cleanup':
      const dryRun = args.includes('--dry-run');
      service.cleanupOldEvents(dryRun);
      break;

    case 'set-policy':
      const days = args[1];
      if (!days) {
        console.error('❌ Please specify retention days (1, 7, 30, 90, 365, never)');
        process.exit(1);
      }
      const retentionDays = days === 'never' ? null : parseInt(days);
      if (days !== 'never' && (isNaN(retentionDays) || retentionDays < 1)) {
        console.error('❌ Invalid retention days. Use: 1, 7, 30, 90, 365, or never');
        process.exit(1);
      }
      service.setRetentionPolicy(retentionDays);
      break;

    case 'stats':
      const stats = service.getCleanupStats();
      console.log('\n📊 Event Database Statistics');
      console.log('============================');
      console.log(`Total Events: ${stats.totalEvents}`);
      console.log(`Oldest Event: ${stats.oldestEvent ? new Date(stats.oldestEvent).toLocaleString() : 'None'}`);
      console.log(`Newest Event: ${stats.newestEvent ? new Date(stats.newestEvent).toLocaleString() : 'None'}`);
      console.log(`Retention Policy: ${stats.currentRetentionPolicy === null ? 'Never delete' : stats.currentRetentionPolicy + ' days'}`);
      
      if (stats.cleanupHistory.length > 0) {
        console.log('\n🧹 Recent Cleanup History');
        console.log('--------------------------');
        stats.cleanupHistory.forEach(log => {
          console.log(`${new Date(log.cleanup_date).toLocaleString()}: Deleted ${log.events_deleted} events (${log.retention_policy} policy)`);
        });
      }
      break;

    case 'schedule':
      let hours = parseInt(args[1]) || 24;
      if (hours < 1) hours = 24;
      console.log('🚀 Starting Event Cleanup Service...\n');
      service.scheduleCleanup(hours);
      break;

    case 'help':
    default:
      printHelp();
      break;
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down cleanup service...');
  db.close();
  process.exit(0);
});

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default EventCleanupService;