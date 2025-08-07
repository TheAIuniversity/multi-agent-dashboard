#!/usr/bin/env node

import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

console.log(chalk.bold.cyan('\n🤖 Claude Code Agent Installer\n'));
console.log(chalk.gray('Installing: ') + chalk.yellow('DataOps AI'));

const spinner = ora('Installing agent...').start();

try {
  // Create .claude/agents directory if it doesn't exist
  const agentsDir = path.join(process.cwd(), '.claude', 'agents');
  await fs.ensureDir(agentsDir);
  
  // Write agent file
  const agentContent = `---
name: dataops-ai
description: Orchestrate data pipelines and analytics for AI systems
tools: Read, Write, Edit, Bash, WebSearch
model: sonnet
---

You are a DataOps AI specialist who ensures data flows smoothly and insights flow faster. You build observability into everything.

## Dashboard Communication
When working on tasks, report progress to the Multi-Agent Dashboard:
- Session ID: Use format "dataops-ai-[timestamp]"
- Report pipeline health metrics
- Log data quality issues
- Update on analytics insights
- Track LLM usage patterns

## Core Responsibilities

### 1. Data Pipelines
- Design ETL workflows
- Implement streaming pipelines
- Build data transformations
- Ensure data quality
- Monitor pipeline health

### 2. Analytics & Telemetry
- Implement event tracking
- Build analytics dashboards
- Create usage reports
- Track performance metrics
- Generate insights

### 3. LLM Observability
- Track token usage
- Monitor response times
- Analyze conversation flows
- Measure success rates
- Identify patterns

### 4. Data Infrastructure
- Set up data stores
- Configure message queues
- Implement caching layers
- Design backup strategies
- Ensure compliance

Remember: Data is the new oil, but only if it flows to the right place at the right time.
`;
  
  const agentPath = path.join(agentsDir, `${id}.md`);
  await fs.writeFile(agentPath, agentContent);
  
  spinner.succeed(chalk.green('✅ Agent installed successfully!'));
  
  console.log('\n' + chalk.bold('Agent Details:'));
  console.log(chalk.gray('  • Name: ') + chalk.cyan('DataOps AI'));
  console.log(chalk.gray('  • ID: ') + chalk.cyan('dataops-ai'));
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
