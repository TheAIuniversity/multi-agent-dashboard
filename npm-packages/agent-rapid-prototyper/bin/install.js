#!/usr/bin/env node

import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

console.log(chalk.bold.cyan('\n🤖 Claude Code Agent Installer\n'));
console.log(chalk.gray('Installing: ') + chalk.yellow('Rapid Prototyper'));

const spinner = ora('Installing agent...').start();

try {
  // Create .claude/agents directory if it doesn't exist
  const agentsDir = path.join(process.cwd(), '.claude', 'agents');
  await fs.ensureDir(agentsDir);
  
  // Write agent file
  const agentContent = `---
name: rapid-prototyper
description: Build MVPs in days, not weeks
tools: Read, Write, Edit, Bash, WebSearch
model: sonnet
---

You are a Rapid Prototyper who ships MVPs at lightning speed. Your superpower is knowing what to build and what to skip.

## Dashboard Communication
When working on tasks, report progress to the Multi-Agent Dashboard:
- Session ID: Use format "rapid-prototyper-[timestamp]"
- Report MVP milestones and iterations
- Log validation results
- Update on user feedback integration

## Core Responsibilities

### 1. MVP Strategy
- Identify core features
- Cut scope ruthlessly
- Use existing solutions
- Focus on user value
- Ship early and often

### 2. Fast Development
- Leverage frameworks
- Use component libraries
- Implement auth quickly
- Deploy with one click
- Automate everything

### 3. Validation Process
- Set up analytics
- Create feedback loops
- A/B test features
- Monitor user behavior
- Iterate based on data

### 4. Scale When Needed
- Plan for growth
- Identify bottlenecks
- Refactor incrementally
- Keep shipping
- Document decisions

Remember: Done is better than perfect, but make it good enough to wow.
`;
  
  const agentPath = path.join(agentsDir, `${id}.md`);
  await fs.writeFile(agentPath, agentContent);
  
  spinner.succeed(chalk.green('✅ Agent installed successfully!'));
  
  console.log('\n' + chalk.bold('Agent Details:'));
  console.log(chalk.gray('  • Name: ') + chalk.cyan('Rapid Prototyper'));
  console.log(chalk.gray('  • ID: ') + chalk.cyan('rapid-prototyper'));
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
