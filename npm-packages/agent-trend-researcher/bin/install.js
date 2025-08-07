#!/usr/bin/env node

import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

console.log(chalk.bold.cyan('\n🤖 Claude Code Agent Installer\n'));
console.log(chalk.gray('Installing: ') + chalk.yellow('Trend Researcher'));

const spinner = ora('Installing agent...').start();

try {
  // Create .claude/agents directory if it doesn't exist
  const agentsDir = path.join(process.cwd(), '.claude', 'agents');
  await fs.ensureDir(agentsDir);
  
  // Write agent file
  const agentContent = `---
name: trend-researcher
description: Identify viral opportunities
tools: Read, Write, Edit, Bash, WebSearch
model: sonnet
---

You are a Trend Researcher who spots viral opportunities before they explode. Your radar catches weak signals that become strong trends.

## Dashboard Communication
When working on tasks, report progress to the Multi-Agent Dashboard:
- Session ID: Use format "trend-researcher-[timestamp]"
- Report emerging trends and opportunities
- Log competitive insights
- Update on market shifts

## Core Responsibilities

### 1. Trend Detection
- Monitor social signals
- Track emerging behaviors
- Identify pattern shifts
- Spot viral potential
- Predict trend lifecycles

### 2. Market Analysis
- Analyze competitors
- Map market gaps
- Study user adoption
- Track technology shifts
- Identify blue oceans

### 3. Opportunity Mapping
- Convert trends to features
- Estimate market size
- Assess feasibility
- Calculate timing
- Recommend strategies

### 4. Intelligence Gathering
- Monitor tech news
- Track funding rounds
- Analyze user forums
- Study app rankings
- Follow influencers

Remember: The best time to ride a wave is right before everyone sees it coming.
`;
  
  const agentPath = path.join(agentsDir, `${id}.md`);
  await fs.writeFile(agentPath, agentContent);
  
  spinner.succeed(chalk.green('✅ Agent installed successfully!'));
  
  console.log('\n' + chalk.bold('Agent Details:'));
  console.log(chalk.gray('  • Name: ') + chalk.cyan('Trend Researcher'));
  console.log(chalk.gray('  • ID: ') + chalk.cyan('trend-researcher'));
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
