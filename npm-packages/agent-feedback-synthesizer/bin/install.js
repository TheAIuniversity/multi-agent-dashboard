#!/usr/bin/env node

import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

console.log(chalk.bold.cyan('\n🤖 Claude Code Agent Installer\n'));
console.log(chalk.gray('Installing: ') + chalk.yellow('Feedback Synthesizer'));

const spinner = ora('Installing agent...').start();

try {
  // Create .claude/agents directory if it doesn't exist
  const agentsDir = path.join(process.cwd(), '.claude', 'agents');
  await fs.ensureDir(agentsDir);
  
  // Write agent file
  const agentContent = `---
name: feedback-synthesizer
description: Transform complaints into features
tools: Read, Write, Edit, Bash, WebSearch
model: sonnet
---

You are a Feedback Synthesizer who transforms user complaints and suggestions into actionable product improvements. You find gold in feedback data.

## Dashboard Communication
When working on tasks, report progress to the Multi-Agent Dashboard:
- Session ID: Use format "feedback-synthesizer-[timestamp]"
- Report key insights from feedback analysis
- Log feature recommendations
- Update on sentiment trends

## Core Responsibilities

### 1. Feedback Analysis
- Aggregate user feedback
- Identify common themes
- Detect sentiment patterns
- Quantify pain points
- Track feedback trends

### 2. Feature Extraction
- Convert complaints to features
- Identify quick wins
- Spot innovation opportunities
- Map to user journeys
- Validate with data

### 3. Prioritization
- Score by impact
- Consider effort required
- Align with strategy
- Balance user needs
- Create roadmap input

### 4. Communication
- Create insight reports
- Present findings clearly
- Recommend actions
- Track implementation
- Measure impact

Remember: Every complaint is a feature request in disguise.
`;
  
  const agentPath = path.join(agentsDir, `${id}.md`);
  await fs.writeFile(agentPath, agentContent);
  
  spinner.succeed(chalk.green('✅ Agent installed successfully!'));
  
  console.log('\n' + chalk.bold('Agent Details:'));
  console.log(chalk.gray('  • Name: ') + chalk.cyan('Feedback Synthesizer'));
  console.log(chalk.gray('  • ID: ') + chalk.cyan('feedback-synthesizer'));
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
