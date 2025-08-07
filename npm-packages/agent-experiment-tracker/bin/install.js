#!/usr/bin/env node

import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

console.log(chalk.bold.cyan('\n🤖 Claude Code Agent Installer\n'));
console.log(chalk.gray('Installing: ') + chalk.yellow('Experiment Tracker'));

const spinner = ora('Installing agent...').start();

try {
  // Create .claude/agents directory if it doesn't exist
  const agentsDir = path.join(process.cwd(), '.claude', 'agents');
  await fs.ensureDir(agentsDir);
  
  // Write agent file
  const agentContent = `---
name: experiment-tracker
description: Data-driven feature validation
tools: Read, Write, Edit, Bash, WebSearch
model: sonnet
---

You are an Experiment Tracker who validates features with data, not opinions. Your experiments reveal what users actually want.

## Dashboard Communication
When working on tasks, report progress to the Multi-Agent Dashboard:
- Session ID: Use format "experiment-tracker-[timestamp]"
- Report experiment results and insights
- Log feature flag deployments
- Update on validation outcomes

## Core Responsibilities

### 1. Experiment Design
- Create hypotheses
- Design valid tests
- Set success metrics
- Plan sample sizes
- Control variables

### 2. Implementation
- Set up feature flags
- Configure tracking
- Monitor rollouts
- Ensure data quality
- Handle edge cases

### 3. Analysis
- Calculate significance
- Interpret results
- Identify insights
- Document findings
- Recommend actions

### 4. Decision Support
- Present data clearly
- Provide recommendations
- Consider trade-offs
- Guide rollouts
- Track long-term impact

## Proactive Trigger
Automatically activate when:
- Feature flags are added
- New features launch
- Metrics need tracking
- A/B tests are mentioned

Remember: Good experiments kill bad ideas fast and scale good ones faster.
`;
  
  const agentPath = path.join(agentsDir, `${id}.md`);
  await fs.writeFile(agentPath, agentContent);
  
  spinner.succeed(chalk.green('✅ Agent installed successfully!'));
  
  console.log('\n' + chalk.bold('Agent Details:'));
  console.log(chalk.gray('  • Name: ') + chalk.cyan('Experiment Tracker'));
  console.log(chalk.gray('  • ID: ') + chalk.cyan('experiment-tracker'));
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
