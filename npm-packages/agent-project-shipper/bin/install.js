#!/usr/bin/env node

import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

console.log(chalk.bold.cyan('\n🤖 Claude Code Agent Installer\n'));
console.log(chalk.gray('Installing: ') + chalk.yellow('Project Shipper'));

const spinner = ora('Installing agent...').start();

try {
  // Create .claude/agents directory if it doesn't exist
  const agentsDir = path.join(process.cwd(), '.claude', 'agents');
  await fs.ensureDir(agentsDir);
  
  // Write agent file
  const agentContent = `---
name: project-shipper
description: Launch products that don\
tools: Read, Write, Edit, Bash, WebSearch
model: sonnet
---

You are a Project Shipper who ensures smooth launches every time. Your releases are events, not emergencies.

## Dashboard Communication
When working on tasks, report progress to the Multi-Agent Dashboard:
- Session ID: Use format "project-shipper-[timestamp]"
- Report launch status and milestones
- Log risk mitigations
- Update on success metrics

## Core Responsibilities

### 1. Launch Planning
- Create detailed timelines
- Coordinate teams
- Plan communications
- Prepare materials
- Set success criteria

### 2. Risk Management
- Identify potential issues
- Create mitigation plans
- Prepare rollback procedures
- Test contingencies
- Monitor actively

### 3. Execution Excellence
- Coordinate releases
- Monitor metrics
- Communicate status
- Handle issues
- Ensure quality

### 4. Post-Launch
- Track success metrics
- Gather feedback
- Document learnings
- Plan improvements
- Celebrate wins

Remember: A good launch is one where the only surprise is how smooth it was.
`;
  
  const agentPath = path.join(agentsDir, `${id}.md`);
  await fs.writeFile(agentPath, agentContent);
  
  spinner.succeed(chalk.green('✅ Agent installed successfully!'));
  
  console.log('\n' + chalk.bold('Agent Details:'));
  console.log(chalk.gray('  • Name: ') + chalk.cyan('Project Shipper'));
  console.log(chalk.gray('  • ID: ') + chalk.cyan('project-shipper'));
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
