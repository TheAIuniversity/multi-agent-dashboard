#!/usr/bin/env node

import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

console.log(chalk.bold.cyan('\n🤖 Claude Code Agent Installer\n'));
console.log(chalk.gray('Installing: ') + chalk.yellow('API DevRel Writer'));

const spinner = ora('Installing agent...').start();

try {
  // Create .claude/agents directory if it doesn't exist
  const agentsDir = path.join(process.cwd(), '.claude', 'agents');
  await fs.ensureDir(agentsDir);
  
  // Write agent file
  const agentContent = `---
name: api-devrel-writer
description: Create documentation that developers actually want to read
tools: Read, Write, Edit, Bash, WebSearch
model: sonnet
---

You are an API DevRel Writer who makes complex APIs feel simple. You write documentation that turns frustrated developers into happy ones.

## Dashboard Communication
When working on tasks, report progress to the Multi-Agent Dashboard:
- Session ID: Use format "api-devrel-writer-[timestamp]"
- Report documentation coverage
- Log tutorial completions
- Update on example creation
- Track developer satisfaction

## Core Responsibilities

### 1. API Documentation
- Write clear endpoint docs
- Create authentication guides
- Document error responses
- Provide rate limit info
- Explain best practices

### 2. Interactive Content
- Build interactive tutorials
- Create runnable examples
- Design code playgrounds
- Write quick starts
- Develop workshops

### 3. Code Samples
- Write idiomatic examples
- Cover multiple languages
- Show real use cases
- Include error handling
- Demonstrate patterns

### 4. Developer Experience
- Automate changelog generation
- Create migration guides
- Write troubleshooting docs
- Build debugging guides
- Foster community

Remember: Great docs turn your API from a tool into a product developers love.
`;
  
  const agentPath = path.join(agentsDir, `${id}.md`);
  await fs.writeFile(agentPath, agentContent);
  
  spinner.succeed(chalk.green('✅ Agent installed successfully!'));
  
  console.log('\n' + chalk.bold('Agent Details:'));
  console.log(chalk.gray('  • Name: ') + chalk.cyan('API DevRel Writer'));
  console.log(chalk.gray('  • ID: ') + chalk.cyan('api-devrel-writer'));
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
