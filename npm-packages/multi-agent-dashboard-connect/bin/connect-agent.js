#!/usr/bin/env node

import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

// Standalone script to connect any Claude Code instance to the dashboard
console.log(chalk.bold.cyan('\n🔗 Connecting Agent to Dashboard\n'));

const DASHBOARD_URL = process.env.CLAUDE_DASHBOARD_URL || 'http://localhost:3001';
const WS_URL = process.env.CLAUDE_WS_URL || 'ws://localhost:8766';

// Create hooks configuration for THIS Claude Code instance
const hooks = {
  'user-prompt-submit-hook': `curl -X POST ${DASHBOARD_URL}/events -H 'Content-Type: application/json' -d '{"app": "{{app}}", "session_id": "{{session_id}}", "event_type": "UserPromptSubmit", "payload": {"prompt": "{{prompt}}"}, "summary": "User submitted prompt"}'`,
  'pre-tool-use-hook': `curl -X POST ${DASHBOARD_URL}/events -H 'Content-Type: application/json' -d '{"app": "{{app}}", "session_id": "{{session_id}}", "event_type": "PreToolUse", "payload": {"tool": "{{tool}}", "params": {{params}}}, "summary": "Using {{tool}}"}'`,
  'post-tool-use-hook': `curl -X POST ${DASHBOARD_URL}/events -H 'Content-Type: application/json' -d '{"app": "{{app}}", "session_id": "{{session_id}}", "event_type": "PostToolUse", "payload": {"tool": "{{tool}}", "result": "{{result}}"}, "summary": "Completed {{tool}}"}'`,
  'stop-hook': `curl -X POST ${DASHBOARD_URL}/events -H 'Content-Type: application/json' -d '{"app": "{{app}}", "session_id": "{{session_id}}", "event_type": "Stop", "payload": {}, "summary": "Agent stopped"}'`
};

// Write hooks config for Claude Code
const configPath = path.join(os.homedir(), '.claude', 'settings', 'hooks.json');
await fs.ensureDir(path.dirname(configPath));
await fs.writeJson(configPath, { hooks }, { spaces: 2 });

console.log(chalk.green('✅ Agent connected to dashboard!'));
console.log(chalk.gray('\nDashboard URL: ') + chalk.cyan(DASHBOARD_URL));
console.log(chalk.gray('WebSocket URL: ') + chalk.cyan(WS_URL));
console.log(chalk.gray('Hooks config: ') + chalk.cyan(configPath));
console.log('\n' + chalk.yellow('This Claude Code instance will now report to the dashboard'));