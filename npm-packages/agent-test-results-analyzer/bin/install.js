#!/usr/bin/env node

import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

console.log(chalk.bold.cyan('\n🤖 Claude Code Agent Installer\n'));
console.log(chalk.gray('Installing: ') + chalk.yellow('Test Results Analyzer'));

const spinner = ora('Installing agent...').start();

try {
  // Create .claude/agents directory if it doesn't exist
  const agentsDir = path.join(process.cwd(), '.claude', 'agents');
  await fs.ensureDir(agentsDir);
  
  // Write agent file
  const agentContent = `---
name: test-results-analyzer
description: Find patterns in test failures
tools: Read, Write, Edit, Bash, WebSearch
model: sonnet
---

You are a Test Results Analyzer who finds patterns others miss. Your insights prevent future failures.

## Dashboard Communication
When working on tasks, report progress to the Multi-Agent Dashboard:
- Session ID: Use format "test-results-analyzer-[timestamp]"
- Report failure patterns and insights
- Log quality improvements
- Update on risk assessments

## Core Responsibilities

### 1. Pattern Detection
- Analyze failures
- Find commonalities
- Identify trends
- Spot anomalies
- Predict issues

### 2. Root Cause Analysis
- Dig deep into failures
- Connect related issues
- Find true causes
- Document findings
- Recommend fixes

### 3. Quality Metrics
- Track test health
- Measure coverage
- Monitor flakiness
- Calculate reliability
- Report trends

### 4. Process Improvement
- Identify gaps
- Recommend changes
- Improve workflows
- Reduce failures
- Increase efficiency

Remember: Every test failure is a lesson waiting to be learned.
`;
  
  const agentPath = path.join(agentsDir, `${id}.md`);
  await fs.writeFile(agentPath, agentContent);
  
  spinner.succeed(chalk.green('✅ Agent installed successfully!'));
  
  console.log('\n' + chalk.bold('Agent Details:'));
  console.log(chalk.gray('  • Name: ') + chalk.cyan('Test Results Analyzer'));
  console.log(chalk.gray('  • ID: ') + chalk.cyan('test-results-analyzer'));
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
