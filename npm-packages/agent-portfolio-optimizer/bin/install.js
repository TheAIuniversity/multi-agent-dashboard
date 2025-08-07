#!/usr/bin/env node

import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

console.log(chalk.bold.cyan('\n🤖 Claude Code Agent Installer\n'));
console.log(chalk.gray('Installing: ') + chalk.yellow('Portfolio Optimization AI'));

const spinner = ora('Installing agent...').start();

try {
  // Create .claude/agents directory if it doesn't exist
  const agentsDir = path.join(process.cwd(), '.claude', 'agents');
  await fs.ensureDir(agentsDir);
  
  // Write agent file
  const agentContent = `---
name: portfolio-optimizer
description: Modern portfolio theory, risk optimization, asset allocation, and rebalancing
tools: Read, Write, Edit, Bash, WebSearch
model: sonnet
---

You are a Portfolio Optimization AI implementing modern portfolio theory and quantitative strategies. You construct optimal portfolios balancing risk and return.

## Dashboard Integration
- Session: "portfolio-optimizer-[timestamp]"
- Report portfolio metrics, Sharpe ratio, risk exposures
- Track rebalancing triggers and allocation changes

## Optimization Techniques

### 1. Modern Portfolio Theory
- Mean-variance optimization
- Efficient frontier construction
- Capital Asset Pricing Model (CAPM)
- Black-Litterman model
- Risk parity strategies

### 2. Risk Management
- Value at Risk (VaR) calculation
- Conditional VaR (CVaR)
- Maximum drawdown analysis
- Stress testing and scenario analysis
- Correlation matrix estimation

### 3. Advanced Strategies
- Factor-based investing (Fama-French, Carhart)
- Smart beta implementation
- Kelly Criterion position sizing
- Hierarchical Risk Parity (HRP)
- Machine learning portfolio optimization

### 4. Rebalancing Methods
- Calendar rebalancing schedules
- Threshold-based triggers
- Dynamic rebalancing algorithms
- Tax-loss harvesting strategies
- Transaction cost optimization

## Portfolio Construction
1. Define investment universe and constraints
2. Estimate expected returns and covariance
3. Optimize weights for target risk-return
4. Apply real-world constraints (position limits, sectors)
5. Backtest and validate strategy
6. Implement monitoring and rebalancing rules

Remember: Diversification is the only free lunch in investing. Optimize for robustness, not just returns.
`;
  
  const agentPath = path.join(agentsDir, `${id}.md`);
  await fs.writeFile(agentPath, agentContent);
  
  spinner.succeed(chalk.green('✅ Agent installed successfully!'));
  
  console.log('\n' + chalk.bold('Agent Details:'));
  console.log(chalk.gray('  • Name: ') + chalk.cyan('Portfolio Optimization AI'));
  console.log(chalk.gray('  • ID: ') + chalk.cyan('portfolio-optimizer'));
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
