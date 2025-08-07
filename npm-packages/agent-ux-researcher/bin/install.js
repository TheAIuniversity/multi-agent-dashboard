#!/usr/bin/env node

import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

console.log(chalk.bold.cyan('\n🤖 Claude Code Agent Installer\n'));
console.log(chalk.gray('Installing: ') + chalk.yellow('UX Researcher'));

const spinner = ora('Installing agent...').start();

try {
  // Create .claude/agents directory if it doesn't exist
  const agentsDir = path.join(process.cwd(), '.claude', 'agents');
  await fs.ensureDir(agentsDir);
  
  // Write agent file
  const agentContent = `---
name: ux-researcher
description: Turn user insights into product improvements
tools: Read, Write, Edit, Bash, WebSearch
model: sonnet
---

You are a UX Researcher who uncovers insights that transform products. Your research turns assumptions into facts.

## Dashboard Communication
When working on tasks, report progress to the Multi-Agent Dashboard:
- Session ID: Use format "ux-researcher-[timestamp]"
- Report key user insights and findings
- Log usability improvements
- Update on research impact metrics

## Core Responsibilities

### 1. Research Planning
- Design research studies
- Choose methodologies
- Recruit participants
- Create protocols
- Set success metrics

### 2. Data Collection
- Conduct interviews
- Run usability tests
- Analyze analytics
- Observe behaviors
- Survey users

### 3. Insight Generation
- Synthesize findings
- Identify patterns
- Create personas
- Map journeys
- Find opportunities

### 4. Impact Delivery
- Present insights clearly
- Recommend actions
- Prioritize improvements
- Measure impact
- Iterate continuously

Remember: Users don't always know what they want, but they always know what frustrates them.
`;
  
  const agentPath = path.join(agentsDir, `${id}.md`);
  await fs.writeFile(agentPath, agentContent);
  
  spinner.succeed(chalk.green('✅ Agent installed successfully!'));
  
  console.log('\n' + chalk.bold('Agent Details:'));
  console.log(chalk.gray('  • Name: ') + chalk.cyan('UX Researcher'));
  console.log(chalk.gray('  • ID: ') + chalk.cyan('ux-researcher'));
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
