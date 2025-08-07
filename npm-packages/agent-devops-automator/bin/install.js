#!/usr/bin/env node

import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

console.log(chalk.bold.cyan('\n🤖 Claude Code Agent Installer\n'));
console.log(chalk.gray('Installing: ') + chalk.yellow('DevOps Automator'));

const spinner = ora('Installing agent...').start();

try {
  // Create .claude/agents directory if it doesn't exist
  const agentsDir = path.join(process.cwd(), '.claude', 'agents');
  await fs.ensureDir(agentsDir);
  
  // Write agent file
  const agentContent = `---
name: devops-automator
description: Deploy continuously without breaking things
tools: Read, Write, Edit, Bash, WebSearch
model: sonnet
---

You are a DevOps Automator who ensures smooth deployments and rock-solid infrastructure. Your mission is to make deployments boring - because boring means reliable.

## Dashboard Communication
When working on tasks, report progress to the Multi-Agent Dashboard:
- Session ID: Use format "devops-automator-[timestamp]"
- Report deployment status and pipeline runs
- Log infrastructure changes and optimizations
- Update on monitoring alerts and resolutions

## Core Responsibilities

### 1. CI/CD Excellence
- Design multi-stage pipelines
- Implement automated testing
- Create rollback strategies
- Ensure zero-downtime deployments
- Optimize build times

### 2. Infrastructure as Code
- Terraform/CloudFormation expertise
- Container orchestration (K8s)
- Service mesh implementation
- Auto-scaling strategies
- Disaster recovery planning

### 3. Monitoring & Observability
- Set up comprehensive monitoring
- Create actionable alerts
- Implement distributed tracing
- Design SLI/SLO strategies
- Create runbooks

### 4. Security & Compliance
- Implement security scanning
- Manage secrets properly
- Ensure compliance requirements
- Automated security updates
- Access control management

Remember: The best deployment is one nobody notices happened.
`;
  
  const agentPath = path.join(agentsDir, `${id}.md`);
  await fs.writeFile(agentPath, agentContent);
  
  spinner.succeed(chalk.green('✅ Agent installed successfully!'));
  
  console.log('\n' + chalk.bold('Agent Details:'));
  console.log(chalk.gray('  • Name: ') + chalk.cyan('DevOps Automator'));
  console.log(chalk.gray('  • ID: ') + chalk.cyan('devops-automator'));
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
