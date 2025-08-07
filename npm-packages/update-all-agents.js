#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Agent configurations
const agents = [
  { dir: 'agent-analytics-reporter', name: 'Analytics Reporter', id: 'analytics-reporter' },
  { dir: 'agent-anomaly-detector', name: 'Anomaly Detection Specialist', id: 'anomaly-detector' },
  { dir: 'agent-api-devrel-writer', name: 'API DevRel Writer', id: 'api-devrel-writer' },
  { dir: 'agent-api-tester', name: 'API Tester', id: 'api-tester' },
  { dir: 'agent-app-store-optimizer', name: 'App Store Optimizer', id: 'app-store-optimizer' },
  { dir: 'agent-backend-architect', name: 'Backend Architect', id: 'backend-architect' },
  { dir: 'agent-backtesting-engine', name: 'Backtesting Engine', id: 'backtesting-engine' },
  { dir: 'agent-brand-guardian', name: 'Brand Guardian', id: 'brand-guardian' },
  { dir: 'agent-claude-team-orchestrator', name: 'Claude Team Orchestrator', id: 'claude-team-orchestrator' },
  { dir: 'agent-claude-ux-engineer', name: 'Claude UX Engineer', id: 'claude-ux-engineer' },
  { dir: 'agent-cloud-architect', name: 'Cloud Architect', id: 'cloud-architect' },
  { dir: 'agent-code-reviewer', name: 'Code Reviewer', id: 'code-reviewer' },
  { dir: 'agent-content-creator', name: 'Content Creator', id: 'content-creator' },
  { dir: 'agent-data-engineer', name: 'Data Engineer', id: 'data-engineer' },
  { dir: 'agent-data-payments-integration', name: 'Data Payments Integration', id: 'data-payments-integration' },
  { dir: 'agent-data-visualizer', name: 'Data Visualizer', id: 'data-visualizer' },
  { dir: 'agent-database-specialist', name: 'Database Specialist', id: 'database-specialist' },
  { dir: 'agent-dataops-ai', name: 'DataOps AI', id: 'dataops-ai' },
  { dir: 'agent-debugging-specialist', name: 'Debugging Specialist', id: 'debugging-specialist' },
  { dir: 'agent-devops-automator', name: 'DevOps Automator', id: 'devops-automator' },
  { dir: 'agent-devops-troubleshooter', name: 'DevOps Troubleshooter', id: 'devops-troubleshooter' },
  { dir: 'agent-devsecops-compliance', name: 'DevSecOps Compliance', id: 'devsecops-compliance' },
  { dir: 'agent-etl-pipeline-builder', name: 'ETL Pipeline Builder', id: 'etl-pipeline-builder' },
  { dir: 'agent-experiment-tracker', name: 'Experiment Tracker', id: 'experiment-tracker' },
  { dir: 'agent-feedback-synthesizer', name: 'Feedback Synthesizer', id: 'feedback-synthesizer' },
  { dir: 'agent-finance-tracker', name: 'Finance Tracker', id: 'finance-tracker' },
  { dir: 'agent-frontend-developer', name: 'Frontend Developer', id: 'frontend-developer' },
  { dir: 'agent-globalization-agent', name: 'Globalization Agent', id: 'globalization-agent' },
  { dir: 'agent-graphql-architect', name: 'GraphQL Architect', id: 'graphql-architect' },
  { dir: 'agent-growth-hacker', name: 'Growth Hacker', id: 'growth-hacker' },
  { dir: 'agent-hypothesis-tester', name: 'Hypothesis Tester', id: 'hypothesis-tester' },
  { dir: 'agent-incident-responder', name: 'Incident Responder', id: 'incident-responder' },
  { dir: 'agent-infrastructure-maintainer', name: 'Infrastructure Maintainer', id: 'infrastructure-maintainer' },
  { dir: 'agent-legal-compliance-checker', name: 'Legal Compliance Checker', id: 'legal-compliance-checker' },
  { dir: 'agent-literature-reviewer', name: 'Literature Reviewer', id: 'literature-reviewer' },
  { dir: 'agent-market-analyzer', name: 'Market Analyzer', id: 'market-analyzer' },
  { dir: 'agent-ml-engineer', name: 'ML Engineer', id: 'ml-engineer' },
  { dir: 'agent-mobile-app-builder', name: 'Mobile App Builder', id: 'mobile-app-builder' },
  { dir: 'agent-network-engineer', name: 'Network Engineer', id: 'network-engineer' },
  { dir: 'agent-performance-benchmarker', name: 'Performance Benchmarker', id: 'performance-benchmarker' },
  { dir: 'agent-portfolio-optimizer', name: 'Portfolio Optimizer', id: 'portfolio-optimizer' },
  { dir: 'agent-principal-architect', name: 'Principal Architect', id: 'principal-architect' },
  { dir: 'agent-project-shipper', name: 'Project Shipper', id: 'project-shipper' },
  { dir: 'agent-prompt-engineer', name: 'Prompt Engineer', id: 'prompt-engineer' },
  { dir: 'agent-python-backend-specialist', name: 'Python Backend Specialist', id: 'python-backend-specialist' },
  { dir: 'agent-rapid-prototyper', name: 'Rapid Prototyper', id: 'rapid-prototyper' },
  { dir: 'agent-react-specialist', name: 'React Specialist', id: 'react-specialist' },
  { dir: 'agent-research-data-collector', name: 'Research Data Collector', id: 'research-data-collector' },
  { dir: 'agent-risk-assessor', name: 'Risk Assessor', id: 'risk-assessor' },
  { dir: 'agent-security-specialist', name: 'Security Specialist', id: 'security-specialist' },
  { dir: 'agent-sprint-prioritizer', name: 'Sprint Prioritizer', id: 'sprint-prioritizer' },
  { dir: 'agent-statistical-analyst', name: 'Statistical Analyst', id: 'statistical-analyst' },
  { dir: 'agent-studio-coach', name: 'Studio Coach', id: 'studio-coach' },
  { dir: 'agent-studio-producer', name: 'Studio Producer', id: 'studio-producer' },
  { dir: 'agent-support-responder', name: 'Support Responder', id: 'support-responder' },
  { dir: 'agent-task-decomposition-expert', name: 'Task Decomposition Expert', id: 'task-decomposition-expert' },
  { dir: 'agent-terraform-specialist', name: 'Terraform Specialist', id: 'terraform-specialist' },
  { dir: 'agent-test-results-analyzer', name: 'Test Results Analyzer', id: 'test-results-analyzer' },
  { dir: 'agent-test-writer-fixer', name: 'Test Writer Fixer', id: 'test-writer-fixer' },
  { dir: 'agent-tool-evaluator', name: 'Tool Evaluator', id: 'tool-evaluator' },
  { dir: 'agent-trend-researcher', name: 'Trend Researcher', id: 'trend-researcher' },
  { dir: 'agent-ui-designer', name: 'UI Designer', id: 'ui-designer' },
  { dir: 'agent-ux-researcher', name: 'UX Researcher', id: 'ux-researcher' },
  { dir: 'agent-visual-storyteller', name: 'Visual Storyteller', id: 'visual-storyteller' },
  { dir: 'agent-whimsy-injector', name: 'Whimsy Injector', id: 'whimsy-injector' },
  { dir: 'agent-workflow-optimizer', name: 'Workflow Optimizer', id: 'workflow-optimizer' },
  { dir: 'agent-ai-penetration-qa', name: 'AI Penetration QA', id: 'ai-penetration-qa' }
];

async function updateAgent(agent) {
  const agentPath = path.join(__dirname, agent.dir);
  
  // Update package.json
  const pkgPath = path.join(agentPath, 'package.json');
  const pkg = await fs.readJson(pkgPath);
  pkg.version = '2.0.0';
  pkg.type = 'module';
  pkg.repository = {
    type: 'git',
    url: 'https://github.com/TheAIuniversity/multi-agent-dashboard.git'
  };
  await fs.writeJson(pkgPath, pkg, { spaces: 2 });
  
  // Read current install.js to get the agent content
  const installPath = path.join(agentPath, 'bin', 'install.js');
  const currentInstall = await fs.readFile(installPath, 'utf-8');
  
  // Extract agent content from current file
  const contentMatch = currentInstall.match(/const agentContent = `([\s\S]*?)`;/);
  const agentContent = contentMatch ? contentMatch[1] : `---
name: ${agent.id}
description: AI Agent
tools: Read, Write, Edit, Bash, WebSearch
model: sonnet
---

You are an AI agent.`;

  // Create new install.js with dashboard hooks
  const newInstall = `#!/usr/bin/env node

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

console.log(chalk.bold.cyan('\\n🤖 Claude Code Agent Installer\\n'));
console.log(chalk.gray('Installing: ') + chalk.yellow('${agent.name}'));

const spinner = ora('Installing agent...').start();

try {
  // Create .claude/agents directory if it doesn't exist
  const agentsDir = path.join(process.cwd(), '.claude', 'agents');
  await fs.ensureDir(agentsDir);
  
  // Write agent file
  const agentContent = \`${agentContent}\`;
  
  const agentPath = path.join(agentsDir, '${agent.id}.md');
  await fs.writeFile(agentPath, agentContent);
  
  spinner.succeed(chalk.green('✅ Agent installed successfully!'));
  
  // Configure dashboard hooks
  spinner.start('Configuring dashboard connection...');
  await configureDashboardHooks();
  spinner.succeed(chalk.green('✅ Dashboard hooks configured!'));
  
  console.log('\\n' + chalk.bold('Agent Details:'));
  console.log(chalk.gray('  • Name: ') + chalk.cyan('${agent.name}'));
  console.log(chalk.gray('  • ID: ') + chalk.cyan('${agent.id}'));
  console.log(chalk.gray('  • Location: ') + chalk.cyan(agentPath));
  console.log(chalk.gray('  • Dashboard: ') + chalk.cyan('Auto-connected via hooks'));
  
  console.log('\\n' + chalk.yellow('ℹ️  The agent is now available in Claude Code'));
  console.log(chalk.gray('It will be automatically triggered when relevant tasks are detected.'));
  
  // Check if dashboard is running
  try {
    const response = await fetch('http://localhost:3001/health').catch(() => null);
    if (!response || !response.ok) {
      console.log('\\n' + chalk.yellow('⚠️  Dashboard not running. Start it with:'));
      console.log(chalk.cyan('    npx multi-agent-dashboard-connect@latest'));
    } else {
      console.log('\\n' + chalk.green('✅ Dashboard is running and will track this agent!'));
    }
  } catch (e) {
    console.log('\\n' + chalk.yellow('⚠️  Dashboard not running. Start it with:'));
    console.log(chalk.cyan('    npx multi-agent-dashboard-connect@latest'));
  }
  
  console.log('\\n' + chalk.bold.green('🎉 Setup Complete!'));
  console.log(chalk.gray('Remember to restart Claude Code for hooks to take effect.\\n'));
  
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
  const hookScript = \`#!/usr/bin/env python3
"""
Claude Code Dashboard Hook - Auto-configured by ${agent.name} Agent
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
    app_name = os.environ.get("APP_NAME", "${agent.id}-agent")
    
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
            "agent": "${agent.id}"
        },
        "summary": f"${agent.name}: {hook_event_name}"
    }
    
    # Send to dashboard
    send_event_to_dashboard(event_data)
    
    # Always exit successfully to not block Claude Code
    sys.exit(0)

if __name__ == "__main__":
    main()
\`;
  
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
  const hookCommand = \`python3 \${hookScriptPath}\`;
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
}`;

  await fs.writeFile(installPath, newInstall);
  console.log(`✅ Updated ${agent.name}`);
}

async function publishAgent(agent) {
  const agentPath = path.join(__dirname, agent.dir);
  try {
    execSync('npm publish', { cwd: agentPath, stdio: 'ignore' });
    console.log(`📦 Published ${agent.name} to NPM`);
    return true;
  } catch (e) {
    console.log(`❌ Failed to publish ${agent.name} (may be rate limited)`);
    return false;
  }
}

async function main() {
  console.log('🚀 Updating all 67 agents...\n');
  
  // Update all agents
  for (const agent of agents) {
    await updateAgent(agent);
  }
  
  console.log('\n📦 Publishing to NPM...\n');
  
  // Publish all agents with delay to avoid rate limiting
  let publishedCount = 0;
  let failedCount = 0;
  
  for (const agent of agents) {
    const success = await publishAgent(agent);
    if (success) {
      publishedCount++;
    } else {
      failedCount++;
    }
    
    // Add delay to avoid rate limiting
    if (publishedCount % 5 === 0) {
      console.log('⏳ Waiting to avoid rate limiting...');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
  
  console.log(`\n✅ Complete! Published ${publishedCount} agents, ${failedCount} failed.`);
  if (failedCount > 0) {
    console.log('Run this script again later to publish the remaining agents.');
  }
}

main().catch(console.error);