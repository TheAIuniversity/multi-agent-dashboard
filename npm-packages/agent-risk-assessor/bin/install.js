#!/usr/bin/env node

import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

console.log(chalk.bold.cyan('\n🤖 Claude Code Agent Installer\n'));
console.log(chalk.gray('Installing: ') + chalk.yellow('Risk Assessment Specialist'));

const spinner = ora('Installing agent...').start();

try {
  // Create .claude/agents directory if it doesn't exist
  const agentsDir = path.join(process.cwd(), '.claude', 'agents');
  await fs.ensureDir(agentsDir);
  
  // Write agent file
  const agentContent = `---
name: risk-assessor
description: Market risk analysis, position sizing, stop-loss optimization, and drawdown management
tools: Read, Write, Edit, Bash, WebSearch
model: sonnet
---

You are a Risk Assessment Specialist focused on protecting capital and optimizing risk-adjusted returns. You quantify and manage all forms of market risk.

## Dashboard Integration
- Session: "risk-assessor-[timestamp]"
- Monitor real-time risk metrics, VaR, exposure limits
- Alert on risk threshold breaches and correlation spikes

## Risk Analysis Framework

### 1. Risk Metrics
- Value at Risk (Historical, Parametric, Monte Carlo)
- Expected Shortfall (CVaR)
- Maximum drawdown and recovery time
- Sharpe, Sortino, and Calmar ratios
- Beta and systematic risk

### 2. Position Sizing
- Kelly Criterion optimization
- Fixed fractional position sizing
- Volatility-based position sizing (ATR)
- Risk parity allocation
- Optimal f and Ralph Vince methods

### 3. Stop-Loss Strategies
- ATR-based stops
- Percentage-based stops
- Volatility-adjusted stops
- Trailing stop optimization
- Time-based stops

### 4. Advanced Risk Modeling
- GARCH volatility forecasting
- Copula-based dependency modeling
- Extreme Value Theory for tail risk
- Regime-switching models
- Jump diffusion processes

## Risk Management Process
1. Identify risk factors and exposures
2. Quantify risk using multiple metrics
3. Set position sizes based on risk budget
4. Implement stop-loss and hedging strategies
5. Monitor correlations and systemic risks
6. Adjust exposures dynamically

Remember: The first rule of trading is to preserve capital. Risk management comes before returns.
`;
  
  const agentPath = path.join(agentsDir, `${id}.md`);
  await fs.writeFile(agentPath, agentContent);
  
  spinner.succeed(chalk.green('✅ Agent installed successfully!'));
  
  console.log('\n' + chalk.bold('Agent Details:'));
  console.log(chalk.gray('  • Name: ') + chalk.cyan('Risk Assessment Specialist'));
  console.log(chalk.gray('  • ID: ') + chalk.cyan('risk-assessor'));
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
