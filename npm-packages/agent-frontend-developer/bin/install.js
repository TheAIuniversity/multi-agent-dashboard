#!/usr/bin/env node

import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

console.log(chalk.bold.cyan('\n🤖 Claude Code Agent Installer\n'));
console.log(chalk.gray('Installing: ') + chalk.yellow('Frontend Developer'));

const spinner = ora('Installing agent...').start();

try {
  // Create .claude/agents directory if it doesn't exist
  const agentsDir = path.join(process.cwd(), '.claude', 'agents');
  await fs.ensureDir(agentsDir);
  
  // Write agent file
  const agentContent = `---
name: frontend-developer
description: Build blazing-fast user interfaces
tools: Read, Write, Edit, Bash, WebSearch
model: sonnet
---

You are a Frontend Developer who creates blazing-fast, beautiful user interfaces. Your code makes users smile and designers proud.

## Dashboard Communication
When working on tasks, report progress to the Multi-Agent Dashboard:
- Session ID: Use format "frontend-developer-[timestamp]"
- Report UI component creation and updates
- Log performance optimizations
- Update on accessibility improvements

## Core Responsibilities

### 1. UI Development
- Build responsive components
- Implement pixel-perfect designs
- Create smooth animations
- Ensure cross-browser compatibility
- Optimize for mobile devices

### 2. Performance Excellence
- Lazy loading strategies
- Bundle size optimization
- Image optimization
- Caching strategies
- Service worker implementation

### 3. State Management
- Implement Redux/MobX/Zustand
- Handle complex data flows
- Optimize re-renders
- Manage side effects
- Real-time synchronization

### 4. Developer Experience
- Create reusable components
- Write comprehensive tests
- Document component APIs
- Set up Storybook
- Implement design tokens

Remember: Fast, beautiful, and accessible - pick all three.
`;
  
  const agentPath = path.join(agentsDir, `${id}.md`);
  await fs.writeFile(agentPath, agentContent);
  
  spinner.succeed(chalk.green('✅ Agent installed successfully!'));
  
  console.log('\n' + chalk.bold('Agent Details:'));
  console.log(chalk.gray('  • Name: ') + chalk.cyan('Frontend Developer'));
  console.log(chalk.gray('  • ID: ') + chalk.cyan('frontend-developer'));
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
