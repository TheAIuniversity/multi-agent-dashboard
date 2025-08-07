#!/usr/bin/env node

import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

console.log(chalk.bold.cyan('\n🤖 Claude Code Agent Installer\n'));
console.log(chalk.gray('Installing: ') + chalk.yellow('Infrastructure Maintainer'));

const spinner = ora('Installing agent...').start();

try {
  // Create .claude/agents directory if it doesn't exist
  const agentsDir = path.join(process.cwd(), '.claude', 'agents');
  await fs.ensureDir(agentsDir);
  
  // Write agent file
  const agentContent = `---
name: infrastructure-maintainer
description: Scale without breaking the bank
tools: Read, Write, Edit, Bash, WebSearch
model: sonnet
---

You are an Infrastructure Maintainer who keeps systems running smoothly at scale. Your work is invisible until it isn't.

## Dashboard Communication
When working on tasks, report progress to the Multi-Agent Dashboard:
- Session ID: Use format "infrastructure-maintainer-[timestamp]"
- Report system health and improvements
- Log cost optimizations
- Update on security enhancements

## Core Responsibilities

### 1. Reliability Engineering
- Ensure high uptime
- Plan redundancy
- Automate recovery
- Monitor proactively
- Prevent failures

### 2. Cost Optimization
- Right-size resources
- Use spot instances
- Optimize storage
- Reduce waste
- Track spending

### 3. Performance Tuning
- Optimize queries
- Cache effectively
- Balance loads
- Reduce latency
- Scale efficiently

### 4. Security & Compliance
- Patch regularly
- Monitor threats
- Encrypt data
- Control access
- Maintain compliance

Remember: The best infrastructure is boring infrastructure - it just works.
`;
  
  const agentPath = path.join(agentsDir, `${id}.md`);
  await fs.writeFile(agentPath, agentContent);
  
  spinner.succeed(chalk.green('✅ Agent installed successfully!'));
  
  console.log('\n' + chalk.bold('Agent Details:'));
  console.log(chalk.gray('  • Name: ') + chalk.cyan('Infrastructure Maintainer'));
  console.log(chalk.gray('  • ID: ') + chalk.cyan('infrastructure-maintainer'));
  console.log(chalk.gray('  • Location: ') + chalk.cyan(agentPath));
  
  console.log('\n' + chalk.yellow('ℹ️  The agent is now available in Claude Code'));
  console.log(chalk.gray('It will be automatically triggered when relevant tasks are detected.\n'));
  
  // Optional: Connect to dashboard
  console.log(chalk.dim('To monitor this agent, run: npx multi-agent-dashboard-connect'));
  
} catch (error) {
  spinner.fail(chalk.red('Failed to install agent'));
  console.error(chalk.red(error.message));
  process.exit(1);
}
