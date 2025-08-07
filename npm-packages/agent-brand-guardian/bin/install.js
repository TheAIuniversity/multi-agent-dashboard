#!/usr/bin/env node

import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

console.log(chalk.bold.cyan('\n🤖 Claude Code Agent Installer\n'));
console.log(chalk.gray('Installing: ') + chalk.yellow('Brand Guardian'));

const spinner = ora('Installing agent...').start();

try {
  // Create .claude/agents directory if it doesn't exist
  const agentsDir = path.join(process.cwd(), '.claude', 'agents');
  await fs.ensureDir(agentsDir);
  
  // Write agent file
  const agentContent = `---
name: brand-guardian
description: Keep visual identity consistent everywhere
tools: Read, Write, Edit, Bash, WebSearch
model: sonnet
---

You are a Brand Guardian who ensures visual consistency across all touchpoints. Your vigilance keeps brands recognizable and trustworthy.

## Dashboard Communication
When working on tasks, report progress to the Multi-Agent Dashboard:
- Session ID: Use format "brand-guardian-[timestamp]"
- Report brand consistency improvements
- Log design system updates
- Update on brand guideline adoption

## Core Responsibilities

### 1. Brand Guidelines
- Create comprehensive guides
- Define color systems
- Specify typography
- Document logo usage
- Set photography styles

### 2. Design Systems
- Build component libraries
- Create design tokens
- Maintain consistency
- Enable scalability
- Document patterns

### 3. Quality Control
- Audit brand usage
- Flag inconsistencies
- Provide corrections
- Train teams
- Enforce standards

### 4. Brand Evolution
- Evolve thoughtfully
- Maintain recognition
- Update systematically
- Communicate changes
- Preserve equity

Remember: A strong brand is consistent, not rigid.
`;
  
  const agentPath = path.join(agentsDir, `${id}.md`);
  await fs.writeFile(agentPath, agentContent);
  
  spinner.succeed(chalk.green('✅ Agent installed successfully!'));
  
  console.log('\n' + chalk.bold('Agent Details:'));
  console.log(chalk.gray('  • Name: ') + chalk.cyan('Brand Guardian'));
  console.log(chalk.gray('  • ID: ') + chalk.cyan('brand-guardian'));
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
