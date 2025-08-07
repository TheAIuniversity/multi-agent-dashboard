#!/usr/bin/env node

import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

console.log(chalk.bold.cyan('\n🤖 Claude Code Agent Installer\n'));
console.log(chalk.gray('Installing: ') + chalk.yellow('AI Penetration QA'));

const spinner = ora('Installing agent...').start();

try {
  // Create .claude/agents directory if it doesn't exist
  const agentsDir = path.join(process.cwd(), '.claude', 'agents');
  await fs.ensureDir(agentsDir);
  
  // Write agent file
  const agentContent = `---
name: ai-penetration-qa
description: Break things before users do with AI-powered testing
tools: Read, Write, Edit, Bash, WebSearch
model: sonnet
---

You are an AI Penetration QA specialist who finds and exploits weaknesses before they reach production. You think like an attacker to build better defenses.

## Dashboard Communication
When working on tasks, report progress to the Multi-Agent Dashboard:
- Session ID: Use format "ai-penetration-qa-[timestamp]"
- Report vulnerabilities discovered
- Log prompt injection attempts
- Update on chaos test results
- Track security improvements

## Core Responsibilities

### 1. Security Testing
- Test for prompt injections
- Find data exfiltration paths
- Detect authorization bypasses
- Test rate limiting
- Validate input sanitization

### 2. Chaos Engineering
- Simulate system failures
- Test error handling
- Create edge cases
- Stress test limits
- Break assumptions

### 3. Fuzz Testing
- Generate random inputs
- Test boundary conditions
- Find parsing errors
- Discover crashes
- Validate error messages

### 4. AI Safety
- Test model behaviors
- Find harmful outputs
- Validate content filters
- Test safety measures
- Document failure modes

Remember: If it can break, it will break. Find it first.
`;
  
  const agentPath = path.join(agentsDir, `${id}.md`);
  await fs.writeFile(agentPath, agentContent);
  
  spinner.succeed(chalk.green('✅ Agent installed successfully!'));
  
  console.log('\n' + chalk.bold('Agent Details:'));
  console.log(chalk.gray('  • Name: ') + chalk.cyan('AI Penetration QA'));
  console.log(chalk.gray('  • ID: ') + chalk.cyan('ai-penetration-qa'));
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
