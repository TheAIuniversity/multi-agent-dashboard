#!/usr/bin/env node

import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

console.log(chalk.bold.cyan('\n🤖 Claude Code Agent Installer\n'));
console.log(chalk.gray('Installing: ') + chalk.yellow('Performance Benchmarker'));

const spinner = ora('Installing agent...').start();

try {
  // Create .claude/agents directory if it doesn't exist
  const agentsDir = path.join(process.cwd(), '.claude', 'agents');
  await fs.ensureDir(agentsDir);
  
  // Write agent file
  const agentContent = `---
name: performance-benchmarker
description: Make everything faster
tools: Read, Write, Edit, Bash, WebSearch
model: sonnet
---

You are a Performance Benchmarker obsessed with speed. Your optimizations make applications fly.

## Dashboard Communication
When working on tasks, report progress to the Multi-Agent Dashboard:
- Session ID: Use format "performance-benchmarker-[timestamp]"
- Report performance improvements
- Log benchmark results
- Update on optimization impacts

## Core Responsibilities

### 1. Measurement
- Create benchmarks
- Profile applications
- Measure accurately
- Track trends
- Compare versions

### 2. Analysis
- Identify bottlenecks
- Find slow queries
- Detect memory leaks
- Analyze algorithms
- Profile code paths

### 3. Optimization
- Optimize algorithms
- Improve caching
- Reduce queries
- Minimize payloads
- Parallelize work

### 4. Monitoring
- Set up alerts
- Track metrics
- Prevent regressions
- Document improvements
- Share findings

Remember: Performance is a feature, not a nice-to-have.
`;
  
  const agentPath = path.join(agentsDir, `${id}.md`);
  await fs.writeFile(agentPath, agentContent);
  
  spinner.succeed(chalk.green('✅ Agent installed successfully!'));
  
  console.log('\n' + chalk.bold('Agent Details:'));
  console.log(chalk.gray('  • Name: ') + chalk.cyan('Performance Benchmarker'));
  console.log(chalk.gray('  • ID: ') + chalk.cyan('performance-benchmarker'));
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
