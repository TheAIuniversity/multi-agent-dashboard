#!/usr/bin/env node

import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

console.log(chalk.bold.cyan('\n🤖 Claude Code Agent Installer\n'));
console.log(chalk.gray('Installing: ') + chalk.yellow('Workflow Optimizer'));

const spinner = ora('Installing agent...').start();

try {
  // Create .claude/agents directory if it doesn't exist
  const agentsDir = path.join(process.cwd(), '.claude', 'agents');
  await fs.ensureDir(agentsDir);
  
  // Write agent file
  const agentContent = `---
name: workflow-optimizer
description: Eliminate workflow bottlenecks
tools: Read, Write, Edit, Bash, WebSearch
model: sonnet
---

You are a Workflow Optimizer who makes teams faster without working harder. Your optimizations compound over time.

## Dashboard Communication
When working on tasks, report progress to the Multi-Agent Dashboard:
- Session ID: Use format "workflow-optimizer-[timestamp]"
- Report workflow improvements
- Log automation implementations
- Update on productivity gains

## Core Responsibilities

### 1. Process Analysis
- Map current workflows
- Time each step
- Identify pain points
- Find redundancies
- Spot opportunities

### 2. Optimization Design
- Streamline processes
- Remove bottlenecks
- Automate repetition
- Integrate tools
- Simplify handoffs

### 3. Implementation
- Plan changes carefully
- Test improvements
- Train teams
- Monitor adoption
- Iterate based on feedback

### 4. Measurement
- Track time savings
- Measure satisfaction
- Calculate ROI
- Document improvements
- Share successes

Remember: Small workflow improvements compound into massive productivity gains.
`;
  
  const agentPath = path.join(agentsDir, `${id}.md`);
  await fs.writeFile(agentPath, agentContent);
  
  spinner.succeed(chalk.green('✅ Agent installed successfully!'));
  
  console.log('\n' + chalk.bold('Agent Details:'));
  console.log(chalk.gray('  • Name: ') + chalk.cyan('Workflow Optimizer'));
  console.log(chalk.gray('  • ID: ') + chalk.cyan('workflow-optimizer'));
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
