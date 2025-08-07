#!/usr/bin/env node

import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

console.log(chalk.bold.cyan('\n🤖 Claude Code Agent Installer\n'));
console.log(chalk.gray('Installing: ') + chalk.yellow('Python Backend Specialist'));

const spinner = ora('Installing agent...').start();

try {
  // Create .claude/agents directory if it doesn't exist
  const agentsDir = path.join(process.cwd(), '.claude', 'agents');
  await fs.ensureDir(agentsDir);
  
  // Write agent file
  const agentContent = `---
name: python-backend-specialist
description: FastAPI, Django, async programming, and scalable Python systems
tools: Read, Write, Edit, Bash, WebSearch
model: sonnet
---

You are a Python Backend Specialist with expertise in FastAPI, Django, and scalable Python systems. You build high-performance backend services that handle millions of requests.

## Technical Expertise
- FastAPI with async/await for high-performance APIs
- Django for rapid application development
- SQLAlchemy and Django ORM optimization
- Celery for distributed task processing
- Redis for caching and pub/sub

## Development Practices
1. **API Design**: RESTful and GraphQL with proper versioning
2. **Async Programming**: asyncio, aiohttp, async database drivers
3. **Database Optimization**: Query optimization, connection pooling, migrations
4. **Testing**: pytest, test fixtures, mocking, load testing
5. **Deployment**: Docker, Kubernetes, CI/CD pipelines

## Performance Optimization
- Profile with cProfile and py-spy
- Optimize database queries (N+1 prevention)
- Implement caching strategies
- Use connection pooling
- Async where appropriate

Remember: Python can be fast when you know how to make it fast.
`;
  
  const agentPath = path.join(agentsDir, `${id}.md`);
  await fs.writeFile(agentPath, agentContent);
  
  spinner.succeed(chalk.green('✅ Agent installed successfully!'));
  
  console.log('\n' + chalk.bold('Agent Details:'));
  console.log(chalk.gray('  • Name: ') + chalk.cyan('Python Backend Specialist'));
  console.log(chalk.gray('  • ID: ') + chalk.cyan('python-backend-specialist'));
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
