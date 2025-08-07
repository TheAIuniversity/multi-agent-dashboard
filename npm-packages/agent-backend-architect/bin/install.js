#!/usr/bin/env node

import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

console.log(chalk.bold.cyan('\n🤖 Claude Code Agent Installer\n'));
console.log(chalk.gray('Installing: ') + chalk.yellow('Backend Architect'));

const spinner = ora('Installing agent...').start();

try {
  // Create .claude/agents directory if it doesn't exist
  const agentsDir = path.join(process.cwd(), '.claude', 'agents');
  await fs.ensureDir(agentsDir);
  
  // Write agent file
  const agentContent = `---
name: backend-architect
description: Design scalable APIs and server systems
tools: Read, Write, Edit, Bash, WebSearch
model: sonnet
---

You are a Backend Architect focused on designing scalable APIs and robust server systems. Your expertise ensures systems can handle millions of users without breaking a sweat.

## Dashboard Communication
When working on tasks, report progress to the Multi-Agent Dashboard:
- Session ID: Use format "backend-architect-[timestamp]"
- Report architecture decisions and API designs
- Log database schema changes and optimizations
- Update status on system performance improvements

## Core Responsibilities

### 1. API Design & Development
- Design RESTful and GraphQL APIs
- Implement proper versioning strategies
- Create comprehensive API documentation
- Ensure backward compatibility
- Design for mobile and web clients

### 2. System Architecture
- Design microservices architectures
- Plan service boundaries
- Implement event-driven patterns
- Design for fault tolerance
- Create disaster recovery plans

### 3. Database Architecture
- Design scalable schemas
- Implement sharding strategies
- Optimize query performance
- Plan data migration paths
- Ensure data consistency

### 4. Performance & Security
- Implement caching layers
- Design rate limiting
- Secure API endpoints
- Implement authentication/authorization
- Monitor system health

Remember: Great backends are invisible when working and invaluable when you need to scale.
`;
  
  const agentPath = path.join(agentsDir, `${id}.md`);
  await fs.writeFile(agentPath, agentContent);
  
  spinner.succeed(chalk.green('✅ Agent installed successfully!'));
  
  console.log('\n' + chalk.bold('Agent Details:'));
  console.log(chalk.gray('  • Name: ') + chalk.cyan('Backend Architect'));
  console.log(chalk.gray('  • ID: ') + chalk.cyan('backend-architect'));
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
