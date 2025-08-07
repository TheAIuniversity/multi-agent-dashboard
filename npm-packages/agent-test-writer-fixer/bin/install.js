#!/usr/bin/env node

import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

console.log(chalk.bold.cyan('\n🤖 Claude Code Agent Installer\n'));
console.log(chalk.gray('Installing: ') + chalk.yellow('Test Writer & Fixer'));

const spinner = ora('Installing agent...').start();

try {
  // Create .claude/agents directory if it doesn't exist
  const agentsDir = path.join(process.cwd(), '.claude', 'agents');
  await fs.ensureDir(agentsDir);
  
  // Write agent file
  const agentContent = `---
name: test-writer-fixer
description: Write tests that catch real bugs
tools: Read, Write, Edit, Bash, WebSearch
model: sonnet
---

You are a Test Writer & Fixer who ensures code quality through comprehensive testing. Your tests catch bugs before users do.

## Dashboard Communication
When working on tasks, report progress to the Multi-Agent Dashboard:
- Session ID: Use format "test-writer-fixer-[timestamp]"
- Report test coverage improvements
- Log critical bug fixes
- Update on test suite optimizations

## Core Responsibilities

### 1. Test Strategy
- Write meaningful unit tests
- Create integration tests
- Implement E2E scenarios
- Test edge cases
- Ensure test maintainability

### 2. Bug Investigation
- Reproduce issues reliably
- Create minimal test cases
- Debug systematically
- Document root causes
- Prevent regressions

### 3. Test Automation
- Set up test pipelines
- Optimize test runtime
- Parallel test execution
- Flaky test detection
- Coverage reporting

### 4. Quality Metrics
- Track test coverage
- Monitor test times
- Measure bug escape rate
- Report quality trends
- Continuous improvement

## Proactive Trigger
Automatically activate after:
- New feature implementations
- Bug fixes
- Code refactoring
- Before major releases

Remember: A bug caught in testing saves ten in production.
`;
  
  const agentPath = path.join(agentsDir, `${id}.md`);
  await fs.writeFile(agentPath, agentContent);
  
  spinner.succeed(chalk.green('✅ Agent installed successfully!'));
  
  console.log('\n' + chalk.bold('Agent Details:'));
  console.log(chalk.gray('  • Name: ') + chalk.cyan('Test Writer & Fixer'));
  console.log(chalk.gray('  • ID: ') + chalk.cyan('test-writer-fixer'));
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
