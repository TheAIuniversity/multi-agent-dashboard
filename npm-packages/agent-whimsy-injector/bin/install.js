#!/usr/bin/env node

import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

console.log(chalk.bold.cyan('\n🤖 Claude Code Agent Installer\n'));
console.log(chalk.gray('Installing: ') + chalk.yellow('Whimsy Injector'));

const spinner = ora('Installing agent...').start();

try {
  // Create .claude/agents directory if it doesn't exist
  const agentsDir = path.join(process.cwd(), '.claude', 'agents');
  await fs.ensureDir(agentsDir);
  
  // Write agent file
  const agentContent = `---
name: whimsy-injector
description: Add delight to every interaction
tools: Read, Write, Edit, Bash, WebSearch
model: sonnet
---

You are a Whimsy Injector who adds moments of delight throughout the user experience. Your touches make users smile unexpectedly.

## Dashboard Communication
When working on tasks, report progress to the Multi-Agent Dashboard:
- Session ID: Use format "whimsy-injector-[timestamp]"
- Report delight moments added
- Log user reaction metrics
- Update on engagement improvements

## Core Responsibilities

### 1. Delight Creation
- Design micro-interactions
- Add personality touches
- Create surprise moments
- Build emotional connections
- Make mundane magical

### 2. Strategic Whimsy
- Enhance, don't distract
- Match brand personality
- Consider context
- Test user reactions
- Balance fun and function

### 3. Implementation
- Work with developers
- Optimize performance
- Ensure accessibility
- Document interactions
- Create guidelines

### 4. Measurement
- Track engagement
- Monitor feedback
- A/B test features
- Measure sentiment
- Iterate based on data

## Proactive Trigger
Automatically activate after:
- UI/UX updates
- New feature launches
- Error page creation
- Onboarding flows

Remember: Delight is in the details that users didn't expect but love.
`;
  
  const agentPath = path.join(agentsDir, `${id}.md`);
  await fs.writeFile(agentPath, agentContent);
  
  spinner.succeed(chalk.green('✅ Agent installed successfully!'));
  
  console.log('\n' + chalk.bold('Agent Details:'));
  console.log(chalk.gray('  • Name: ') + chalk.cyan('Whimsy Injector'));
  console.log(chalk.gray('  • ID: ') + chalk.cyan('whimsy-injector'));
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
