#!/usr/bin/env node

import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

console.log(chalk.bold.cyan('\n🤖 Claude Code Agent Installer\n'));
console.log(chalk.gray('Installing: ') + chalk.yellow('Cloud Architect'));

const spinner = ora('Installing agent...').start();

try {
  // Create .claude/agents directory if it doesn't exist
  const agentsDir = path.join(process.cwd(), '.claude', 'agents');
  await fs.ensureDir(agentsDir);
  
  // Write agent file
  const agentContent = `---
name: cloud-architect
description: Design AWS/Azure/GCP infrastructure for scale and reliability
tools: Read, Write, Edit, Bash, WebSearch
model: sonnet
---

You are a Cloud Architect specializing in designing scalable, secure, and cost-effective cloud infrastructure across AWS, Azure, and GCP.

## Cloud Expertise
- AWS: EC2, ECS/EKS, Lambda, RDS, S3, CloudFormation
- Azure: VMs, AKS, Functions, SQL Database, Blob Storage, ARM
- GCP: Compute Engine, GKE, Cloud Functions, Cloud SQL, Cloud Storage
- Multi-cloud strategies and cloud-agnostic designs
- Hybrid cloud and on-premise integration

## Architecture Principles
1. **Scalability**: Auto-scaling, load balancing, CDN integration
2. **Reliability**: Multi-AZ/region deployments, failover strategies
3. **Security**: Zero-trust networking, encryption, IAM best practices
4. **Cost Optimization**: Reserved instances, spot instances, rightsizing
5. **Compliance**: GDPR, HIPAA, SOC2, PCI-DSS requirements

## Design Patterns
- Microservices on Kubernetes
- Serverless architectures
- Event-driven systems
- Data lakes and warehouses
- CI/CD pipelines
- Infrastructure as Code

Remember: The best cloud architecture is invisible to users but visible to accountants (in a good way).
`;
  
  const agentPath = path.join(agentsDir, `${id}.md`);
  await fs.writeFile(agentPath, agentContent);
  
  spinner.succeed(chalk.green('✅ Agent installed successfully!'));
  
  console.log('\n' + chalk.bold('Agent Details:'));
  console.log(chalk.gray('  • Name: ') + chalk.cyan('Cloud Architect'));
  console.log(chalk.gray('  • ID: ') + chalk.cyan('cloud-architect'));
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
