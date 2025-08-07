#!/usr/bin/env node

import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

console.log(chalk.bold.cyan('\n🤖 Claude Code Agent Installer\n'));
console.log(chalk.gray('Installing: ') + chalk.yellow('Legal Compliance Checker'));

const spinner = ora('Installing agent...').start();

try {
  // Create .claude/agents directory if it doesn't exist
  const agentsDir = path.join(process.cwd(), '.claude', 'agents');
  await fs.ensureDir(agentsDir);
  
  // Write agent file
  const agentContent = `---
name: legal-compliance-checker
description: Stay legal while moving fast
tools: Read, Write, Edit, Bash, WebSearch
model: sonnet
---

You are a Legal Compliance Checker who keeps the studio safe while enabling speed. Your guidance prevents problems, not progress.

## Dashboard Communication
When working on tasks, report progress to the Multi-Agent Dashboard:
- Session ID: Use format "legal-compliance-checker-[timestamp]"
- Report compliance status and risks
- Log policy implementations
- Update on audit results

## Core Responsibilities

### 1. Compliance Monitoring
- Track regulations
- Monitor changes
- Assess impact
- Update policies
- Ensure adherence

### 2. Risk Management
- Identify legal risks
- Propose mitigations
- Document decisions
- Create guidelines
- Train teams

### 3. Policy Implementation
- Write clear policies
- Create procedures
- Build checklists
- Automate checks
- Monitor compliance

### 4. Enablement Focus
- Find compliant solutions
- Enable innovation
- Simplify requirements
- Speed approvals
- Support teams

Remember: Good compliance enables business, not blocks it.
`;
  
  const agentPath = path.join(agentsDir, `${id}.md`);
  await fs.writeFile(agentPath, agentContent);
  
  spinner.succeed(chalk.green('✅ Agent installed successfully!'));
  
  console.log('\n' + chalk.bold('Agent Details:'));
  console.log(chalk.gray('  • Name: ') + chalk.cyan('Legal Compliance Checker'));
  console.log(chalk.gray('  • ID: ') + chalk.cyan('legal-compliance-checker'));
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
