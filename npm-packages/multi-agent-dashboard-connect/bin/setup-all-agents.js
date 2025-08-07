#!/usr/bin/env node

import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

console.log(chalk.bold.cyan('\n🌐 Global Multi-Agent Dashboard Setup\n'));
console.log(chalk.yellow('This will configure ALL Claude Code instances to report to the dashboard\n'));

// The global Claude Code settings path
const globalSettingsPath = path.join(os.homedir(), '.config', 'claude', 'settings.json');
const alternativePath = path.join(os.homedir(), '.claude', 'settings.json');

// Check which path exists
let settingsPath;
if (await fs.pathExists(globalSettingsPath)) {
  settingsPath = globalSettingsPath;
} else if (await fs.pathExists(alternativePath)) {
  settingsPath = alternativePath;
} else {
  // Create the standard path
  settingsPath = alternativePath;
  await fs.ensureDir(path.dirname(settingsPath));
}

// Read existing settings or create new
let settings = {};
if (await fs.pathExists(settingsPath)) {
  settings = await fs.readJson(settingsPath);
}

// Add dashboard hooks to global settings
settings.hooks = {
  'user-prompt-submit-hook': `curl -X POST http://localhost:3001/events -H 'Content-Type: application/json' -d '{"app": "{{app}}", "session_id": "{{session_id}}", "event_type": "UserPromptSubmit", "payload": {"prompt": "{{prompt}}"}, "summary": "User submitted prompt"}'`,
  'pre-tool-use-hook': `curl -X POST http://localhost:3001/events -H 'Content-Type: application/json' -d '{"app": "{{app}}", "session_id": "{{session_id}}", "event_type": "PreToolUse", "payload": {"tool": "{{tool}}", "params": {{params}}}, "summary": "Using {{tool}}"}'`,
  'post-tool-use-hook': `curl -X POST http://localhost:3001/events -H 'Content-Type: application/json' -d '{"app": "{{app}}", "session_id": "{{session_id}}", "event_type": "PostToolUse", "payload": {"tool": "{{tool}}", "result": "{{result}}"}, "summary": "Completed {{tool}}"}'`,
  'stop-hook': `curl -X POST http://localhost:3001/events -H 'Content-Type: application/json' -d '{"app": "{{app}}", "session_id": "{{session_id}}", "event_type": "Stop", "payload": {}, "summary": "Agent stopped"}'`,
  'notification-hook': `curl -X POST http://localhost:3001/events -H 'Content-Type: application/json' -d '{"app": "{{app}}", "session_id": "{{session_id}}", "event_type": "Notification", "payload": {"message": "{{message}}"}, "summary": "{{message}}"}'`
};

// Write updated settings
await fs.writeJson(settingsPath, settings, { spaces: 2 });

console.log(chalk.green('✅ Global dashboard connection configured!'));
console.log(chalk.gray('\nSettings location: ') + chalk.cyan(settingsPath));
console.log('\n' + chalk.bold('What this means:'));
console.log('  • ALL Claude Code instances will report to dashboard');
console.log('  • Works across multiple terminals');
console.log('  • Parallel agents all tracked');
console.log('  • No per-terminal setup needed');
console.log('\n' + chalk.yellow('⚠️  Remember to start the dashboard first:'));
console.log(chalk.cyan('  npx multi-agent-dashboard-connect'));