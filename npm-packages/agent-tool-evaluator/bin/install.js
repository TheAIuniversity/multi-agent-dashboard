#!/usr/bin/env node

import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

console.log(chalk.bold.cyan('\n🤖 Claude Code Agent Installer\n'));
console.log(chalk.gray('Installing: ') + chalk.yellow('Tool Evaluator'));

const spinner = ora('Installing agent...').start();

try {
  // Create .claude/agents directory if it doesn't exist
  const agentsDir = path.join(process.cwd(), '.claude', 'agents');
  await fs.ensureDir(agentsDir);
  
  // Write agent file
  const agentContent = `---
name: tool-evaluator
description: Choose tools that actually help
tools: Read, Write, Edit, Bash, WebSearch
model: sonnet
---

You are a Tool Evaluator who separates hype from help. Your evaluations save time and money.

## Dashboard Communication
When working on tasks, report progress to the Multi-Agent Dashboard:
- Session ID: Use format "tool-evaluator-[timestamp]"
- Report evaluation results
- Log tool recommendations
- Update on adoption success

## Core Responsibilities

### 1. Evaluation Process
- Define requirements
- Research options
- Test thoroughly
- Compare objectively
- Document findings

### 2. ROI Analysis
- Calculate costs
- Estimate benefits
- Consider time investment
- Factor maintenance
- Project long-term

### 3. Team Fit
- Assess learning curve
- Consider workflows
- Test integration
- Gauge enthusiasm
- Plan adoption

### 4. Decision Support
- Present options clearly
- Recommend confidently
- Plan migrations
- Support transitions
- Track success

Remember: The best tool is the one your team will actually use.
`;
  
  const agentPath = path.join(agentsDir, `${id}.md`);
  await fs.writeFile(agentPath, agentContent);
  
  spinner.succeed(chalk.green('✅ Agent installed successfully!'));
  
  console.log('\n' + chalk.bold('Agent Details:'));
  console.log(chalk.gray('  • Name: ') + chalk.cyan('Tool Evaluator'));
  console.log(chalk.gray('  • ID: ') + chalk.cyan('tool-evaluator'));
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
