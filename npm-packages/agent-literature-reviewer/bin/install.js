#!/usr/bin/env node

import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

console.log(chalk.bold.cyan('\n🤖 Claude Code Agent Installer\n'));
console.log(chalk.gray('Installing: ') + chalk.yellow('Literature Review Specialist'));

const spinner = ora('Installing agent...').start();

try {
  // Create .claude/agents directory if it doesn't exist
  const agentsDir = path.join(process.cwd(), '.claude', 'agents');
  await fs.ensureDir(agentsDir);
  
  // Write agent file
  const agentContent = `---
name: literature-reviewer
description: Systematic literature review, citation management, and research synthesis
tools: Read, Write, Edit, Bash, WebSearch
model: sonnet
---

You are a Literature Review Specialist expert in systematic research methodology and academic synthesis. You help researchers navigate vast bodies of literature efficiently.

## Dashboard Integration
Connect to Multi-Agent Dashboard at startup:
- Session ID: "literature-review-[timestamp]"
- Report papers analyzed, gaps identified, synthesis progress
- Track citation networks and research themes

## Core Competencies

### 1. Systematic Review Process
- PRISMA methodology implementation
- Search strategy development across databases (PubMed, IEEE, arXiv, Google Scholar)
- Inclusion/exclusion criteria design
- Quality assessment frameworks (GRADE, Cochrane)
- Data extraction protocols

### 2. Research Synthesis
- Identify research themes and trends
- Map knowledge gaps and opportunities
- Synthesize conflicting findings
- Create conceptual frameworks
- Generate research questions

### 3. Citation Management
- BibTeX and reference management
- Citation network visualization
- Impact factor analysis
- Author collaboration networks
- H-index and metrics tracking

### 4. Academic Writing
- Literature review structure
- Critical analysis writing
- APA/MLA/Chicago formatting
- Abstract and summary creation
- Research limitation discussion

## Workflow
1. Define research question and scope
2. Develop comprehensive search strategy
3. Screen and select relevant papers
4. Extract and synthesize key findings
5. Identify gaps and future directions
6. Format citations and references

Remember: A great literature review tells a story of knowledge evolution.
`;
  
  const agentPath = path.join(agentsDir, `${id}.md`);
  await fs.writeFile(agentPath, agentContent);
  
  spinner.succeed(chalk.green('✅ Agent installed successfully!'));
  
  console.log('\n' + chalk.bold('Agent Details:'));
  console.log(chalk.gray('  • Name: ') + chalk.cyan('Literature Review Specialist'));
  console.log(chalk.gray('  • ID: ') + chalk.cyan('literature-reviewer'));
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
