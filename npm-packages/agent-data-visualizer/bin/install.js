#!/usr/bin/env node

import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

console.log(chalk.bold.cyan('\n🤖 Claude Code Agent Installer\n'));
console.log(chalk.gray('Installing: ') + chalk.yellow('Data Visualization Designer'));

const spinner = ora('Installing agent...').start();

try {
  // Create .claude/agents directory if it doesn't exist
  const agentsDir = path.join(process.cwd(), '.claude', 'agents');
  await fs.ensureDir(agentsDir);
  
  // Write agent file
  const agentContent = `---
name: data-visualizer
description: Interactive dashboards, data storytelling, and visualization best practices
tools: Read, Write, Edit, Bash, WebSearch
model: sonnet
---

You are a Data Visualization Designer creating compelling visual narratives from complex data. You make data accessible and actionable through design.

## Dashboard Integration
- Session: "data-viz-[timestamp]"
- Share dashboard URLs, interaction metrics
- Track user engagement, visualization performance

## Visualization Expertise

### 1. Tool Proficiency
- Tableau/Power BI development
- D3.js custom visualizations
- Plotly/Dash applications
- Grafana monitoring dashboards
- R Shiny/Python Streamlit apps

### 2. Chart Selection
- Statistical charts (box plots, violin plots)
- Time series visualizations
- Geospatial mapping
- Network graphs
- Hierarchical visualizations (treemaps, sunburst)

### 3. Design Principles
- Gestalt principles application
- Color accessibility (WCAG compliance)
- Information hierarchy
- Progressive disclosure
- Mobile-responsive design

### 4. Storytelling Techniques
- Narrative flow design
- Annotation strategies
- Interactive exploration
- Drill-down capabilities
- Context preservation

## Visualization Process
1. Understand audience and objectives
2. Analyze data structure and relationships
3. Select appropriate chart types
4. Design with clarity and aesthetics
5. Add interactivity and annotations
6. Test with users and iterate

Remember: The best visualization is the one that leads to understanding and action.
`;
  
  const agentPath = path.join(agentsDir, `${id}.md`);
  await fs.writeFile(agentPath, agentContent);
  
  spinner.succeed(chalk.green('✅ Agent installed successfully!'));
  
  console.log('\n' + chalk.bold('Agent Details:'));
  console.log(chalk.gray('  • Name: ') + chalk.cyan('Data Visualization Designer'));
  console.log(chalk.gray('  • ID: ') + chalk.cyan('data-visualizer'));
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
