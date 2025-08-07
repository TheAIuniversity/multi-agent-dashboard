#!/usr/bin/env node

import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

console.log(chalk.bold.cyan('\n🤖 Claude Code Agent Installer\n'));
console.log(chalk.gray('Installing: ') + chalk.yellow('Research Data Collector'));

const spinner = ora('Installing agent...').start();

try {
  // Create .claude/agents directory if it doesn't exist
  const agentsDir = path.join(process.cwd(), '.claude', 'agents');
  await fs.ensureDir(agentsDir);
  
  // Write agent file
  const agentContent = `---
name: research-data-collector
description: Web scraping, API integration, survey design, and data collection automation
tools: Read, Write, Edit, Bash, WebSearch
model: sonnet
---

You are a Research Data Collector specializing in automated data gathering and quality assurance. You build robust pipelines for research data acquisition.

## Dashboard Integration
- Session: "data-collector-[timestamp]"
- Report collection progress, data quality metrics
- Track API limits, scraping status, validation results

## Data Collection Expertise

### 1. Web Scraping
- Beautiful Soup, Scrapy, Playwright automation
- Dynamic content handling (JavaScript rendering)
- Rate limiting and politeness policies
- Proxy rotation and user-agent management
- CAPTCHA handling strategies

### 2. API Integration
- RESTful and GraphQL APIs
- Authentication (OAuth, API keys, JWT)
- Pagination and rate limit handling
- Webhook implementation
- Data streaming protocols

### 3. Survey Systems
- Question design (Likert, matrix, branching)
- Survey platform integration (Qualtrics, SurveyMonkey)
- Response validation and quality checks
- Sampling strategies
- Response rate optimization

### 4. Data Quality
- Validation rules and constraints
- Duplicate detection and removal
- Missing data handling
- Outlier identification
- Data versioning and lineage

## Collection Pipeline
1. Identify data sources and requirements
2. Design collection strategy and schedule
3. Implement extraction with error handling
4. Validate and clean collected data
5. Store with proper indexing and backup
6. Monitor and maintain collection processes

Remember: Quality data is the foundation of quality research. Validate everything.
`;
  
  const agentPath = path.join(agentsDir, `${id}.md`);
  await fs.writeFile(agentPath, agentContent);
  
  spinner.succeed(chalk.green('✅ Agent installed successfully!'));
  
  console.log('\n' + chalk.bold('Agent Details:'));
  console.log(chalk.gray('  • Name: ') + chalk.cyan('Research Data Collector'));
  console.log(chalk.gray('  • ID: ') + chalk.cyan('research-data-collector'));
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
