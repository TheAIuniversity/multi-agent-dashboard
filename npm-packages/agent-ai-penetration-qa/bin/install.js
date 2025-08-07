#!/usr/bin/env node

import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Parse command line arguments
const args = process.argv.slice(2);
const shouldAutoConfirm = args.includes('--yes') || args.includes('-y');

console.log(chalk.bold.cyan('\n🤖 Claude Code Agent Installer\n'));
console.log(chalk.gray('Installing: ') + chalk.yellow('AI Penetration QA'));

const spinner = ora('Installing agent...').start();

try {
  // Create .claude/agents directory if it doesn't exist
  const agentsDir = path.join(process.cwd(), '.claude', 'agents');
  await fs.ensureDir(agentsDir);
  
  // Write agent file
  const agentContent = `---
name: ai-penetration-qa
description: Break things before users do with AI-powered testing
tools: Read, Write, Edit, Bash, WebSearch
model: sonnet
---

You are an AI Penetration QA specialist who finds and exploits weaknesses before they reach production. You think like an attacker to build better defenses.

## Dashboard Communication
When working on tasks, report progress to the Multi-Agent Dashboard:
- Session ID: Use format "ai-penetration-qa-[timestamp]"
- Report vulnerabilities discovered
- Log prompt injection attempts
- Update on chaos test results
- Track security improvements

## Core Responsibilities

### 1. Security Testing
- Test for prompt injections
- Find data exfiltration paths
- Detect authorization bypasses
- Test rate limiting
- Validate input sanitization

### 2. Chaos Engineering
- Simulate system failures
- Test error handling
- Create edge cases
- Stress test limits
- Break assumptions

### 3. Fuzz Testing
- Generate random inputs
- Test boundary conditions
- Find parsing errors
- Discover crashes
- Validate error messages

### 4. AI Safety
- Test model behaviors
- Find harmful outputs
- Validate content filters
- Test safety measures
- Document failure modes

Remember: If it can break, it will break. Find it first.
`;
  
  const agentPath = path.join(agentsDir, 'ai-penetration-qa.md');
  await fs.writeFile(agentPath, agentContent);
  
  spinner.succeed(chalk.green('✅ Agent installed successfully!'));
  
  // Configure dashboard hooks
  spinner.start('Configuring dashboard connection...');
  await configureDashboardHooks();
  spinner.succeed(chalk.green('✅ Dashboard hooks configured!'));
  
  console.log('\n' + chalk.bold('Agent Details:'));
  console.log(chalk.gray('  • Name: ') + chalk.cyan('AI Penetration QA'));
  console.log(chalk.gray('  • ID: ') + chalk.cyan('ai-penetration-qa'));
  console.log(chalk.gray('  • Location: ') + chalk.cyan(agentPath));
  console.log(chalk.gray('  • Dashboard: ') + chalk.cyan('Auto-connected via hooks'));
  
  console.log('\n' + chalk.yellow('ℹ️  The agent is now available in Claude Code'));
  console.log(chalk.gray('It will be automatically triggered when relevant tasks are detected.'));
  
  // Check if dashboard is running
  try {
    const response = await fetch('http://localhost:3001/health').catch(() => null);
    if (!response || !response.ok) {
      console.log('\n' + chalk.yellow('⚠️  Dashboard not running. Start it with:'));
      console.log(chalk.cyan('    npx multi-agent-dashboard-connect@latest'));
    } else {
      console.log('\n' + chalk.green('✅ Dashboard is running and will track this agent!'));
    }
  } catch (e) {
    console.log('\n' + chalk.yellow('⚠️  Dashboard not running. Start it with:'));
    console.log(chalk.cyan('    npx multi-agent-dashboard-connect@latest'));
  }
  
  console.log('\n' + chalk.bold.green('🎉 Setup Complete!'));
  console.log(chalk.gray('Remember to restart Claude Code for hooks to take effect.\n'));
  
} catch (error) {
  spinner.fail(chalk.red('Failed to install agent'));
  console.error(chalk.red(error.message));
  process.exit(1);
}

async function configureDashboardHooks() {
  const settingsPath = path.join(os.homedir(), '.claude', 'settings.json');
  const hookScriptPath = path.join(os.homedir(), '.claude', 'hooks', 'dashboard-hook.py');
  
  // Ensure directories exist
  await fs.ensureDir(path.join(os.homedir(), '.claude'));
  await fs.ensureDir(path.join(os.homedir(), '.claude', 'hooks'));
  
  // Create Python hook script
  const hookScript = `#!/usr/bin/env python3
"""
Claude Code Dashboard Hook - Auto-configured by AI Penetration QA Agent
"""

import json
import sys
import urllib.request
import urllib.error
from datetime import datetime
import os

def send_event_to_dashboard(event_data):
    """Send event data to the Multi-Agent Dashboard."""
    server_url = 'http://localhost:3001/events'
    
    try:
        req = urllib.request.Request(
            server_url,
            data=json.dumps(event_data).encode('utf-8'),
            headers={
                'Content-Type': 'application/json',
                'User-Agent': 'Claude-Code-Agent-Hook/1.0'
            }
        )
        
        with urllib.request.urlopen(req, timeout=2) as response:
            return response.status == 200
            
    except (urllib.error.URLError, TimeoutError):
        # Silently fail to not interrupt Claude Code
        return False

def main():
    try:
        # Read hook input from stdin
        hook_input = json.load(sys.stdin)
    except:
        # If no valid JSON, exit silently
        sys.exit(0)
    
    # Extract event information
    session_id = hook_input.get("session_id", "unknown")
    hook_event_name = hook_input.get("hook_event_name", "unknown")
    tool_name = hook_input.get("tool_name", "")
    tool_input = hook_input.get("tool_input", {})
    tool_response = hook_input.get("tool_response", {})
    
    # Get app name - include agent name
    app_name = os.environ.get("APP_NAME", "ai-penetration-qa-agent")
    
    # Prepare event data for dashboard
    event_data = {
        "app": app_name,
        "session_id": session_id,
        "event_type": hook_event_name,
        "timestamp": datetime.now().isoformat(),
        "payload": {
            "tool": tool_name,
            "params": tool_input,
            "result": tool_response if hook_event_name == "PostToolUse" else None,
            "hook_event": hook_event_name,
            "agent": "ai-penetration-qa"
        },
        "summary": f"AI Penetration QA: {hook_event_name}"
    }
    
    # Send to dashboard
    send_event_to_dashboard(event_data)
    
    # Always exit successfully to not block Claude Code
    sys.exit(0)

if __name__ == "__main__":
    main()
`;
  
  await fs.writeFile(hookScriptPath, hookScript);
  await fs.chmod(hookScriptPath, '755');
  
  // Read existing settings or create new
  let settings = {};
  if (await fs.pathExists(settingsPath)) {
    try {
      settings = await fs.readJson(settingsPath);
    } catch (e) {
      settings = {};
    }
  }
  
  // Configure hooks in the correct Claude Code format
  if (!settings.hooks) {
    settings.hooks = {};
  }
  
  // Add dashboard hooks for all events
  const hookCommand = `python3 ${hookScriptPath}`;
  const events = ['PreToolUse', 'PostToolUse', 'UserPromptSubmit', 'Stop'];
  
  for (const event of events) {
    if (!settings.hooks[event]) {
      settings.hooks[event] = [];
    }
    
    // Check if hook already exists
    const existingHook = settings.hooks[event].find(h => 
      h.hooks && h.hooks.some(hook => 
        hook.command && hook.command.includes('dashboard-hook.py')
      )
    );
    
    if (!existingHook) {
      settings.hooks[event].push({
        hooks: [{
          type: 'command',
          command: hookCommand
        }]
      });
    }
  }
  
  // Write updated settings
  await fs.writeJson(settingsPath, settings, { spaces: 2 });
}