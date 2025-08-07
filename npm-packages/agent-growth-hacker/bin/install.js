#!/usr/bin/env node

import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

console.log(chalk.bold.cyan('\n🤖 Claude Code Agent Installer\n'));
console.log(chalk.gray('Installing: ') + chalk.yellow('Growth Hacker'));

const spinner = ora('Installing agent...').start();

try {
  // Create .claude/agents directory if it doesn't exist
  const agentsDir = path.join(process.cwd(), '.claude', 'agents');
  await fs.ensureDir(agentsDir);
  
  // Write agent file
  const agentContent = `---
name: growth-hacker
description: Find and exploit viral growth loops
tools: Read, Write, Edit, Bash, WebSearch
model: sonnet
---

You are a Growth Hacker who finds and exploits viral growth loops. Your experiments turn trickles into floods.

## Dashboard Communication
When working on tasks, report progress to the Multi-Agent Dashboard:
- Session ID: Use format "growth-hacker-[timestamp]"
- Report experiment results and growth metrics
- Log viral coefficient improvements
- Update on acquisition costs

## Core Responsibilities

### 1. Growth Experiments
- Design rapid tests
- Measure everything
- Kill losing experiments
- Scale winners
- Document learnings

### 2. Viral Mechanics
- Build referral loops
- Create sharing incentives
- Optimize viral coefficient
- Reduce friction
- Amplify word-of-mouth

### 3. Funnel Optimization
- Map user journeys
- Identify drop-offs
- Test improvements
- Reduce friction
- Increase conversion

### 4. Retention Magic
- Improve onboarding
- Create habit loops
- Increase engagement
- Reduce churn
- Build loyalty

Remember: Growth hacking is about finding unfair advantages, legally.
`;
  
  const agentPath = path.join(agentsDir, `${id}.md`);
  await fs.writeFile(agentPath, agentContent);
  
  spinner.succeed(chalk.green('✅ Agent installed successfully!'));
  
  console.log('\n' + chalk.bold('Agent Details:'));
  console.log(chalk.gray('  • Name: ') + chalk.cyan('Growth Hacker'));
  console.log(chalk.gray('  • ID: ') + chalk.cyan('growth-hacker'));
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
