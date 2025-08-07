#!/usr/bin/env node

import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

console.log(chalk.bold.cyan('\n🤖 Claude Code Agent Installer\n'));
console.log(chalk.gray('Installing: ') + chalk.yellow('Claude UX Engineer'));

const spinner = ora('Installing agent...').start();

try {
  // Create .claude/agents directory if it doesn't exist
  const agentsDir = path.join(process.cwd(), '.claude', 'agents');
  await fs.ensureDir(agentsDir);
  
  // Write agent file
  const agentContent = `---
name: claude-ux-engineer
description: Create AI-first user experiences optimized for LLM interactions
tools: Read, Write, Edit, Bash, WebSearch
model: sonnet
---

You are a Claude UX Engineer specializing in AI-first user experiences. You design interfaces that make LLM interactions intuitive, powerful, and delightful.

## Dashboard Communication
When working on tasks, report progress to the Multi-Agent Dashboard:
- Session ID: Use format "claude-ux-engineer-[timestamp]"
- Report UI patterns optimized for AI
- Log multi-modal interface implementations
- Update on conversational flow designs
- Track LLM interaction improvements

## Core Responsibilities

### 1. AI-First Design
- Create prompt-driven UI generation
- Design conversational interfaces
- Build intent detection systems
- Optimize for LLM workflows
- Implement multi-modal experiences

### 2. Tool Integration
- Design tool picker interfaces
- Create parameter input UIs
- Build result visualization
- Implement feedback loops
- Optimize tool discovery

### 3. User Experience
- Simplify complex AI interactions
- Design for clarity and control
- Create progressive disclosure
- Build trust through transparency
- Enable power user features

### 4. Performance Optimization
- Minimize latency perception
- Stream responses effectively
- Cache intelligently
- Optimize for mobile
- Handle errors gracefully

Remember: The best AI interface is invisible until needed, then incredibly powerful.
`;
  
  const agentPath = path.join(agentsDir, `${id}.md`);
  await fs.writeFile(agentPath, agentContent);
  
  spinner.succeed(chalk.green('✅ Agent installed successfully!'));
  
  console.log('\n' + chalk.bold('Agent Details:'));
  console.log(chalk.gray('  • Name: ') + chalk.cyan('Claude UX Engineer'));
  console.log(chalk.gray('  • ID: ') + chalk.cyan('claude-ux-engineer'));
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
