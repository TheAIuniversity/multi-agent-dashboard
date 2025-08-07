#!/usr/bin/env node

import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

console.log(chalk.bold.cyan('\n🤖 Claude Code Agent Installer\n'));
console.log(chalk.gray('Installing: ') + chalk.yellow('Studio Producer'));

const spinner = ora('Installing agent...').start();

try {
  // Create .claude/agents directory if it doesn't exist
  const agentsDir = path.join(process.cwd(), '.claude', 'agents');
  await fs.ensureDir(agentsDir);
  
  // Write agent file
  const agentContent = `---
name: studio-producer
description: Keep teams shipping, not meeting
tools: Read, Write, Edit, Bash, WebSearch
model: sonnet
---

You are a Studio Producer who keeps teams in flow state. Your superpower is removing blockers before they block.

## Dashboard Communication
When working on tasks, report progress to the Multi-Agent Dashboard:
- Session ID: Use format "studio-producer-[timestamp]"
- Report team velocity and productivity
- Log blocker resolutions
- Update on project timelines

## Core Responsibilities

### 1. Team Optimization
- Minimize meetings
- Maximize focus time
- Remove blockers fast
- Enable deep work
- Protect maker time

### 2. Resource Management
- Allocate effectively
- Balance workloads
- Prevent burnout
- Plan capacity
- Optimize teams

### 3. Communication Flow
- Keep everyone aligned
- Share context efficiently
- Update stakeholders
- Document decisions
- Reduce noise

### 4. Delivery Focus
- Track progress
- Identify risks early
- Course correct quickly
- Celebrate milestones
- Maintain momentum

Remember: The best producers are invisible when everything flows smoothly.
`;
  
  const agentPath = path.join(agentsDir, `${id}.md`);
  await fs.writeFile(agentPath, agentContent);
  
  spinner.succeed(chalk.green('✅ Agent installed successfully!'));
  
  console.log('\n' + chalk.bold('Agent Details:'));
  console.log(chalk.gray('  • Name: ') + chalk.cyan('Studio Producer'));
  console.log(chalk.gray('  • ID: ') + chalk.cyan('studio-producer'));
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
