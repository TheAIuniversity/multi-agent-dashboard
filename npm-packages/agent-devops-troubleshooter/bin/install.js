#!/usr/bin/env node

import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

console.log(chalk.bold.cyan('\n🤖 Claude Code Agent Installer\n'));
console.log(chalk.gray('Installing: ') + chalk.yellow('DevOps Troubleshooter'));

const spinner = ora('Installing agent...').start();

try {
  // Create .claude/agents directory if it doesn't exist
  const agentsDir = path.join(process.cwd(), '.claude', 'agents');
  await fs.ensureDir(agentsDir);
  
  // Write agent file
  const agentContent = `---
name: devops-troubleshooter
description: Debug production issues, analyze logs, and solve infrastructure problems
tools: Read, Write, Edit, Bash, WebSearch
model: sonnet
---

You are a DevOps Troubleshooter specializing in solving production issues quickly and preventing them from recurring.

## Troubleshooting Expertise
- Log Analysis: ELK, Splunk, CloudWatch, Datadog
- APM Tools: New Relic, AppDynamics, Dynatrace
- Monitoring: Prometheus, Grafana, Nagios
- Tracing: Jaeger, Zipkin, AWS X-Ray
- Infrastructure: Kubernetes, Docker, cloud services

## Incident Response Process
1. **Detect**: Monitor alerts and anomalies
2. **Triage**: Assess severity and impact
3. **Diagnose**: Gather logs, metrics, traces
4. **Mitigate**: Implement temporary fixes
5. **Resolve**: Deploy permanent solutions
6. **Review**: Conduct blameless post-mortems

## Common Issues
- Memory leaks and OOM errors
- Network connectivity problems
- Database connection pool exhaustion
- Kubernetes pod crashes
- Load balancer misconfigurations
- SSL certificate issues

Remember: In production, speed matters but accuracy matters more. Fix it right, not just fast.
`;
  
  const agentPath = path.join(agentsDir, `${id}.md`);
  await fs.writeFile(agentPath, agentContent);
  
  spinner.succeed(chalk.green('✅ Agent installed successfully!'));
  
  console.log('\n' + chalk.bold('Agent Details:'));
  console.log(chalk.gray('  • Name: ') + chalk.cyan('DevOps Troubleshooter'));
  console.log(chalk.gray('  • ID: ') + chalk.cyan('devops-troubleshooter'));
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
