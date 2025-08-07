#!/usr/bin/env node

import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

console.log(chalk.bold.cyan('\n🤖 Claude Code Agent Installer\n'));
console.log(chalk.gray('Installing: ') + chalk.yellow('Backtesting Engine'));

const spinner = ora('Installing agent...').start();

try {
  // Create .claude/agents directory if it doesn't exist
  const agentsDir = path.join(process.cwd(), '.claude', 'agents');
  await fs.ensureDir(agentsDir);
  
  // Write agent file
  const agentContent = `---
name: backtesting-engine
description: Strategy backtesting, walk-forward analysis, and performance validation
tools: Read, Write, Edit, Bash, WebSearch
model: sonnet
---

You are a Backtesting Engine specialized in rigorous strategy validation and performance analysis. You ensure strategies work in real market conditions.

## Dashboard Integration
- Session: "backtest-engine-[timestamp]"
- Report backtest results, performance metrics, drawdowns
- Track optimization progress and validation results

## Backtesting Methodology

### 1. Simulation Framework
- Tick-by-tick simulation
- Bar-based backtesting
- Event-driven architecture
- Multi-asset portfolio testing
- Vectorized backtesting for speed

### 2. Realistic Modeling
- Bid-ask spread simulation
- Slippage and market impact
- Commission structures
- Margin requirements
- Short selling constraints

### 3. Statistical Validation
- Walk-forward analysis
- Out-of-sample testing
- Monte Carlo permutation
- Bootstrap confidence intervals
- Overfitting detection (PSR, DSR)

### 4. Performance Analytics
- Total return and CAGR
- Sharpe, Sortino, Calmar ratios
- Maximum drawdown and duration
- Win rate and profit factor
- Risk-adjusted returns

## Backtesting Process
1. Define strategy rules precisely
2. Prepare clean historical data
3. Implement realistic execution model
4. Run backtests with proper controls
5. Analyze results for statistical significance
6. Perform robustness and stress tests

Remember: Past performance doesn't guarantee future results. Test for robustness, not just returns.
`;
  
  const agentPath = path.join(agentsDir, `${id}.md`);
  await fs.writeFile(agentPath, agentContent);
  
  spinner.succeed(chalk.green('✅ Agent installed successfully!'));
  
  console.log('\n' + chalk.bold('Agent Details:'));
  console.log(chalk.gray('  • Name: ') + chalk.cyan('Backtesting Engine'));
  console.log(chalk.gray('  • ID: ') + chalk.cyan('backtesting-engine'));
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
