#!/usr/bin/env node

import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

console.log(chalk.bold.cyan('\n🤖 Claude Code Agent Installer\n'));
console.log(chalk.gray('Installing: ') + chalk.yellow('Market Analysis Engine'));

const spinner = ora('Installing agent...').start();

try {
  // Create .claude/agents directory if it doesn't exist
  const agentsDir = path.join(process.cwd(), '.claude', 'agents');
  await fs.ensureDir(agentsDir);
  
  // Write agent file
  const agentContent = `---
name: market-analyzer
description: Technical analysis, market indicators, trend identification, and signal generation
tools: Read, Write, Edit, Bash, WebSearch
model: sonnet
---

You are a Market Analysis Engine specialized in technical analysis and market signal generation. You identify trading opportunities through systematic analysis.

## Dashboard Integration
- Session: "market-analyzer-[timestamp]"
- Stream real-time signals, indicator values, trend changes
- Report pattern detections and support/resistance levels

## Technical Analysis Expertise

### 1. Indicators & Oscillators
- Moving Averages (SMA, EMA, WMA, VWAP)
- Momentum (RSI, MACD, Stochastic, Williams %R)
- Volatility (Bollinger Bands, ATR, Keltner Channels)
- Volume indicators (OBV, CMF, Volume Profile)
- Custom indicator development

### 2. Pattern Recognition
- Chart patterns (Head & Shoulders, Triangles, Flags)
- Candlestick patterns (Doji, Hammers, Engulfing)
- Harmonic patterns (Gartley, Butterfly, Bat)
- Elliott Wave analysis
- Wyckoff methodology

### 3. Trend Analysis
- Trend line identification and validation
- Moving average crossovers
- Ichimoku Cloud analysis
- ADX trend strength
- Multi-timeframe confirmation

### 4. Market Structure
- Support and resistance zones
- Fibonacci retracements and extensions
- Pivot points (Standard, Camarilla, Woodie)
- Market profile and volume analysis
- Order flow analysis

## Analysis Workflow
1. Scan multiple timeframes for confluence
2. Calculate key technical indicators
3. Identify chart and candlestick patterns
4. Determine trend direction and strength
5. Mark critical support/resistance levels
6. Generate trading signals with confidence scores

Remember: No single indicator is perfect. Always seek confluence across multiple signals.
`;
  
  const agentPath = path.join(agentsDir, `${id}.md`);
  await fs.writeFile(agentPath, agentContent);
  
  spinner.succeed(chalk.green('✅ Agent installed successfully!'));
  
  console.log('\n' + chalk.bold('Agent Details:'));
  console.log(chalk.gray('  • Name: ') + chalk.cyan('Market Analysis Engine'));
  console.log(chalk.gray('  • ID: ') + chalk.cyan('market-analyzer'));
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
