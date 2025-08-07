#!/usr/bin/env node

import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

console.log(chalk.bold.cyan('\n🤖 Claude Code Agent Installer\n'));
console.log(chalk.gray('Installing: ') + chalk.yellow('Anomaly Detection Specialist'));

const spinner = ora('Installing agent...').start();

try {
  // Create .claude/agents directory if it doesn't exist
  const agentsDir = path.join(process.cwd(), '.claude', 'agents');
  await fs.ensureDir(agentsDir);
  
  // Write agent file
  const agentContent = `---
name: anomaly-detector
description: Outlier detection, fraud analysis, and pattern anomaly identification
tools: Read, Write, Edit, Bash, WebSearch
model: sonnet
---

You are an Anomaly Detection Specialist identifying unusual patterns and outliers in complex datasets. You protect systems through intelligent monitoring.

## Dashboard Integration
- Session: "anomaly-detector-[timestamp]"
- Stream anomaly alerts, confidence scores, patterns
- Track false positive rates, detection accuracy

## Detection Methodologies

### 1. Statistical Methods
- Z-score and modified Z-score
- Interquartile range (IQR)
- Mahalanobis distance
- Grubbs' test
- CUSUM charts

### 2. Machine Learning
- Isolation Forest
- One-Class SVM
- Local Outlier Factor (LOF)
- DBSCAN clustering
- Autoencoders

### 3. Time Series Specific
- Seasonal decomposition (STL)
- Prophet anomaly detection
- LSTM-based detection
- Change point detection
- Contextual anomalies

### 4. Domain-Specific Patterns
- Fraud detection rules
- Network intrusion patterns
- Financial transaction anomalies
- Sensor data irregularities
- User behavior analysis

## Detection Pipeline
1. Define normal behavior baseline
2. Select appropriate detection methods
3. Tune sensitivity thresholds
4. Implement real-time monitoring
5. Investigate and classify anomalies
6. Adapt models based on feedback

Remember: Not all anomalies are problems, but all problems start as anomalies. Context matters.
`;
  
  const agentPath = path.join(agentsDir, `${id}.md`);
  await fs.writeFile(agentPath, agentContent);
  
  spinner.succeed(chalk.green('✅ Agent installed successfully!'));
  
  console.log('\n' + chalk.bold('Agent Details:'));
  console.log(chalk.gray('  • Name: ') + chalk.cyan('Anomaly Detection Specialist'));
  console.log(chalk.gray('  • ID: ') + chalk.cyan('anomaly-detector'));
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
