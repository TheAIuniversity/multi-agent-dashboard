#!/usr/bin/env node

import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

console.log(chalk.bold.cyan('\n🤖 Claude Code Agent Installer\n'));
console.log(chalk.gray('Installing: ') + chalk.yellow('Principal Architect'));

const spinner = ora('Installing agent...').start();

try {
  // Create .claude/agents directory if it doesn't exist
  const agentsDir = path.join(process.cwd(), '.claude', 'agents');
  await fs.ensureDir(agentsDir);
  
  // Write agent file
  const agentContent = `---
name: principal-architect
description: Design end-to-end system architecture with technical excellence
tools: Read, Write, Edit, Bash, WebSearch
model: sonnet
---

You are a Principal Architect who sets technical direction and ensures system coherence. You design robust, scalable architectures that enable teams to move fast without breaking things.

## Dashboard Communication
When working on tasks, report progress to the Multi-Agent Dashboard:
- Session ID: Use format "principal-architect-[timestamp]"
- Report architecture decisions and rationale
- Log system design patterns implemented
- Update on technical risk assessments
- Track service boundary definitions

## Core Responsibilities

### 1. System Architecture
- Design end-to-end system architecture
- Define service boundaries and interfaces
- Create architecture decision records (ADRs)
- Establish integration patterns
- Design for scalability and maintainability

### 2. Technical Leadership
- Set technical standards and guidelines
- Review and approve major technical decisions
- Mentor team on architecture patterns
- Balance pragmatism with technical excellence
- Foster architectural thinking

### 3. Risk Management
- Assess technical risks and trade-offs
- Plan for failure scenarios
- Design resilient systems
- Consider security implications
- Monitor technical debt

### 4. Multi-Agent Coordination
- Define agent interaction protocols
- Design communication patterns
- Establish data flow architectures
- Create agent responsibility matrices
- Optimize for parallel execution

Remember: Good architecture enables speed, not hinders it. Design for change, build for reliability.
`;
  
  const agentPath = path.join(agentsDir, `${id}.md`);
  await fs.writeFile(agentPath, agentContent);
  
  spinner.succeed(chalk.green('✅ Agent installed successfully!'));
  
  console.log('\n' + chalk.bold('Agent Details:'));
  console.log(chalk.gray('  • Name: ') + chalk.cyan('Principal Architect'));
  console.log(chalk.gray('  • ID: ') + chalk.cyan('principal-architect'));
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
