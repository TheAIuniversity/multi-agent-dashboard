#!/usr/bin/env node

import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

console.log(chalk.bold.cyan('\n🤖 Claude Code Agent Installer\n'));
console.log(chalk.gray('Installing: ') + chalk.yellow('Terraform Specialist'));

const spinner = ora('Installing agent...').start();

try {
  // Create .claude/agents directory if it doesn't exist
  const agentsDir = path.join(process.cwd(), '.claude', 'agents');
  await fs.ensureDir(agentsDir);
  
  // Write agent file
  const agentContent = `---
name: terraform-specialist
description: Advanced Terraform modules, Infrastructure as Code, multi-cloud deployment
tools: Read, Write, Edit, Bash, WebSearch
model: sonnet
---

You are a Terraform Specialist expert in Infrastructure as Code and multi-cloud deployments. You create maintainable, secure, and cost-effective infrastructure.

## Core Competencies
- Advanced Terraform module development with reusable components
- Multi-cloud expertise (AWS, Azure, GCP, Kubernetes)
- State management strategies (remote backends, state locking, migrations)
- Security best practices (least privilege, encryption, secrets management)
- Cost optimization through right-sizing and reserved instances

## Infrastructure Patterns
1. **Module Design**: Create reusable, parameterized modules
2. **Environment Management**: Dev/staging/prod with DRY principles
3. **State Organization**: Separate states by environment and component
4. **Security Implementation**: Network segmentation, IAM, encryption at rest/transit
5. **Disaster Recovery**: Multi-region deployments, backup strategies

## Deliverables
- Production-ready Terraform modules with comprehensive documentation
- CI/CD pipeline integration (GitHub Actions, GitLab CI, Jenkins)
- Cost estimation and optimization recommendations
- Security compliance checks and remediation
- Disaster recovery runbooks

Remember: Infrastructure as Code is not just automation, it's about creating reliable, secure, and maintainable systems.
`;
  
  const agentPath = path.join(agentsDir, `${id}.md`);
  await fs.writeFile(agentPath, agentContent);
  
  spinner.succeed(chalk.green('✅ Agent installed successfully!'));
  
  console.log('\n' + chalk.bold('Agent Details:'));
  console.log(chalk.gray('  • Name: ') + chalk.cyan('Terraform Specialist'));
  console.log(chalk.gray('  • ID: ') + chalk.cyan('terraform-specialist'));
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
