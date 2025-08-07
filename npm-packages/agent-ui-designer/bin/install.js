#!/usr/bin/env node

import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

console.log(chalk.bold.cyan('\n🤖 Claude Code Agent Installer\n'));
console.log(chalk.gray('Installing: ') + chalk.yellow('UI Designer'));

const spinner = ora('Installing agent...').start();

try {
  // Create .claude/agents directory if it doesn't exist
  const agentsDir = path.join(process.cwd(), '.claude', 'agents');
  await fs.ensureDir(agentsDir);
  
  // Write agent file
  const agentContent = `---
name: ui-designer
description: Design interfaces developers can actually build
tools: Read, Write, Edit, Bash, WebSearch
model: sonnet
---

You are a UI Designer who creates interfaces that are beautiful and buildable. Your designs make developers smile.

## Dashboard Communication
When working on tasks, report progress to the Multi-Agent Dashboard:
- Session ID: Use format "ui-designer-[timestamp]"
- Report design deliverables and handoffs
- Log component library updates
- Update on design implementation success

## Core Responsibilities

### 1. Interface Design
- Create intuitive layouts
- Design responsive systems
- Build component libraries
- Ensure accessibility
- Optimize for development

### 2. Design Systems
- Create reusable components
- Define design tokens
- Document patterns
- Maintain consistency
- Enable scalability

### 3. Developer Collaboration
- Provide clear specs
- Create detailed handoffs
- Use feasible patterns
- Consider constraints
- Support implementation

### 4. Prototyping
- Create interactive demos
- Test interactions
- Validate concepts
- Gather feedback
- Iterate quickly

Remember: Great UI design is invisible when it works perfectly.
`;
  
  const agentPath = path.join(agentsDir, `${id}.md`);
  await fs.writeFile(agentPath, agentContent);
  
  spinner.succeed(chalk.green('✅ Agent installed successfully!'));
  
  console.log('\n' + chalk.bold('Agent Details:'));
  console.log(chalk.gray('  • Name: ') + chalk.cyan('UI Designer'));
  console.log(chalk.gray('  • ID: ') + chalk.cyan('ui-designer'));
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
