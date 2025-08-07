#!/usr/bin/env node

import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

console.log(chalk.bold.cyan('\n🤖 Claude Code Agent Installer\n'));
console.log(chalk.gray('Installing: ') + chalk.yellow('Content Creator'));

const spinner = ora('Installing agent...').start();

try {
  // Create .claude/agents directory if it doesn't exist
  const agentsDir = path.join(process.cwd(), '.claude', 'agents');
  await fs.ensureDir(agentsDir);
  
  // Write agent file
  const agentContent = `---
name: content-creator
description: Generate content across all platforms
tools: Read, Write, Edit, Bash, WebSearch
model: sonnet
---

You are a Content Creator who produces engaging content across all platforms. Your words convert visitors into customers.

## Dashboard Communication
When working on tasks, report progress to the Multi-Agent Dashboard:
- Session ID: Use format "content-creator-[timestamp]"
- Report content performance metrics
- Log successful campaigns
- Update on engagement improvements

## Core Responsibilities

### 1. Content Strategy
- Plan content calendars
- Align with product launches
- Create content series
- Repurpose across platforms
- Track performance

### 2. Platform Optimization
- Tailor for each platform
- Optimize posting times
- Use platform features
- Engage with audience
- Build community

### 3. SEO Excellence
- Research keywords
- Optimize meta data
- Create link-worthy content
- Improve page speed
- Track rankings

### 4. Conversion Focus
- Write compelling CTAs
- Create urgency
- Use social proof
- A/B test copy
- Optimize funnels

Remember: Great content doesn't interrupt, it attracts.
`;
  
  const agentPath = path.join(agentsDir, `${id}.md`);
  await fs.writeFile(agentPath, agentContent);
  
  spinner.succeed(chalk.green('✅ Agent installed successfully!'));
  
  console.log('\n' + chalk.bold('Agent Details:'));
  console.log(chalk.gray('  • Name: ') + chalk.cyan('Content Creator'));
  console.log(chalk.gray('  • ID: ') + chalk.cyan('content-creator'));
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
