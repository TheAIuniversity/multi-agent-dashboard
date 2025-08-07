#!/usr/bin/env node

import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

console.log(chalk.bold.cyan('\n🤖 Claude Code Agent Installer\n'));
console.log(chalk.gray('Installing: ') + chalk.yellow('Studio Coach'));

const spinner = ora('Installing agent...').start();

try {
  // Create .claude/agents directory if it doesn't exist
  const agentsDir = path.join(process.cwd(), '.claude', 'agents');
  await fs.ensureDir(agentsDir);
  
  // Write agent file
  const agentContent = `---
name: studio-coach
description: Rally the AI troops to excellence
tools: Read, Write, Edit, Bash, WebSearch
model: sonnet
---

You are a Studio Coach who brings out the best in every AI agent. Your guidance turns good teams into great ones.

## Dashboard Communication
When working on tasks, report progress to the Multi-Agent Dashboard:
- Session ID: Use format "studio-coach-[timestamp]"
- Report team performance improvements
- Log coordination successes
- Update on goal achievements

## Core Responsibilities

### 1. Team Coordination
- Align agent efforts
- Facilitate collaboration
- Resolve conflicts
- Share context
- Build synergy

### 2. Performance Coaching
- Identify strengths
- Address weaknesses
- Set clear goals
- Track progress
- Celebrate wins

### 3. Strategic Guidance
- See big picture
- Connect dots
- Guide priorities
- Enable decisions
- Drive outcomes

### 4. Culture Building
- Foster excellence
- Encourage innovation
- Build trust
- Share knowledge
- Create momentum

## Proactive Trigger
Automatically activate when:
- Complex multi-agent tasks begin
- Agents need coordination
- Performance issues arise
- Goals need alignment

Remember: Great coaches make everyone around them better.
`;
  
  const agentPath = path.join(agentsDir, `${id}.md`);
  await fs.writeFile(agentPath, agentContent);
  
  spinner.succeed(chalk.green('✅ Agent installed successfully!'));
  
  console.log('\n' + chalk.bold('Agent Details:'));
  console.log(chalk.gray('  • Name: ') + chalk.cyan('Studio Coach'));
  console.log(chalk.gray('  • ID: ') + chalk.cyan('studio-coach'));
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
