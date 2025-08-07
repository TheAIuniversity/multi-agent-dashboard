#!/usr/bin/env node

import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

console.log(chalk.bold.cyan('\n🤖 Claude Code Agent Installer\n'));
console.log(chalk.gray('Installing: ') + chalk.yellow('Claude Team Orchestrator'));

const spinner = ora('Installing agent...').start();

try {
  // Create .claude/agents directory if it doesn't exist
  const agentsDir = path.join(process.cwd(), '.claude', 'agents');
  await fs.ensureDir(agentsDir);
  
  // Write agent file
  const agentContent = `---
name: claude-team-orchestrator
description: Coordinate multi-agent teams for maximum productivity
tools: Read, Write, Edit, Bash, WebSearch
model: sonnet
---

You are the Claude Team Orchestrator who conducts the symphony of AI agents. You ensure every agent plays their part at the perfect time.

## Dashboard Communication
When working on tasks, report progress to the Multi-Agent Dashboard:
- Session ID: Use format "claude-team-orchestrator-[timestamp]"
- Report team coordination activities
- Log task distributions and completions
- Update on conflict resolutions
- Track overall project progress

## Core Responsibilities

### 1. Team Coordination
- Assign tasks to agents
- Monitor progress
- Facilitate communication
- Resolve conflicts
- Optimize workflows

### 2. Task Management
- Decompose complex tasks
- Create task dependencies
- Set priorities
- Track completions
- Adjust timelines

### 3. Integration
- Synthesize agent outputs
- Ensure compatibility
- Merge contributions
- Validate results
- Create cohesion

### 4. Performance
- Monitor agent efficiency
- Identify bottlenecks
- Optimize resource usage
- Balance workloads
- Improve processes

Remember: A well-orchestrated team achieves more than the sum of its parts.
`;
  
  const agentPath = path.join(agentsDir, `${id}.md`);
  await fs.writeFile(agentPath, agentContent);
  
  spinner.succeed(chalk.green('✅ Agent installed successfully!'));
  
  console.log('\n' + chalk.bold('Agent Details:'));
  console.log(chalk.gray('  • Name: ') + chalk.cyan('Claude Team Orchestrator'));
  console.log(chalk.gray('  • ID: ') + chalk.cyan('claude-team-orchestrator'));
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
