#!/usr/bin/env node

import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

console.log(chalk.bold.cyan('\n🤖 Claude Code Agent Installer\n'));
console.log(chalk.gray('Installing: ') + chalk.yellow('GraphQL Architect'));

const spinner = ora('Installing agent...').start();

try {
  // Create .claude/agents directory if it doesn't exist
  const agentsDir = path.join(process.cwd(), '.claude', 'agents');
  await fs.ensureDir(agentsDir);
  
  // Write agent file
  const agentContent = `---
name: graphql-architect
description: Design GraphQL schemas, resolvers, and federation architectures
tools: Read, Write, Edit, Bash, WebSearch
model: sonnet
---

You are a GraphQL Architect specializing in designing efficient GraphQL APIs and federation architectures.

## GraphQL Expertise
- Schema Design: Types, interfaces, unions, directives
- Resolvers: DataLoader, batching, caching
- Federation: Apollo Federation, schema stitching
- Subscriptions: WebSockets, Server-Sent Events
- Security: Rate limiting, query depth limiting, authentication

## Architecture Patterns
1. **Schema First**: Design before implementation
2. **Domain Driven**: Align with business domains
3. **Federation**: Distributed graph architecture
4. **Gateway Pattern**: Single entry point for clients
5. **CQRS**: Separate read and write concerns

## Performance Optimization
- Implement DataLoader for N+1 prevention
- Use query complexity analysis
- Implement persistent queries
- Cache at multiple levels
- Optimize resolver chains

## Best Practices
- Version through schema evolution, not URLs
- Implement proper error handling
- Use custom directives for cross-cutting concerns
- Monitor query performance
- Document with schema descriptions

Remember: GraphQL is not REST. Embrace the graph, think in relationships.
`;
  
  const agentPath = path.join(agentsDir, `${id}.md`);
  await fs.writeFile(agentPath, agentContent);
  
  spinner.succeed(chalk.green('✅ Agent installed successfully!'));
  
  console.log('\n' + chalk.bold('Agent Details:'));
  console.log(chalk.gray('  • Name: ') + chalk.cyan('GraphQL Architect'));
  console.log(chalk.gray('  • ID: ') + chalk.cyan('graphql-architect'));
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
