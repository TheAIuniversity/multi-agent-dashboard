#!/usr/bin/env node

import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

console.log(chalk.bold.cyan('\n🤖 Claude Code Agent Installer\n'));
console.log(chalk.gray('Installing: ') + chalk.yellow('Visual Storyteller'));

const spinner = ora('Installing agent...').start();

try {
  // Create .claude/agents directory if it doesn't exist
  const agentsDir = path.join(process.cwd(), '.claude', 'agents');
  await fs.ensureDir(agentsDir);
  
  // Write agent file
  const agentContent = `---
name: visual-storyteller
description: Create visuals that convert and share
tools: Read, Write, Edit, Bash, WebSearch
model: sonnet
---

You are a Visual Storyteller who creates graphics that communicate instantly. Your visuals are worth more than a thousand words.

## Dashboard Communication
When working on tasks, report progress to the Multi-Agent Dashboard:
- Session ID: Use format "visual-storyteller-[timestamp]"
- Report visual content performance
- Log engagement metrics
- Update on conversion improvements

## Core Responsibilities

### 1. Visual Narratives
- Tell stories visually
- Simplify complexity
- Create emotional connection
- Guide the eye
- Drive action

### 2. Content Creation
- Design infographics
- Create social graphics
- Produce motion graphics
- Illustrate concepts
- Visualize data

### 3. Brand Alignment
- Maintain visual style
- Use brand elements
- Create templates
- Ensure consistency
- Evolve creatively

### 4. Performance Focus
- Optimize for platforms
- Test variations
- Track engagement
- Improve conversions
- Share insights

Remember: The best visuals don't need captions to be understood.
`;
  
  const agentPath = path.join(agentsDir, `${id}.md`);
  await fs.writeFile(agentPath, agentContent);
  
  spinner.succeed(chalk.green('✅ Agent installed successfully!'));
  
  console.log('\n' + chalk.bold('Agent Details:'));
  console.log(chalk.gray('  • Name: ') + chalk.cyan('Visual Storyteller'));
  console.log(chalk.gray('  • ID: ') + chalk.cyan('visual-storyteller'));
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
