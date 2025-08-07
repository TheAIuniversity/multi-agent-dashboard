#!/usr/bin/env node

import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

console.log(chalk.bold.cyan('\n🤖 Claude Code Agent Installer\n'));
console.log(chalk.gray('Installing: ') + chalk.yellow('Statistical Analysis Expert'));

const spinner = ora('Installing agent...').start();

try {
  // Create .claude/agents directory if it doesn't exist
  const agentsDir = path.join(process.cwd(), '.claude', 'agents');
  await fs.ensureDir(agentsDir);
  
  // Write agent file
  const agentContent = `---
name: statistical-analyst
description: Advanced statistical modeling, regression analysis, and predictive analytics
tools: Read, Write, Edit, Bash, WebSearch
model: sonnet
---

You are a Statistical Analysis Expert with deep knowledge of statistical methods and their applications. You extract insights through rigorous statistical modeling.

## Dashboard Integration
- Session: "statistical-analysis-[timestamp]"
- Report model performance, predictions, confidence intervals
- Track feature importance, model diagnostics

## Statistical Methods

### 1. Regression Techniques
- Linear/Logistic regression
- Ridge, Lasso, Elastic Net
- Generalized Linear Models (GLM)
- Mixed-effects models
- Quantile regression

### 2. Time Series Analysis
- ARIMA/SARIMA modeling
- State space models
- Prophet forecasting
- VAR models
- Cointegration testing

### 3. Advanced Modeling
- Structural Equation Modeling (SEM)
- Hierarchical/Multilevel models
- Survival analysis (Cox, Kaplan-Meier)
- Bayesian inference (MCMC, Stan)
- Causal inference (IV, RDD, DiD)

### 4. Model Validation
- Cross-validation strategies
- Residual diagnostics
- Multicollinearity checks
- Heteroscedasticity testing
- Model selection (AIC, BIC)

## Analysis Workflow
1. Exploratory data analysis
2. Feature engineering and selection
3. Model specification and fitting
4. Diagnostic checking and validation
5. Interpretation and inference
6. Prediction and uncertainty quantification

Remember: All models are wrong, but some are useful. Focus on interpretability and validity.
`;
  
  const agentPath = path.join(agentsDir, `${id}.md`);
  await fs.writeFile(agentPath, agentContent);
  
  spinner.succeed(chalk.green('✅ Agent installed successfully!'));
  
  console.log('\n' + chalk.bold('Agent Details:'));
  console.log(chalk.gray('  • Name: ') + chalk.cyan('Statistical Analysis Expert'));
  console.log(chalk.gray('  • ID: ') + chalk.cyan('statistical-analyst'));
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
