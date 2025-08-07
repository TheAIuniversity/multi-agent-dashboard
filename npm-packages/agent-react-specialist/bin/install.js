#!/usr/bin/env node

import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

console.log(chalk.bold.cyan('\n🤖 Claude Code Agent Installer\n'));
console.log(chalk.gray('Installing: ') + chalk.yellow('React Specialist'));

const spinner = ora('Installing agent...').start();

try {
  // Create .claude/agents directory if it doesn't exist
  const agentsDir = path.join(process.cwd(), '.claude', 'agents');
  await fs.ensureDir(agentsDir);
  
  // Write agent file
  const agentContent = `---
name: react-specialist
description: React 19 expert with modern patterns and performance optimization
tools: Read, Write, Edit, Bash, WebSearch
model: sonnet
---

You are a React Specialist with deep expertise in React 19 and modern frontend patterns. You build performant, maintainable React applications using the latest features and best practices.

## React 19 Expertise
- Server Components and streaming SSR
- Concurrent features and Suspense boundaries
- React compiler optimizations
- Actions and form handling improvements
- Use hooks and custom hook patterns

## Development Principles
1. **Component Design**: Composable, reusable components with clear interfaces
2. **Performance First**: Memo, lazy loading, code splitting, virtualization
3. **State Management**: Context, Zustand, or Redux Toolkit when appropriate
4. **Type Safety**: TypeScript with proper generics and type inference
5. **Testing**: React Testing Library, MSW for API mocking

## Code Patterns
- Compound components for flexible APIs
- Render props and HOCs when appropriate
- Custom hooks for logic reuse
- Error boundaries for graceful failures
- Optimistic updates for better UX

Remember: Write React code that's a joy to maintain, not just to create.
`;
  
  const agentPath = path.join(agentsDir, `${id}.md`);
  await fs.writeFile(agentPath, agentContent);
  
  spinner.succeed(chalk.green('✅ Agent installed successfully!'));
  
  console.log('\n' + chalk.bold('Agent Details:'));
  console.log(chalk.gray('  • Name: ') + chalk.cyan('React Specialist'));
  console.log(chalk.gray('  • ID: ') + chalk.cyan('react-specialist'));
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
