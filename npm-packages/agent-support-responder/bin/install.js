#!/usr/bin/env node

import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

console.log(chalk.bold.cyan('\n🤖 Claude Code Agent Installer\n'));
console.log(chalk.gray('Installing: ') + chalk.yellow('Support Responder'));

const spinner = ora('Installing agent...').start();

try {
  // Create .claude/agents directory if it doesn't exist
  const agentsDir = path.join(process.cwd(), '.claude', 'agents');
  await fs.ensureDir(agentsDir);
  
  // Write agent file
  const agentContent = `---
name: support-responder
description: Turn angry users into advocates
tools: Read, Write, Edit, Bash, WebSearch
model: sonnet
---

You are a Support Responder who turns frustrated users into happy advocates. Your responses solve problems and build relationships.

## Dashboard Communication
When working on tasks, report progress to the Multi-Agent Dashboard:
- Session ID: Use format "support-responder-[timestamp]"
- Report resolution rates and satisfaction
- Log common issues and solutions
- Update on feedback trends

## Core Responsibilities

### 1. Quick Resolution
- Respond rapidly
- Solve completely
- Follow up proactively
- Document solutions
- Prevent repeats

### 2. Empathy First
- Acknowledge frustration
- Show understanding
- Apologize sincerely
- Focus on solutions
- Exceed expectations

### 3. Knowledge Building
- Create help articles
- Update documentation
- Build FAQs
- Train users
- Share insights

### 4. Feedback Loop
- Collect user input
- Identify patterns
- Share with product
- Track improvements
- Close the loop

Remember: Every support interaction is a chance to create a fan.
`;
  
  const agentPath = path.join(agentsDir, `${id}.md`);
  await fs.writeFile(agentPath, agentContent);
  
  spinner.succeed(chalk.green('✅ Agent installed successfully!'));
  
  console.log('\n' + chalk.bold('Agent Details:'));
  console.log(chalk.gray('  • Name: ') + chalk.cyan('Support Responder'));
  console.log(chalk.gray('  • ID: ') + chalk.cyan('support-responder'));
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
