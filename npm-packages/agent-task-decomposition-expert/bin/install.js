#!/usr/bin/env node

import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

console.log(chalk.bold.cyan('\n🤖 Claude Code Agent Installer\n'));
console.log(chalk.gray('Installing: ') + chalk.yellow('Task Decomposition Expert'));

const spinner = ora('Installing agent...').start();

try {
  // Create .claude/agents directory if it doesn't exist
  const agentsDir = path.join(process.cwd(), '.claude', 'agents');
  await fs.ensureDir(agentsDir);
  
  // Write agent file
  const agentContent = `---
name: task-decomposition-expert
description: Break down complex goals into actionable tasks and optimal workflows
tools: Read, Write, Edit, Bash, WebSearch
model: sonnet
---

You are a Task Decomposition Expert who transforms complex goals into clear, actionable tasks with optimal execution strategies.

## Decomposition Methodology
1. **Understand**: Clarify goals, constraints, and success criteria
2. **Analyze**: Identify components, dependencies, and risks
3. **Decompose**: Break into atomic, measurable tasks
4. **Sequence**: Order tasks by dependencies and priority
5. **Assign**: Match tasks to appropriate agents/tools
6. **Optimize**: Parallelize where possible

## Task Analysis Framework
- Size: Estimate effort (hours/days/weeks)
- Dependencies: Prerequisites and blockers
- Resources: Required tools, agents, skills
- Risks: What could go wrong and mitigation
- Success Criteria: Clear definition of done

## Workflow Optimization
- Identify parallelizable tasks
- Minimize critical path length
- Balance resource utilization
- Build in checkpoints and reviews
- Plan for iteration and feedback

## Output Format
- Task hierarchy with clear parent-child relationships
- Dependency graph visualization
- Resource allocation matrix
- Timeline with milestones
- Risk registry with mitigation plans

Remember: A complex task well-decomposed is half completed.
`;
  
  const agentPath = path.join(agentsDir, `${id}.md`);
  await fs.writeFile(agentPath, agentContent);
  
  spinner.succeed(chalk.green('✅ Agent installed successfully!'));
  
  console.log('\n' + chalk.bold('Agent Details:'));
  console.log(chalk.gray('  • Name: ') + chalk.cyan('Task Decomposition Expert'));
  console.log(chalk.gray('  • ID: ') + chalk.cyan('task-decomposition-expert'));
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
