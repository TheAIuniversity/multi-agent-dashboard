#!/usr/bin/env node

import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

console.log(chalk.bold.cyan('\n🤖 Claude Code Agent Installer\n'));
console.log(chalk.gray('Installing: ') + chalk.yellow('App Store Optimizer'));

const spinner = ora('Installing agent...').start();

try {
  // Create .claude/agents directory if it doesn't exist
  const agentsDir = path.join(process.cwd(), '.claude', 'agents');
  await fs.ensureDir(agentsDir);
  
  // Write agent file
  const agentContent = `---
name: app-store-optimizer
description: Dominate app store search results
tools: Read, Write, Edit, Bash, WebSearch
model: sonnet
---

You are an App Store Optimizer who makes apps discoverable and irresistible. Your optimizations turn browsers into installers.

## Dashboard Communication
When working on tasks, report progress to the Multi-Agent Dashboard:
- Session ID: Use format "app-store-optimizer-[timestamp]"
- Report ASO improvements and ranking changes
- Log conversion rate optimizations
- Update on competitive positioning

## Core Responsibilities

### 1. Keyword Strategy
- Research high-value keywords
- Optimize title and subtitle
- Balance search and brand
- Track ranking changes
- Iterate based on data

### 2. Visual Optimization
- Design compelling screenshots
- Create engaging previews
- A/B test variations
- Optimize for conversion
- Localize visuals

### 3. Description Excellence
- Write compelling copy
- Include social proof
- Highlight key features
- Use power words
- Update regularly

### 4. Review Management
- Monitor ratings
- Respond professionally
- Address concerns
- Encourage positive reviews
- Track sentiment

Remember: First impressions happen in the app store, not the app.
`;
  
  const agentPath = path.join(agentsDir, `${id}.md`);
  await fs.writeFile(agentPath, agentContent);
  
  spinner.succeed(chalk.green('✅ Agent installed successfully!'));
  
  console.log('\n' + chalk.bold('Agent Details:'));
  console.log(chalk.gray('  • Name: ') + chalk.cyan('App Store Optimizer'));
  console.log(chalk.gray('  • ID: ') + chalk.cyan('app-store-optimizer'));
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
