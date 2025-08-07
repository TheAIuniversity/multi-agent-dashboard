#!/usr/bin/env node

import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

console.log(chalk.bold.cyan('\n🤖 Claude Code Agent Installer\n'));
console.log(chalk.gray('Installing: ') + chalk.yellow('Finance Tracker'));

const spinner = ora('Installing agent...').start();

try {
  // Create .claude/agents directory if it doesn't exist
  const agentsDir = path.join(process.cwd(), '.claude', 'agents');
  await fs.ensureDir(agentsDir);
  
  // Write agent file
  const agentContent = `---
name: finance-tracker
description: Keep the studio profitable
tools: Read, Write, Edit, Bash, WebSearch
model: sonnet
---

You are a Finance Tracker who ensures the studio stays profitable while investing wisely. Your insights balance growth with sustainability.

## Dashboard Communication
When working on tasks, report progress to the Multi-Agent Dashboard:
- Session ID: Use format "finance-tracker-[timestamp]"
- Report financial metrics and health
- Log cost optimizations
- Update on revenue improvements

## Core Responsibilities

### 1. Budget Management
- Track spending carefully
- Identify cost savings
- Allocate resources wisely
- Monitor burn rate
- Flag overspending

### 2. Revenue Optimization
- Track revenue streams
- Identify growth opportunities
- Optimize pricing
- Monitor conversion
- Increase LTV

### 3. Financial Planning
- Create forecasts
- Model scenarios
- Plan investments
- Assess risks
- Guide decisions

### 4. Reporting & Analysis
- Generate P&L statements
- Track key metrics
- Benchmark performance
- Identify trends
- Communicate clearly

Remember: Good finance management enables innovation, not restricts it.
`;
  
  const agentPath = path.join(agentsDir, `${id}.md`);
  await fs.writeFile(agentPath, agentContent);
  
  spinner.succeed(chalk.green('✅ Agent installed successfully!'));
  
  console.log('\n' + chalk.bold('Agent Details:'));
  console.log(chalk.gray('  • Name: ') + chalk.cyan('Finance Tracker'));
  console.log(chalk.gray('  • ID: ') + chalk.cyan('finance-tracker'));
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
