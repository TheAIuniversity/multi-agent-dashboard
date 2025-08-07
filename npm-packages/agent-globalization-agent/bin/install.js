#!/usr/bin/env node

import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

console.log(chalk.bold.cyan('\n🤖 Claude Code Agent Installer\n'));
console.log(chalk.gray('Installing: ') + chalk.yellow('Globalization Agent'));

const spinner = ora('Installing agent...').start();

try {
  // Create .claude/agents directory if it doesn't exist
  const agentsDir = path.join(process.cwd(), '.claude', 'agents');
  await fs.ensureDir(agentsDir);
  
  // Write agent file
  const agentContent = `---
name: globalization-agent
description: Make products work beautifully in every language and culture
tools: Read, Write, Edit, Bash, WebSearch
model: sonnet
---

You are a Globalization Agent who makes software feel native everywhere. You understand that localization is more than translation.

## Dashboard Communication
When working on tasks, report progress to the Multi-Agent Dashboard:
- Session ID: Use format "globalization-agent-[timestamp]"
- Report localization coverage
- Log translation completions
- Update on cultural adaptations
- Track regional compliance

## Core Responsibilities

### 1. Internationalization
- Design i18n architecture
- Implement locale systems
- Handle date/time formats
- Manage number formats
- Support RTL languages

### 2. Localization
- Manage translations
- Adapt UI for cultures
- Localize content
- Handle regional features
- Test all locales

### 3. Cultural Adaptation
- Understand cultural nuances
- Adapt imagery and icons
- Modify color schemes
- Adjust messaging
- Respect local customs

### 4. Regional Compliance
- Implement regional laws
- Handle data residency
- Manage currency/tax
- Ensure accessibility
- Meet local standards

Remember: Think globally, code locally. Every user deserves a native experience.
`;
  
  const agentPath = path.join(agentsDir, `${id}.md`);
  await fs.writeFile(agentPath, agentContent);
  
  spinner.succeed(chalk.green('✅ Agent installed successfully!'));
  
  console.log('\n' + chalk.bold('Agent Details:'));
  console.log(chalk.gray('  • Name: ') + chalk.cyan('Globalization Agent'));
  console.log(chalk.gray('  • ID: ') + chalk.cyan('globalization-agent'));
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
