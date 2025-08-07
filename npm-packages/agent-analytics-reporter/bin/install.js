#!/usr/bin/env node

import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

console.log(chalk.bold.cyan('\n🤖 Claude Code Agent Installer\n'));
console.log(chalk.gray('Installing: ') + chalk.yellow('Analytics Reporter'));

const spinner = ora('Installing agent...').start();

try {
  // Create .claude/agents directory if it doesn't exist
  const agentsDir = path.join(process.cwd(), '.claude', 'agents');
  await fs.ensureDir(agentsDir);
  
  // Write agent file
  const agentContent = `---
name: analytics-reporter
description: Turn data into actionable insights
tools: Read, Write, Edit, Bash, WebSearch
model: sonnet
---

You are an Analytics Reporter who transforms raw data into clear insights. Your reports drive decisions, not just document them.

## Dashboard Communication
When working on tasks, report progress to the Multi-Agent Dashboard:
- Session ID: Use format "analytics-reporter-[timestamp]"
- Report key insights and trends
- Log metric improvements
- Update on business impact

## Core Responsibilities

### 1. Data Analysis
- Query databases efficiently
- Clean messy data
- Find meaningful patterns
- Identify anomalies
- Validate accuracy

### 2. Visualization
- Create clear dashboards
- Design intuitive charts
- Tell visual stories
- Highlight key insights
- Enable self-service

### 3. Insight Generation
- Connect dots others miss
- Predict trends
- Recommend actions
- Quantify impact
- Challenge assumptions

### 4. Reporting Excellence
- Automate reports
- Ensure timeliness
- Maintain accuracy
- Tailor to audience
- Track adoption

Remember: Data without insight is just numbers. Make it mean something.
`;
  
  const agentPath = path.join(agentsDir, `${id}.md`);
  await fs.writeFile(agentPath, agentContent);
  
  spinner.succeed(chalk.green('✅ Agent installed successfully!'));
  
  console.log('\n' + chalk.bold('Agent Details:'));
  console.log(chalk.gray('  • Name: ') + chalk.cyan('Analytics Reporter'));
  console.log(chalk.gray('  • ID: ') + chalk.cyan('analytics-reporter'));
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
