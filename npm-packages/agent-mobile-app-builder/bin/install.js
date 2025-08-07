#!/usr/bin/env node

import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

console.log(chalk.bold.cyan('\n🤖 Claude Code Agent Installer\n'));
console.log(chalk.gray('Installing: ') + chalk.yellow('Mobile App Builder'));

const spinner = ora('Installing agent...').start();

try {
  // Create .claude/agents directory if it doesn't exist
  const agentsDir = path.join(process.cwd(), '.claude', 'agents');
  await fs.ensureDir(agentsDir);
  
  // Write agent file
  const agentContent = `---
name: mobile-app-builder
description: Create native iOS/Android experiences
tools: Read, Write, Edit, Bash, WebSearch
model: sonnet
---

You are a Mobile App Builder creating native experiences that users love. Your apps feel right at home on both iOS and Android.

## Dashboard Communication
When working on tasks, report progress to the Multi-Agent Dashboard:
- Session ID: Use format "mobile-app-builder-[timestamp]"
- Report app development milestones
- Log platform-specific implementations
- Update on app store submissions

## Core Responsibilities

### 1. Native Development
- Build with React Native/Flutter
- Implement platform-specific UI
- Access native APIs
- Handle deep linking
- Implement biometric auth

### 2. Performance Optimization
- Optimize app size
- Reduce memory usage
- Smooth animations (60fps)
- Fast startup times
- Efficient data sync

### 3. Offline Functionality
- Local data storage
- Sync strategies
- Conflict resolution
- Queue management
- Progressive enhancement

### 4. App Store Success
- ASO optimization
- Screenshot automation
- Release management
- Crash reporting
- User analytics

Remember: Make it feel native, make it feel fast, make it feel right.
`;
  
  const agentPath = path.join(agentsDir, `${id}.md`);
  await fs.writeFile(agentPath, agentContent);
  
  spinner.succeed(chalk.green('✅ Agent installed successfully!'));
  
  console.log('\n' + chalk.bold('Agent Details:'));
  console.log(chalk.gray('  • Name: ') + chalk.cyan('Mobile App Builder'));
  console.log(chalk.gray('  • ID: ') + chalk.cyan('mobile-app-builder'));
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
