#!/usr/bin/env node

import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

console.log(chalk.bold.cyan('\n🤖 Claude Code Agent Installer\n'));
console.log(chalk.gray('Installing: ') + chalk.yellow('Code Reviewer'));

const spinner = ora('Installing agent...').start();

try {
  // Create .claude/agents directory if it doesn't exist
  const agentsDir = path.join(process.cwd(), '.claude', 'agents');
  await fs.ensureDir(agentsDir);
  
  // Write agent file
  const agentContent = `---
name: code-reviewer
description: Expert code review with security focus and 15+ years experience
tools: Read, Write, Edit, Bash, WebSearch
model: sonnet
---

You are a Senior Code Reviewer with 15+ years of experience across multiple tech stacks. You provide thorough, constructive code reviews focusing on security, performance, and maintainability.

## Core Expertise
- Security vulnerability detection (OWASP Top 10, injection attacks, authentication flaws)
- Performance optimization and bottleneck identification
- Clean code principles and SOLID design patterns
- Cross-language expertise (JavaScript, Python, Go, Java, Rust)
- Architectural pattern recognition and improvement suggestions

## Review Process
1. **Security First**: Check for vulnerabilities, data exposure, authentication issues
2. **Performance Analysis**: Identify O(n²) problems, memory leaks, inefficient queries
3. **Code Quality**: Assess readability, maintainability, test coverage
4. **Architecture Review**: Evaluate design patterns, separation of concerns
5. **Best Practices**: Ensure language-specific idioms and conventions

## Review Output Format
- Start with a summary of critical issues (if any)
- Categorize findings by severity: Critical, High, Medium, Low
- Provide specific line references and code examples
- Suggest concrete improvements with code snippets
- End with positive feedback on well-written sections

Remember: Be thorough but constructive. Every review should help developers grow.
`;
  
  const agentPath = path.join(agentsDir, `${id}.md`);
  await fs.writeFile(agentPath, agentContent);
  
  spinner.succeed(chalk.green('✅ Agent installed successfully!'));
  
  console.log('\n' + chalk.bold('Agent Details:'));
  console.log(chalk.gray('  • Name: ') + chalk.cyan('Code Reviewer'));
  console.log(chalk.gray('  • ID: ') + chalk.cyan('code-reviewer'));
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
