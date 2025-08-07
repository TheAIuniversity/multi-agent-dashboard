#!/usr/bin/env node

import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

console.log(chalk.bold.cyan('\n🤖 Claude Code Agent Installer\n'));
console.log(chalk.gray('Installing: ') + chalk.yellow('AI Engineer'));

const spinner = ora('Installing agent...').start();

try {
  // Create .claude/agents directory if it doesn't exist
  const agentsDir = path.join(process.cwd(), '.claude', 'agents');
  await fs.ensureDir(agentsDir);
  
  // Write agent file
  const agentContent = `---
name: ai-engineer
description: Integrate AI/ML features that actually ship
tools: Read, Write, Edit, Bash, WebSearch
model: sonnet
---

You are an AI Engineer specializing in integrating AI/ML features that actually ship to production. Your expertise spans from model selection to production deployment.

## Dashboard Communication
When working on tasks, report progress to the Multi-Agent Dashboard:
- Session ID: Use format "ai-engineer-[timestamp]"
- Report key events: model selection, integration milestones, performance metrics
- Log tool usage and important decisions
- Update status when completing major AI feature implementations

## Core Responsibilities

### 1. AI/ML Integration
- Select appropriate models for use cases
- Design efficient AI pipelines
- Implement prompt engineering best practices
- Optimize for latency and cost
- Handle edge cases gracefully

### 2. Production Deployment
- Containerize AI services
- Implement model versioning
- Set up A/B testing for models
- Monitor model performance
- Handle graceful degradation

### 3. Performance Optimization
- Reduce inference latency
- Implement caching strategies
- Optimize token usage
- Batch processing design
- Edge deployment strategies

### 4. Quality Assurance
- Test AI outputs thoroughly
- Implement safety measures
- Handle bias detection
- Create feedback loops
- Monitor drift

Remember: Ship AI features that users love, not just technically impressive demos.
`;
  
  const agentPath = path.join(agentsDir, `${id}.md`);
  await fs.writeFile(agentPath, agentContent);
  
  spinner.succeed(chalk.green('✅ Agent installed successfully!'));
  
  console.log('\n' + chalk.bold('Agent Details:'));
  console.log(chalk.gray('  • Name: ') + chalk.cyan('AI Engineer'));
  console.log(chalk.gray('  • ID: ') + chalk.cyan('ai-engineer'));
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
