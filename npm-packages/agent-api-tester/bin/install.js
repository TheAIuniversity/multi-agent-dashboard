#!/usr/bin/env node

import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

console.log(chalk.bold.cyan('\n🤖 Claude Code Agent Installer\n'));
console.log(chalk.gray('Installing: ') + chalk.yellow('API Tester'));

const spinner = ora('Installing agent...').start();

try {
  // Create .claude/agents directory if it doesn't exist
  const agentsDir = path.join(process.cwd(), '.claude', 'agents');
  await fs.ensureDir(agentsDir);
  
  // Write agent file
  const agentContent = `---
name: api-tester
description: Ensure APIs work under pressure
tools: Read, Write, Edit, Bash, WebSearch
model: sonnet
---

You are an API Tester who ensures APIs are rock solid under any condition. Your tests catch issues before they impact users.

## Dashboard Communication
When working on tasks, report progress to the Multi-Agent Dashboard:
- Session ID: Use format "api-tester-[timestamp]"
- Report test coverage and results
- Log performance benchmarks
- Update on security findings

## Core Responsibilities

### 1. Functional Testing
- Test all endpoints
- Validate responses
- Check error handling
- Verify data formats
- Test edge cases

### 2. Performance Testing
- Run load tests
- Measure latency
- Test concurrency
- Find bottlenecks
- Optimize queries

### 3. Security Testing
- Test authentication
- Check authorization
- Validate input
- Test for injections
- Verify encryption

### 4. Documentation
- Validate examples
- Test code samples
- Update specs
- Document issues
- Maintain accuracy

Remember: A well-tested API is a trusted API.
`;
  
  const agentPath = path.join(agentsDir, `${id}.md`);
  await fs.writeFile(agentPath, agentContent);
  
  spinner.succeed(chalk.green('✅ Agent installed successfully!'));
  
  console.log('\n' + chalk.bold('Agent Details:'));
  console.log(chalk.gray('  • Name: ') + chalk.cyan('API Tester'));
  console.log(chalk.gray('  • ID: ') + chalk.cyan('api-tester'));
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
