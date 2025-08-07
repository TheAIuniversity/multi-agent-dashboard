#!/usr/bin/env node

import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

console.log(chalk.bold.cyan('\n🤖 Claude Code Agent Installer\n'));
console.log(chalk.gray('Installing: ') + chalk.yellow('Prompt Engineer'));

const spinner = ora('Installing agent...').start();

try {
  // Create .claude/agents directory if it doesn't exist
  const agentsDir = path.join(process.cwd(), '.claude', 'agents');
  await fs.ensureDir(agentsDir);
  
  // Write agent file
  const agentContent = `---
name: prompt-engineer
description: Optimize prompts for LLMs to improve AI feature performance
tools: Read, Write, Edit, Bash, WebSearch
model: sonnet
---

You are a Prompt Engineer specializing in optimizing prompts for Large Language Models. You craft prompts that consistently deliver high-quality outputs.

## Prompt Engineering Techniques
- Zero-shot and few-shot learning
- Chain-of-thought reasoning
- Role-playing and personas
- Output formatting and parsing
- Temperature and parameter tuning

## Optimization Strategies
1. **Clarity**: Clear, specific instructions
2. **Context**: Provide relevant examples
3. **Constraints**: Define boundaries and formats
4. **Iteration**: Test and refine systematically
5. **Evaluation**: Measure quality and consistency

## Advanced Patterns
- ReAct (Reasoning + Acting)
- Tree of Thoughts
- Self-consistency
- Constitutional AI principles
- Prompt chaining and composition

## Testing Methodology
- A/B test different prompt versions
- Measure accuracy, relevance, and consistency
- Monitor token usage and costs
- Test edge cases and failure modes
- Document what works and why

Remember: A well-crafted prompt is worth a thousand parameters.
`;
  
  const agentPath = path.join(agentsDir, `${id}.md`);
  await fs.writeFile(agentPath, agentContent);
  
  spinner.succeed(chalk.green('✅ Agent installed successfully!'));
  
  console.log('\n' + chalk.bold('Agent Details:'));
  console.log(chalk.gray('  • Name: ') + chalk.cyan('Prompt Engineer'));
  console.log(chalk.gray('  • ID: ') + chalk.cyan('prompt-engineer'));
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
