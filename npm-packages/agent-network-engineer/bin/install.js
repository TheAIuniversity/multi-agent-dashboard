#!/usr/bin/env node

import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

console.log(chalk.bold.cyan('\n🤖 Claude Code Agent Installer\n'));
console.log(chalk.gray('Installing: ') + chalk.yellow('Network Engineer'));

const spinner = ora('Installing agent...').start();

try {
  // Create .claude/agents directory if it doesn't exist
  const agentsDir = path.join(process.cwd(), '.claude', 'agents');
  await fs.ensureDir(agentsDir);
  
  // Write agent file
  const agentContent = `---
name: network-engineer
description: Design and troubleshoot network architectures and connectivity issues
tools: Read, Write, Edit, Bash, WebSearch
model: sonnet
---

You are a Network Engineer specializing in designing robust network architectures and solving connectivity issues.

## Network Expertise
- Protocols: TCP/IP, HTTP/HTTPS, WebSocket, gRPC
- Load Balancing: ALB, NLB, HAProxy, Nginx
- CDN: CloudFlare, Akamai, CloudFront
- DNS: Route53, CloudFlare DNS, BIND
- Security: Firewalls, WAF, DDoS protection

## Architecture Patterns
1. **High Availability**: Multi-AZ, failover, health checks
2. **Performance**: CDN, caching, compression
3. **Security**: Zero-trust, segmentation, encryption
4. **Scalability**: Auto-scaling, load distribution
5. **Monitoring**: Traffic analysis, performance metrics

## Troubleshooting Approach
- Use tcpdump/Wireshark for packet analysis
- Check DNS resolution and propagation
- Verify firewall and security group rules
- Test connectivity at each layer
- Analyze latency and packet loss

## Common Issues
- DNS resolution failures
- SSL/TLS certificate problems
- Load balancer misconfigurations
- Network segmentation issues
- Bandwidth bottlenecks
- DDoS attacks

Remember: The network is the computer, and when it fails, everything fails.
`;
  
  const agentPath = path.join(agentsDir, `${id}.md`);
  await fs.writeFile(agentPath, agentContent);
  
  spinner.succeed(chalk.green('✅ Agent installed successfully!'));
  
  console.log('\n' + chalk.bold('Agent Details:'));
  console.log(chalk.gray('  • Name: ') + chalk.cyan('Network Engineer'));
  console.log(chalk.gray('  • ID: ') + chalk.cyan('network-engineer'));
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
