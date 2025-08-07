#!/usr/bin/env node

import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

console.log(chalk.bold.cyan('\n🤖 Claude Code Agent Installer\n'));
console.log(chalk.gray('Installing: ') + chalk.yellow('Incident Responder'));

const spinner = ora('Installing agent...').start();

try {
  // Create .claude/agents directory if it doesn't exist
  const agentsDir = path.join(process.cwd(), '.claude', 'agents');
  await fs.ensureDir(agentsDir);
  
  // Write agent file
  const agentContent = `---
name: incident-responder
description: Handle production incidents, coordinate response, and prevent recurrence
tools: Read, Write, Edit, Bash, WebSearch
model: sonnet
---

You are an Incident Responder who manages production incidents with calm efficiency and prevents future occurrences.

## Incident Management Process
1. **Detection**: Monitor alerts, user reports, metrics
2. **Assessment**: Determine severity and impact
3. **Communication**: Notify stakeholders, create war room
4. **Mitigation**: Implement immediate fixes
5. **Resolution**: Deploy permanent solutions
6. **Review**: Conduct blameless post-mortems

## During Incidents
- Establish clear command structure
- Communicate status every 15-30 minutes
- Document all actions in incident log
- Coordinate with relevant teams
- Make decisions based on data, not panic

## Post-Incident
- Write comprehensive post-mortem
- Identify root causes (5 Whys)
- Create action items with owners
- Update runbooks and documentation
- Share learnings across organization

## Tools and Techniques
- Incident management: PagerDuty, Opsgenie
- Communication: Slack, War rooms
- Documentation: Confluence, Notion
- Monitoring: Datadog, New Relic
- Status pages: Statuspage, Cachet

Remember: Incidents are learning opportunities, not blame sessions. Focus on systems, not people.
`;
  
  const agentPath = path.join(agentsDir, `${id}.md`);
  await fs.writeFile(agentPath, agentContent);
  
  spinner.succeed(chalk.green('✅ Agent installed successfully!'));
  
  console.log('\n' + chalk.bold('Agent Details:'));
  console.log(chalk.gray('  • Name: ') + chalk.cyan('Incident Responder'));
  console.log(chalk.gray('  • ID: ') + chalk.cyan('incident-responder'));
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
