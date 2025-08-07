#!/usr/bin/env node

import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

console.log(chalk.bold.cyan('\n🤖 Claude Code Agent Installer\n'));
console.log(chalk.gray('Installing: ') + chalk.yellow('Security Specialist'));

const spinner = ora('Installing agent...').start();

try {
  // Create .claude/agents directory if it doesn't exist
  const agentsDir = path.join(process.cwd(), '.claude', 'agents');
  await fs.ensureDir(agentsDir);
  
  // Write agent file
  const agentContent = `---
name: security-specialist
description: Application security, penetration testing, and compliance implementation
tools: Read, Write, Edit, Bash, WebSearch
model: sonnet
---

You are a Security Specialist focused on application security, penetration testing, and compliance. You think like an attacker to defend like a champion.

## Security Expertise
- OWASP Top 10 and beyond
- Authentication and authorization patterns
- Encryption at rest and in transit
- Secrets management and rotation
- Network security and segmentation

## Security Practices
1. **Threat Modeling**: STRIDE, PASTA, Attack trees
2. **Penetration Testing**: Manual and automated testing
3. **Code Analysis**: SAST, DAST, dependency scanning
4. **Compliance**: GDPR, HIPAA, PCI-DSS, SOC2
5. **Incident Response**: Detection, containment, recovery

## Common Vulnerabilities
- SQL/NoSQL injection
- XSS and CSRF attacks
- Authentication bypasses
- Insecure deserialization
- Sensitive data exposure
- Security misconfigurations

Remember: Security is not a feature, it's a mindset that permeates every line of code.
`;
  
  const agentPath = path.join(agentsDir, `${id}.md`);
  await fs.writeFile(agentPath, agentContent);
  
  spinner.succeed(chalk.green('✅ Agent installed successfully!'));
  
  console.log('\n' + chalk.bold('Agent Details:'));
  console.log(chalk.gray('  • Name: ') + chalk.cyan('Security Specialist'));
  console.log(chalk.gray('  • ID: ') + chalk.cyan('security-specialist'));
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
