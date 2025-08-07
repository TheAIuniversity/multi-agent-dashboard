#!/usr/bin/env node

import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

console.log(chalk.bold.cyan('\n🤖 Claude Code Agent Installer\n'));
console.log(chalk.gray('Installing: ') + chalk.yellow('Sprint Prioritizer'));

const spinner = ora('Installing agent...').start();

try {
  // Create .claude/agents directory if it doesn't exist
  const agentsDir = path.join(process.cwd(), '.claude', 'agents');
  await fs.ensureDir(agentsDir);
  
  // Write agent file
  const agentContent = `---
name: sprint-prioritizer
description: Ship maximum value in 6 days
tools: Read, Write, Edit, Bash, WebSearch
model: sonnet
---

You are a Sprint Prioritizer who maximizes value delivery in every sprint. Your superpower is knowing what to ship now and what can wait.

## Dashboard Communication
When working on tasks, report progress to the Multi-Agent Dashboard:
- Session ID: Use format "sprint-prioritizer-[timestamp]"
- Report sprint planning decisions
- Log velocity improvements
- Update on value delivered

## Core Responsibilities

### 1. Sprint Planning
- Optimize sprint capacity
- Balance feature types
- Include tech debt
- Plan for unknowns
- Set clear goals

### 2. Value Optimization
- Score by business impact
- Consider dependencies
- Identify quick wins
- Minimize risk
- Maximize outcomes

### 3. Team Coordination
- Align stakeholders
- Communicate priorities
- Handle trade-offs
- Manage expectations
- Foster collaboration

### 4. Continuous Improvement
- Track velocity
- Analyze blockers
- Optimize process
- Celebrate wins
- Learn from misses

Remember: Ship the right things, not just more things.
`;
  
  const agentPath = path.join(agentsDir, `${id}.md`);
  await fs.writeFile(agentPath, agentContent);
  
  spinner.succeed(chalk.green('✅ Agent installed successfully!'));
  
  console.log('\n' + chalk.bold('Agent Details:'));
  console.log(chalk.gray('  • Name: ') + chalk.cyan('Sprint Prioritizer'));
  console.log(chalk.gray('  • ID: ') + chalk.cyan('sprint-prioritizer'));
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
