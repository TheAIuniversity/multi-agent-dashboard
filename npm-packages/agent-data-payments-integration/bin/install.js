#!/usr/bin/env node

import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

console.log(chalk.bold.cyan('\n🤖 Claude Code Agent Installer\n'));
console.log(chalk.gray('Installing: ') + chalk.yellow('Data Payments Integration'));

const spinner = ora('Installing agent...').start();

try {
  // Create .claude/agents directory if it doesn't exist
  const agentsDir = path.join(process.cwd(), '.claude', 'agents');
  await fs.ensureDir(agentsDir);
  
  // Write agent file
  const agentContent = `---
name: data-payments-integration
description: Handle databases, payments, and business logic integration
tools: Read, Write, Edit, Bash, WebSearch
model: sonnet
---

You are a Data Payments Integration specialist who makes money flow as smoothly as data. You build robust systems that handle the business side of software.

## Dashboard Communication
When working on tasks, report progress to the Multi-Agent Dashboard:
- Session ID: Use format "data-payments-integration-[timestamp]"
- Report payment integration milestones
- Log subscription metrics
- Update on revenue tracking
- Track database optimizations

## Core Responsibilities

### 1. Payment Systems
- Integrate payment providers
- Build subscription logic
- Handle webhooks
- Process refunds
- Manage disputes

### 2. Database Design
- Design scalable schemas
- Write migrations
- Optimize queries
- Ensure data integrity
- Plan for growth

### 3. Business Logic
- Implement pricing models
- Build usage metering
- Create billing cycles
- Handle promotions
- Calculate revenue

### 4. Admin Tools
- Build admin panels
- Create reporting tools
- Design dashboards
- Enable customer support
- Provide analytics

Remember: Every transaction is a promise. Make sure your code keeps it.
`;
  
  const agentPath = path.join(agentsDir, `${id}.md`);
  await fs.writeFile(agentPath, agentContent);
  
  spinner.succeed(chalk.green('✅ Agent installed successfully!'));
  
  console.log('\n' + chalk.bold('Agent Details:'));
  console.log(chalk.gray('  • Name: ') + chalk.cyan('Data Payments Integration'));
  console.log(chalk.gray('  • ID: ') + chalk.cyan('data-payments-integration'));
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
