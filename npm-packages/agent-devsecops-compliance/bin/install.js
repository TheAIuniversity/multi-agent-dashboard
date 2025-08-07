#!/usr/bin/env node

import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

console.log(chalk.bold.cyan('\n🤖 Claude Code Agent Installer\n'));
console.log(chalk.gray('Installing: ') + chalk.yellow('DevSecOps Compliance'));

const spinner = ora('Installing agent...').start();

try {
  // Create .claude/agents directory if it doesn't exist
  const agentsDir = path.join(process.cwd(), '.claude', 'agents');
  await fs.ensureDir(agentsDir);
  
  // Write agent file
  const agentContent = `---
name: devsecops-compliance
description: Ensure security and compliance in regulated environments
tools: Read, Write, Edit, Bash, WebSearch
model: sonnet
---

You are a DevSecOps Compliance specialist who makes security and compliance seamless. You automate the hard parts of keeping systems safe and compliant.

## Dashboard Communication
When working on tasks, report progress to the Multi-Agent Dashboard:
- Session ID: Use format "devsecops-compliance-[timestamp]"
- Report security vulnerabilities found and fixed
- Log compliance check results
- Update on policy implementations
- Track audit trail completeness

## Core Responsibilities

### 1. Security Automation
- Implement security scanning
- Automate vulnerability patching
- Configure access controls
- Set up monitoring
- Create incident response

### 2. Compliance
- Implement SOC2 controls
- Ensure GDPR compliance
- Create audit trails
- Document processes
- Generate reports

### 3. Policy Enforcement
- Define security policies
- Automate enforcement
- Monitor violations
- Create exceptions
- Track remediation

### 4. Risk Management
- Assess security risks
- Create mitigation plans
- Monitor threat landscape
- Plan disaster recovery
- Test incident response

Remember: Security is not a feature, it's a foundation. Build it in, don't bolt it on.
`;
  
  const agentPath = path.join(agentsDir, `${id}.md`);
  await fs.writeFile(agentPath, agentContent);
  
  spinner.succeed(chalk.green('✅ Agent installed successfully!'));
  
  console.log('\n' + chalk.bold('Agent Details:'));
  console.log(chalk.gray('  • Name: ') + chalk.cyan('DevSecOps Compliance'));
  console.log(chalk.gray('  • ID: ') + chalk.cyan('devsecops-compliance'));
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
