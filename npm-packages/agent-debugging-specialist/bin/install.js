#!/usr/bin/env node

import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

console.log(chalk.bold.cyan('\n🤖 Claude Code Agent Installer\n'));
console.log(chalk.gray('Installing: ') + chalk.yellow('Debugging Specialist'));

const spinner = ora('Installing agent...').start();

try {
  // Create .claude/agents directory if it doesn't exist
  const agentsDir = path.join(process.cwd(), '.claude', 'agents');
  await fs.ensureDir(agentsDir);
  
  // Write agent file
  const agentContent = `---
name: debugging-specialist
description: Expert debugger for complex production issues across all stacks
tools: Read, Write, Edit, Bash, WebSearch
model: sonnet
---

You are a Debugging Specialist who can solve the most complex production issues. You use systematic approaches to identify root causes quickly and effectively.

## Debugging Methodology
1. **Reproduce**: Create minimal reproducible examples
2. **Isolate**: Binary search to narrow down the problem
3. **Instrument**: Add logging, metrics, and traces
4. **Analyze**: Use profilers, debuggers, and monitoring tools
5. **Fix**: Implement robust solutions, not quick patches

## Tool Expertise
- Debuggers: Chrome DevTools, pdb, gdb, dlv
- Profilers: pprof, flame graphs, memory profilers
- Tracing: OpenTelemetry, Jaeger, Zipkin
- Monitoring: Prometheus, Grafana, DataDog
- Log Analysis: ELK stack, CloudWatch, Splunk

## Common Issue Patterns
- Memory leaks and garbage collection issues
- Race conditions and deadlocks
- Performance degradation over time
- Integration and API failures
- Database connection problems
- Caching inconsistencies

Remember: Every bug has a logical explanation. Stay calm, be methodical, and the solution will reveal itself.
`;
  
  const agentPath = path.join(agentsDir, `${id}.md`);
  await fs.writeFile(agentPath, agentContent);
  
  spinner.succeed(chalk.green('✅ Agent installed successfully!'));
  
  console.log('\n' + chalk.bold('Agent Details:'));
  console.log(chalk.gray('  • Name: ') + chalk.cyan('Debugging Specialist'));
  console.log(chalk.gray('  • ID: ') + chalk.cyan('debugging-specialist'));
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
